<?php

namespace App\Http\Controllers;

use App\Models\Option;
use App\Models\Question;
use App\Models\QuestionAnswer;
use App\Models\QuizAttempt;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class QuestionAnswerController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth'); // answers belong to the logged-in taker
    }

    /**
     * Create or update an answer for a given question within an attempt.
     * POST /attempts/{attempt}/answers
     *
     * Payload examples:
     *  single/true_false: { "question_id": 12, "option_id": 55 }
     *  multiple:          { "question_id": 12, "option_ids": [55, 56] }
     */
    public function storeOrUpdate(Request $request, QuizAttempt $attempt)
    {
        $this->ensureTaker($attempt, $request);
        $this->ensureNotCompleted($attempt);

        $validated = $request->validate([
            'question_id' => ['required', 'integer', 'exists:questions,id'],
            // accept either option_id or option_ids (normalize below)
            'option_id'   => ['nullable', 'integer', 'exists:options,id'],
            'option_ids'  => ['nullable', 'array'],
            'option_ids.*'=> ['integer', 'exists:options,id'],
        ]);

        // Load question & ensure it belongs to the same quiz as the attempt
        /** @var Question $question */
        $question = Question::with('options:id,question_id,is_correct')
            ->findOrFail($validated['question_id']);

        if ($question->quiz_id !== $attempt->quiz_id) {
            abort(422, 'Question does not belong to this quiz.');
        }

        // Normalize selected option IDs to an array
        $selectedIds = [];
        if (isset($validated['option_ids'])) {
            $selectedIds = array_values(array_unique($validated['option_ids']));
        } elseif (isset($validated['option_id'])) {
            $selectedIds = [$validated['option_id']];
        }

        // Validate by type
        if (in_array($question->type, ['single', 'true_false'], true)) {
            if (count($selectedIds) !== 1) {
                abort(422, 'Exactly one option must be selected for this question.');
            }
        } else { // multiple
            if (count($selectedIds) < 1) {
                abort(422, 'Select at least one option for this question.');
            }
        }

        // Ensure all selected options belong to this question
        $allowedOptionIds = $question->options->pluck('id')->all();
        foreach ($selectedIds as $id) {
            if (!in_array($id, $allowedOptionIds, true)) {
                abort(422, 'One or more options do not belong to this question.');
            }
        }

        // Upsert the answer + selected options and grade atomically
        DB::transaction(function () use ($attempt, $question, $selectedIds) {
            /** @var QuestionAnswer $answer */
            $answer = QuestionAnswer::firstOrCreate(
                ['quiz_attempt_id' => $attempt->id, 'question_id' => $question->id],
                ['is_correct' => false, 'points_awarded' => 0]
            );

            // Sync selected options
            $answer->selectedOptions()->sync($selectedIds);

            // Grade
            [$isCorrect, $points] = $this->grade($question, $selectedIds);
            $answer->update([
                'is_correct'      => $isCorrect,
                'points_awarded'  => $points,
            ]);

            // Keep attempt score and max score in sync
            $attempt->score = $attempt->questionAnswers()->sum('points_awarded');
            if ($attempt->max_score === 0) {
                // snapshot total points at first answer; or always recalc for robustness:
                $attempt->max_score = $attempt->quiz->questions()->sum('points');
            }
            $attempt->saveQuietly();
        });

        return back()->with('success', 'Answer saved.');
    }

    /**
     * Optional: Clear an answer (remove selections and set awarded points to 0).
     * DELETE /attempts/{attempt}/answers/{question}
     */
    public function destroy(Request $request, QuizAttempt $attempt, Question $question)
    {
        $this->ensureTaker($attempt, $request);
        $this->ensureNotCompleted($attempt);

        if ($question->quiz_id !== $attempt->quiz_id) {
            abort(422, 'Question does not belong to this quiz.');
        }

        /** @var QuestionAnswer|null $answer */
        $answer = QuestionAnswer::where('quiz_attempt_id', $attempt->id)
            ->where('question_id', $question->id)
            ->first();

        if ($answer) {
            DB::transaction(function () use ($answer, $attempt) {
                $answer->selectedOptions()->detach();
                $answer->delete();

                // Recompute attempt score
                $attempt->score = $attempt->questionAnswers()->sum('points_awarded');
                $attempt->saveQuietly();
            });
        }

        return back()->with('success', 'Answer cleared.');
    }

    /**
     * Finalize an attempt (no more edits).
     * POST /attempts/{attempt}/finalize
     */
     public function finalize(QuizAttempt $attempt, Request $request)
    {
        // Ensure the user owns this attempt
        if ($attempt->user_id !== $request->user()->id) {
            abort(403);
        }

        // Ensure attempt is not already completed
        if ($attempt->completed_at) {
            return redirect()->route('quizzes.show', $attempt->quiz_id)
                ->with('error', 'This attempt has already been submitted.');
        }

        // Calculate the score from points_awarded in question_answers
        $score = $attempt->answers()->sum('points_awarded');
        
        // Calculate max possible score from the quiz questions
        $maxScore = $attempt->quiz->questions()->sum('points');

        // Update the attempt with scores and mark as completed
        $attempt->update([
            'completed_at' => now(),
            'status' => 'completed',
            'score' => $score,
            'max_score' => $maxScore,
        ]);

        return redirect()->route('quizzes.show', $attempt->quiz_id)
            ->with('success', "Quiz submitted! You scored {$score} out of {$maxScore} points.");
    }


    /**
     * Pure grading rule:
     *  - Correct iff selected set === set of correct option IDs (order-agnostic).
     *  - If correct → full points; else 0 (you can extend to partial credit later).
     *
     * @return array{0:bool,1:int} [$isCorrect, $points]
     */
    protected function grade(Question $question, array $selectedIds): array
    {
        $correctIds = $question->options
            ->where('is_correct', true)
            ->pluck('id')
            ->values()
            ->all();

        sort($correctIds);
        $chosen = array_values($selectedIds);
        sort($chosen);

        $isCorrect = ($correctIds === $chosen);
        $points = $isCorrect ? (int)$question->points : 0;

        return [$isCorrect, $points];
    }

    protected function ensureTaker(QuizAttempt $attempt, Request $request): void
    {
        if (!$request->user() || $attempt->user_id !== $request->user()->id) {
            abort(403, 'You do not have permission to modify this attempt.');
        }
    }

    protected function ensureNotCompleted(QuizAttempt $attempt): void
    {
        if ($attempt->completed_at || $attempt->status === 'completed') {
            abort(422, 'This attempt is already finalized.');
        }
    }
}

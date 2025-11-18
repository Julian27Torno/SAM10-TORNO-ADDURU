<?php

namespace App\Http\Controllers;

use App\Models\Quiz;
use App\Models\Question;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class QuestionController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth');
    }

    /**
     * Store a new question
     */
    public function store(Quiz $quiz, Request $request)
    {
        $this->ensureOwner($quiz, $request);

        // Validate
        $data = $request->validate([
            'prompt' => ['required', 'string', 'max:1000'],
            'type' => ['required', 'in:multiple,true_false,identification'],
            'points' => ['required', 'integer', 'min:1', 'max:100'],
            'options' => ['required', 'array', 'min:1'],
            'options.*.text' => ['required', 'string', 'max:500'],
            'options.*.is_correct' => ['required', 'boolean'],
        ]);

        DB::transaction(function () use ($quiz, $data) {
            // Create question
            $question = $quiz->questions()->create([
                'prompt' => $data['prompt'],
                'type' => $data['type'],
                'points' => $data['points'],
                'position' => $quiz->questions()->max('position') + 1,
            ]);

            // Create options
            foreach ($data['options'] as $index => $optionData) {
                $question->options()->create([
                    'text' => $optionData['text'],
                    'is_correct' => $optionData['is_correct'],
                    'position' => $index,
                ]);
            }

            // ✅ UPDATE QUIZ TOTAL POINTS
            $this->updateQuizTotalPoints($quiz);
        });

        return back()->with('success', 'Question added successfully.');
    }

    /**
     * Update an existing question
     */
    public function update(Question $question, Request $request)
    {
        $this->ensureOwner($question->quiz, $request);

        $data = $request->validate([
            'prompt' => ['required', 'string', 'max:1000'],
            'points' => ['required', 'integer', 'min:1', 'max:100'],
        ]);

        DB::transaction(function () use ($question, $data) {
            $question->update($data);

            // ✅ UPDATE QUIZ TOTAL POINTS
            $this->updateQuizTotalPoints($question->quiz);
        });

        return back()->with('success', 'Question updated.');
    }

    /**
     * Delete a question
     */
    public function destroy(Question $question, Request $request)
    {
        $this->ensureOwner($question->quiz, $request);

        DB::transaction(function () use ($question) {
            $quiz = $question->quiz;
            $question->delete();

            // ✅ UPDATE QUIZ TOTAL POINTS
            $this->updateQuizTotalPoints($quiz);
        });

        return back()->with('success', 'Question deleted.');
    }

    /**
     * Reorder questions
     */
    public function reorder(Quiz $quiz, Request $request)
    {
        $this->ensureOwner($quiz, $request);

        $data = $request->validate([
            'order' => ['required', 'array'],
            'order.*' => ['required', 'integer', 'exists:questions,id'],
        ]);

        DB::transaction(function () use ($quiz, $data) {
            foreach ($data['order'] as $position => $questionId) {
                $quiz->questions()->where('id', $questionId)->update(['position' => $position]);
            }
        });

        return back()->with('success', 'Questions reordered.');
    }

    /**
     * ✅ Helper method to recalculate and update quiz total_points
     */
    protected function updateQuizTotalPoints(Quiz $quiz): void
    {
        $totalPoints = $quiz->questions()->sum('points');
        $quiz->update(['total_points' => $totalPoints]);
    }

    protected function ensureOwner(Quiz $quiz, Request $request): void
    {
        if (!$request->user() || $quiz->user_id !== $request->user()->id) {
            abort(403, 'Unauthorized.');
        }
    }
}
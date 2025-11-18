<?php

namespace App\Http\Controllers;

use App\Models\Quiz;
use App\Models\QuizAttempt;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class QuizAttemptsController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth');
    }

    /**
     * Show all attempts for a specific quiz (for current user or author)
     */
    public function index(Quiz $quiz, Request $request)
    {
        $user = $request->user();
        
        // Check if user is the author (can see all attempts) or regular user (see own attempts)
        $isAuthor = $quiz->user_id === $user->id;

        // Base query
        $attemptsQuery = QuizAttempt::query()
            ->where('quiz_id', $quiz->id);

        // If not author, only show their own attempts
        if (!$isAuthor) {
            $attemptsQuery->where('user_id', $user->id);
        } else {
            // If author, load user info for each attempt
            $attemptsQuery->with('user:id,name,email');
        }

        // Get paginated attempts
        $attempts = $attemptsQuery
            ->latest()
            ->paginate(10);

        // Calculate stats for current user (or all if author)
        $statsQuery = QuizAttempt::query()
            ->where('quiz_id', $quiz->id);
        
        if (!$isAuthor) {
            $statsQuery->where('user_id', $user->id);
        }

        $stats = [
            'total_attempts' => $statsQuery->count(),
            'completed_attempts' => (clone $statsQuery)->where('status', 'completed')->count(),
            'best_score' => (clone $statsQuery)->where('status', 'completed')->max('score'),
            'average_score' => (clone $statsQuery)->where('status', 'completed')->avg('score'),
            'best_percentage' => null,
            'average_percentage' => null,
        ];

        // Calculate percentages
        if ($stats['best_score'] !== null && $quiz->total_points > 0) {
            $stats['best_percentage'] = round(($stats['best_score'] / $quiz->total_points) * 100);
        }
        
        if ($stats['average_score'] !== null && $quiz->total_points > 0) {
            $stats['average_percentage'] = round(($stats['average_score'] / $quiz->total_points) * 100);
        }

        // Load quiz data
        $quiz->loadCount('questions');
        $quiz->load('author:id,name');
        
        // Calculate total points if not already set
        if (!$quiz->total_points) {
            $quiz->total_points = $quiz->questions()->sum('points');
        }

        return Inertia::render('Quizzes/Attempts/Index', [
            'quiz' => [
                'id' => $quiz->id,
                'title' => $quiz->title,
                'description' => $quiz->description,
                'questions_count' => $quiz->questions_count,
                'total_points' => $quiz->total_points,
                'time_limit_seconds' => $quiz->time_limit_seconds,
                'is_author' => $isAuthor,
            ],
            'attempts' => $attempts,
            'stats' => $stats,
        ]);
    }

    /**
     * Start a new attempt
     */
    public function start(Quiz $quiz, Request $request)
    {
        $user = $request->user();

        // Check if quiz is accessible
        if ($quiz->visibility === 'private' && $quiz->user_id !== $user->id) {
            abort(403, 'This quiz is private.');
        }

        // Check if quiz has questions
        if ($quiz->questions()->count() === 0) {
            return back()->with('error', 'This quiz has no questions yet.');
        }

        // Check if user already has an active attempt
        $existingAttempt = QuizAttempt::where('quiz_id', $quiz->id)
            ->where('user_id', $user->id)
            ->where('status', 'in_progress')
            ->first();

        if ($existingAttempt) {
            return redirect()->route('quizzes.attempts.continue', [
                'quiz' => $quiz->id,
                'attempt' => $existingAttempt->id
            ]);
        }

        // Create new attempt
        $attempt = QuizAttempt::create([
            'quiz_id' => $quiz->id,
            'user_id' => $user->id,
            'status' => 'in_progress',
            'max_score' => $quiz->questions()->sum('points'),
            'started_at' => now(),
        ]);

        return redirect()->route('quizzes.attempts.take', [
            'quiz' => $quiz->id,
            'attempt' => $attempt->id
        ]);
    }

    /**
     * Continue an existing attempt
     */
    public function continue(Quiz $quiz, QuizAttempt $attempt, Request $request)
    {
        $user = $request->user();

        // Verify ownership
        if ($attempt->user_id !== $user->id) {
            abort(403, 'This attempt does not belong to you.');
        }

        // Check if attempt is still in progress
        if ($attempt->status !== 'in_progress') {
            return redirect()->route('quizzes.attempts.results', [
                'quiz' => $quiz->id,
                'attempt' => $attempt->id
            ])->with('info', 'This attempt has already been completed.');
        }

        return redirect()->route('quizzes.attempts.take', [
            'quiz' => $quiz->id,
            'attempt' => $attempt->id
        ]);
    }

    /**
     * Show the quiz taking interface
     */
    public function take(Quiz $quiz, QuizAttempt $attempt, Request $request)
    {
        $user = $request->user();

        // Verify ownership
        if ($attempt->user_id !== $user->id) {
            abort(403);
        }

        // Load quiz with questions and options (ordered properly)
        $quiz->load(['questions' => function($query) {
            $query->orderBy('position', 'asc');
        }, 'questions.options' => function($query) {
            $query->orderBy('position', 'asc');
        }]);

        // Get user's answers for this attempt
        $userAnswers = DB::table('quiz_attempt_answers')
            ->where('quiz_attempt_id', $attempt->id)
            ->get()
            ->keyBy('question_id');

        return Inertia::render('Quizzes/Attempts/Take', [
            'quiz' => $quiz,
            'attempt' => $attempt,
            'userAnswers' => $userAnswers,
        ]);
    }

    /**
     * Show attempt results
     */
    public function results(Quiz $quiz, QuizAttempt $attempt, Request $request)
    {
        $user = $request->user();

        // Verify ownership or author
        if ($attempt->user_id !== $user->id && $quiz->user_id !== $user->id) {
            abort(403);
        }

        // Load attempt with answers and questions
        $attempt->load([
            'answers.question.options',
            'user:id,name,email'
        ]);

        $quiz->load('author:id,name');

        return Inertia::render('Quizzes/Attempts/Results', [
            'quiz' => $quiz,
            'attempt' => $attempt,
        ]);
    }

    /**
     * Auto-save answer (called periodically while taking quiz)
     */
    public function submitAnswer(Quiz $quiz, QuizAttempt $attempt, Request $request)
    {
        $user = $request->user();

        // Verify ownership and status
        if ($attempt->user_id !== $user->id) {
            abort(403, 'Unauthorized');
        }

        if ($attempt->status !== 'in_progress') {
            return response()->json(['error' => 'Attempt already completed'], 422);
        }

        $answers = $request->input('answers', []);

        foreach ($answers as $questionId => $answerData) {
            // Skip invalid question IDs
            if (empty($questionId) || $questionId === 'undefined') {
                continue;
            }

            DB::table('quiz_attempt_answers')->updateOrInsert(
                [
                    'quiz_attempt_id' => $attempt->id,
                    'question_id' => $questionId,
                ],
                [
                    'selected_option_id' => $answerData['selected_option_id'] ?? null,
                    'answer_text' => $answerData['answer_text'] ?? null,
                    'updated_at' => now(),
                ]
            );
        }

        return response()->json(['success' => true]);
    }

    /**
     * Submit the entire quiz and calculate final score
     */
    public function submit(Quiz $quiz, QuizAttempt $attempt, Request $request)
    {
        $user = $request->user();

        // Verify ownership and status
        if ($attempt->user_id !== $user->id) {
            abort(403, 'Unauthorized');
        }

        if ($attempt->status !== 'in_progress') {
            return back()->with('error', 'This attempt has already been completed.');
        }

        // Save final answers
        $answers = $request->input('answers', []);
        
        foreach ($answers as $questionId => $answerData) {
            // Skip invalid question IDs
            if (empty($questionId) || $questionId === 'undefined') {
                continue;
            }

            DB::table('quiz_attempt_answers')->updateOrInsert(
                [
                    'quiz_attempt_id' => $attempt->id,
                    'question_id' => $questionId,
                ],
                [
                    'selected_option_id' => $answerData['selected_option_id'] ?? null,
                    'answer_text' => $answerData['answer_text'] ?? null,
                    'updated_at' => now(),
                ]
            );
        }

        // Calculate score
        $totalScore = 0;
        $questions = $quiz->questions()->with('options')->get();

        foreach ($questions as $question) {
            $userAnswer = DB::table('quiz_attempt_answers')
                ->where('quiz_attempt_id', $attempt->id)
                ->where('question_id', $question->id)
                ->first();

            if (!$userAnswer) {
                // No answer provided, mark as incorrect with 0 points
                DB::table('quiz_attempt_answers')->insert([
                    'quiz_attempt_id' => $attempt->id,
                    'question_id' => $question->id,
                    'selected_option_id' => null,
                    'answer_text' => null,
                    'is_correct' => false,
                    'points_earned' => 0,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
                continue;
            }

            $isCorrect = false;

            if ($question->question_type === 'identification') {
                // For identification questions, compare text (case-insensitive, trimmed)
                $correctOption = $question->options()->where('is_correct', true)->first();
                if ($correctOption) {
                    $userAnswerText = strtolower(trim($userAnswer->answer_text ?? ''));
                    $correctAnswerText = strtolower(trim($correctOption->option_text));
                    $isCorrect = $userAnswerText === $correctAnswerText;
                }
            } else {
                // For multiple choice / true-false
                $selectedOption = $question->options()
                    ->where('id', $userAnswer->selected_option_id)
                    ->first();
                
                $isCorrect = $selectedOption && $selectedOption->is_correct;
            }

            // Update answer with correctness
            DB::table('quiz_attempt_answers')
                ->where('quiz_attempt_id', $attempt->id)
                ->where('question_id', $question->id)
                ->update([
                    'is_correct' => $isCorrect,
                    'points_earned' => $isCorrect ? $question->points : 0,
                    'updated_at' => now(),
                ]);

            if ($isCorrect) {
                $totalScore += $question->points;
            }
        }

        // Calculate time taken
        $startTime = new \Carbon\Carbon($attempt->started_at);
        $timeTaken = now()->diffInSeconds($startTime);

        // Calculate percentage
        $maxScore = $quiz->questions()->sum('points');
        $percentage = $maxScore > 0 ? round(($totalScore / $maxScore) * 100, 2) : 0;

        // Update attempt
        $attempt->update([
            'status' => 'completed',
            'score' => $totalScore,
            'percentage' => $percentage,
            'completed_at' => now(),
            'time_taken_seconds' => $timeTaken,
        ]);

        return redirect()->route('quizzes.attempts.results', [
            'quiz' => $quiz->id,
            'attempt' => $attempt->id
        ])->with('success', 'Quiz submitted successfully!');
    }
}
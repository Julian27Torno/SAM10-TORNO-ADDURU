<?php

namespace App\Http\Controllers;

use App\Models\Quiz;
use App\Models\QuizAttempt;
use Illuminate\Http\Request;
use Inertia\Inertia;

class QuizAttemptController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth'); // all attempt actions require auth
    }

    /**
     * List attempts.
     * - If the current user owns the quiz (author): list all attempts for that quiz.
     * - Otherwise: list only the current user's attempts for that quiz.
     *
     * GET /quizzes/{quiz}/attempts
     */
    public function index(Request $request, Quiz $quiz)
    {
        $user = $request->user();

        $query = QuizAttempt::query()
            ->with('user:id,name')
            ->where('quiz_id', $quiz->id)
            ->when($quiz->user_id !== $user->id, fn ($q) => $q->where('user_id', $user->id))
            ->latest();

        $attempts = $query->paginate(12)->withQueryString();

        return Inertia::render('Attempts/Index', [
            'quiz' => $quiz->only(['id','title','slug']),
            'attempts' => $attempts,
            'isAuthor' => $quiz->user_id === $user->id,
        ]);
    }

    /**
     * Start a new attempt (or resume an existing in-progress one).
     * Respects max_attempts and ensures only one in-progress attempt at a time.
     *
     * POST /quizzes/{quiz}/attempts
     */
    public function store(Request $request, Quiz $quiz)
    {
        $user = $request->user();

        // If quiz is private and user is not the author, block starting
        if ($quiz->visibility === 'private' && $quiz->user_id !== $user->id) {
            abort(403, 'This quiz is private.');
        }

        // If there is an in-progress attempt, just resume it
        $existing = QuizAttempt::where('quiz_id', $quiz->id)
            ->where('user_id', $user->id)
            ->where('status', 'in_progress')
            ->first();

        if ($existing) {
            return redirect()->route('attempts.take', $existing);
        }

        // Enforce max_attempts (counts only completed attempts)
        if (!is_null($quiz->max_attempts)) {
            $completedCount = QuizAttempt::where('quiz_id', $quiz->id)
                ->where('user_id', $user->id)
                ->where('status', 'completed')
                ->count();

            if ($completedCount >= $quiz->max_attempts) {
                return back()->with('error', 'You have reached the maximum number of attempts for this quiz.');
            }
        }

        // Snapshot max_score from current quiz questions
        $maxScore = (int) $quiz->questions()->sum('points');

        $attempt = QuizAttempt::create([
            'quiz_id'      => $quiz->id,
            'user_id'      => $user->id,
            'started_at'   => now(),
            'status'       => 'in_progress',
            'score'        => 0,
            'max_score'    => $maxScore,
        ]);

        return redirect()->route('attempts.take', $attempt);
    }

    /**
     * Take/Resume an attempt page.
     * GET /attempts/{attempt}
     * Only the taker or the quiz author can view.
     * Authors see read-only if they are not the taker.
     */
    public function show(QuizAttempt $attempt, Request $request)
    {
        $this->ensureViewer($attempt, $request);

        $attempt->load([
            'quiz:id,title,slug,user_id,time_limit_seconds,shuffle_questions,shuffle_options',
            'questionAnswers.selectedOptions:id',
            'questionAnswers.question.options',
        ]);

        // Compute a simple "deadlineAt" if time-limited and started
        $deadlineAt = null;
        if ($attempt->quiz->time_limit_seconds && $attempt->started_at) {
            $deadlineAt = $attempt->started_at->clone()->addSeconds($attempt->quiz->time_limit_seconds);
        }

        // Render a single "Take" page for both in-progress and completed (UI can branch on status)
        return Inertia::render('Attempts/Take', [
            'attempt'    => $attempt,
            'deadlineAt' => $deadlineAt,
            'isOwner'    => $request->user()->id === $attempt->user_id,
            'isAuthor'   => $request->user()->id === $attempt->quiz->user_id,
        ]);
    }

    /**
     * Convenience alias: same as show(); route name reads nicer as "attempts.take".
     */
    public function take(QuizAttempt $attempt, Request $request)
    {
        return $this->show($attempt, $request);
    }

    /**
     * Mark an in-progress attempt as abandoned (cannot be edited after).
     * PATCH /attempts/{attempt}/abandon
     */
    public function abandon(Request $request, QuizAttempt $attempt)
    {
        $this->ensureTaker($attempt, $request);

        if ($attempt->status !== 'in_progress') {
            return back()->with('error', 'Only in-progress attempts can be abandoned.');
        }

        $attempt->status = 'abandoned';
        $attempt->completed_at = now();
        $attempt->save();

        return redirect()->route('quizzes.show', $attempt->quiz)->with('success', 'Attempt abandoned.');
    }

    /**
     * Delete an attempt (taker or quiz author). Useful for admin/cleanup.
     * DELETE /attempts/{attempt}
     */
    public function destroy(Request $request, QuizAttempt $attempt)
    {
        $user = $request->user();

        if ($user->id !== $attempt->user_id && $user->id !== $attempt->quiz->user_id) {
            abort(403, 'You do not have permission to delete this attempt.');
        }

        $attempt->questionAnswers()->delete(); // FK cascade would also handle if set
        $attempt->delete();

        return back()->with('success', 'Attempt deleted.');
    }

    /* ===================== Helpers ===================== */

    protected function ensureViewer(QuizAttempt $attempt, Request $request): void
    {
        $user = $request->user();
        $isTaker  = $user && $user->id === $attempt->user_id;
        $isAuthor = $user && $user->id === $attempt->quiz->user_id;

        if (!$isTaker && !$isAuthor) {
            abort(403, 'You do not have permission to view this attempt.');
        }
    }

    protected function ensureTaker(QuizAttempt $attempt, Request $request): void
    {
        if (!$request->user() || $attempt->user_id !== $request->user()->id) {
            abort(403, 'You do not have permission to modify this attempt.');
        }
    }
}

<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use App\Models\Quiz;
use App\Models\QuizAttempt;

class DashboardController extends Controller
{
    public function index()
    {
        $user = auth()->user();

        // ==========================================
        // STATS SECTION
        // ==========================================
        
        // Count of quizzes created by the user
        $myQuizzes = $user->quizzes()->count();

        // Count of quiz attempts by the user
        $attempts = $user->quizAttempts()->count();

        // Average score across all completed attempts
        $avgScore = $user->quizAttempts()
            ->where('status', 'completed')
            ->where('max_score', '>', 0)
            ->avg(DB::raw('(score / max_score) * 100')) ?? 0;

        // ==========================================
        // RECENT QUIZZES (Created by User)
        // ==========================================
        
        $recentQuizzes = $user->quizzes()
            ->with('author:id,name')
            ->latest()
            ->limit(5)
            ->get()
            ->map(fn($quiz) => [
                'id' => $quiz->id,
                'title' => $quiz->title,
                'visibility' => $quiz->visibility,
                'author' => [
                    'name' => $quiz->author->name
                ]
            ]);

        // ==========================================
        // RECENT ATTEMPTS (By User)
        // ==========================================
        
        $recentAttempts = $user->quizAttempts()
            ->with('quiz:id,title')
            ->latest()
            ->limit(5)
            ->get()
            ->map(fn($attempt) => [
                'id' => $attempt->id,
                'quizTitle' => $attempt->quiz->title,
                'score' => $attempt->score,
                'maxScore' => $attempt->max_score,
                'status' => $attempt->status,
            ]);

        // ==========================================
        // POPULAR QUIZZES (Community Section)
        // ==========================================
        
        $popularQuizzes = Quiz::query()
            ->public()
            ->withCount('attempts')
            ->with('author:id,name')
            ->having('attempts_count', '>', 0)
            ->orderByDesc('attempts_count')
            ->limit(3)
            ->get()
            ->map(function($quiz) {
                // Calculate average score for this quiz
                $avgScore = $quiz->attempts()
                    ->where('status', 'completed')
                    ->where('max_score', '>', 0)
                    ->avg(DB::raw('(score / max_score) * 100')) ?? 0;

                return [
                    'id' => $quiz->id,
                    'title' => $quiz->title,
                    'slug' => $quiz->slug,
                    'avgScore' => round($avgScore),
                    'attemptsCount' => $quiz->attempts_count,
                    'author' => [
                        'name' => $quiz->author->name
                    ]
                ];
            });

        // ==========================================
        // RETURN TO INERTIA
        // ==========================================
        
        return Inertia::render('dashboard', [
            'stats' => [
                'myQuizzes' => $myQuizzes,
                'attempts' => $attempts,
                'avgScore' => round($avgScore, 1),
            ],
            'recentQuizzes' => $recentQuizzes,
            'recentAttempts' => $recentAttempts,
            'popularQuizzes' => $popularQuizzes,
        ]);
    }
}
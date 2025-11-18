<?php

use Inertia\Inertia;
use Laravel\Fortify\Features;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\QuizController;
use App\Http\Controllers\OptionController;
use App\Http\Controllers\QuestionController;
use App\Http\Controllers\QuizAttemptController;
use App\Http\Controllers\QuizAttemptsController;
use App\Http\Controllers\QuestionAnswerController;
use App\Http\Controllers\DashboardController; // 👈 ADD THIS

// --- Public Routes ---

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

// --- Authenticated Routes ---

Route::middleware(['auth', 'verified'])->group(function () {

    // Dashboard - NOW USING CONTROLLER 🎉
    Route::get('dashboard', [DashboardController::class, 'index'])
        ->name('dashboard');

    // -------------------------------------------------------------------------
    // Quiz Management
    // -------------------------------------------------------------------------

    // My Quizzes (Instructor View)
    Route::get('/my/quizzes', [QuizController::class, 'mine'])
        ->name('quizzes.mine');

    // Public Quiz List (Student View)
    Route::get('/quizzes', [QuizController::class, 'index'])
        ->name('quizzes.index');

    // Create Quiz (Step 1)
    Route::get('/quizzes/create', [QuizController::class, 'create'])
        ->name('quizzes.create');
    
    // Store Quiz (Redirects to Edit)
    Route::post('/quizzes', [QuizController::class, 'store'])
        ->name('quizzes.store');

    // Edit Quiz (Step 2: Settings & Questions)
    Route::get('/quizzes/{quiz}/edit', [QuizController::class, 'edit'])
        ->name('quizzes.edit');
    
    // Update Quiz Settings (Title, Desc, Visibility, Image)
    Route::put('/quizzes/{quiz}', [QuizController::class, 'update'])
        ->name('quizzes.update');
    
    // Delete Quiz
    Route::delete('/quizzes/{quiz}', [QuizController::class, 'destroy'])
        ->name('quizzes.destroy');
    
    // Show Quiz Landing Page (Start Attempt Screen)
    Route::get('/quizzes/{quiz}', [QuizController::class, 'show'])
        ->name('quizzes.show');


    // -------------------------------------------------------------------------
    // Question Management
    // -------------------------------------------------------------------------

    // Create Question (Handles creating Question + Options transactionally)
    Route::post('/quizzes/{quiz}/questions', [QuestionController::class, 'store'])
        ->name('quizzes.questions.store');

    // Update Question Details
    Route::put('/questions/{question}', [QuestionController::class, 'update'])
        ->name('questions.update');
    
    // Delete Question (Cascades delete to options)
    Route::delete('/questions/{question}', [QuestionController::class, 'destroy'])
        ->name('questions.destroy');
    
    // Reorder Questions
    Route::patch('/quizzes/{quiz}/questions/reorder', [QuestionController::class, 'reorder'])
        ->name('quizzes.questions.reorder');


    // -------------------------------------------------------------------------
    // Option Management
    // -------------------------------------------------------------------------

    // Add Single Option (Quick Add in Edit UI)
    Route::post('/questions/{question}/options', [OptionController::class, 'store'])
        ->name('questions.options.store');

    // Update Option (Text / Correctness)
    Route::put('/options/{option}', [OptionController::class, 'update'])
        ->name('options.update');
    
    // Delete Option
    Route::delete('/options/{option}', [OptionController::class, 'destroy'])
        ->name('options.destroy');
    
    // Reorder Options
    Route::patch('/questions/{question}/options/reorder', [OptionController::class, 'reorder'])
        ->name('questions.options.reorder');


    // -------------------------------------------------------------------------
    // Quiz Attempts (Taking the Quiz)
    // -------------------------------------------------------------------------

    // List Past Attempts
    Route::get('/quizzes/{quiz}/attempts', [QuizAttemptsController::class, 'index'])
        ->name('quizzes.attempts.index');
    
    // Start a new quiz attempt
    Route::get('/quizzes/{quiz}/attempt/start', [QuizAttemptsController::class, 'start'])
        ->name('quizzes.attempts.start');
    
    // Continue an existing attempt
    Route::get('/quizzes/{quiz}/attempt/{attempt}/continue', [QuizAttemptsController::class, 'continue'])
        ->name('quizzes.attempts.continue');
    
    // Take the quiz (main quiz interface)
    Route::get('/quizzes/{quiz}/attempt/{attempt}', [QuizAttemptsController::class, 'take'])
        ->name('quizzes.attempts.take');
    
    // Submit an answer
    Route::post('/quizzes/{quiz}/attempt/{attempt}/answer', [QuizAttemptsController::class, 'submitAnswer'])
        ->name('quizzes.attempts.answer');
    
    // Submit entire quiz
    Route::post('/quizzes/{quiz}/attempt/{attempt}/submit', [QuizAttemptsController::class, 'submit'])
        ->name('quizzes.attempts.submit');
    
    // View results
    Route::get('/quizzes/{quiz}/attempt/{attempt}/results', [QuizAttemptsController::class, 'results'])
        ->name('quizzes.attempts.results');

});

require __DIR__.'/settings.php';
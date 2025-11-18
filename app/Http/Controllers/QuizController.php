<?php

namespace App\Http\Controllers;

use App\Models\Quiz;
use Illuminate\Http\Request;
use Inertia\Inertia;

class QuizController extends Controller
{
    public function __construct()
    {
        // Public: index + show
        $this->middleware('auth')->except(['index', 'show']);
    }

    /** PUBLIC: list quizzes */
    public function index(Request $request)
    {
        $search = $request->string('q')->toString();

        $quizzes = Quiz::query()
            ->with('author:id,name')
            ->whereIn('visibility', ['public', 'unlisted'])
            ->when($search, fn($q) =>
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
            )
            ->latest()
            ->paginate(12)
            ->withQueryString();

        return Inertia::render('Quizzes/Index', [
            'quizzes' => $quizzes,
            'filters' => [
                'q' => $search,
            ],
        ]);
    }

    /** PUBLIC: show a quiz */
    public function show(Quiz $quiz)
    {
        if ($quiz->visibility === 'private') {
            abort(403);
        }

        $quiz->load(['author:id,name', 'questions.options']);

        return Inertia::render('Quizzes/Show', [
            'quiz' => $quiz,
        ]);
    }

    /** AUTH: my quizzes */
 public function mine(Request $request)
{
    $quizzes = Quiz::query()
        ->where('user_id', $request->user()->id)
        ->withCount('questions') // ✅ Add question count
        ->with(['latestAttempt']) 
        ->latest()
        ->paginate(9);

    return Inertia::render('Quizzes/Mine', [
        'quizzes' => $quizzes,
    ]);
}

    /** AUTH: create form */
    public function create()
    {
        return Inertia::render('Quizzes/Create');
    }

    /** AUTH: store quiz */
 public function store(Request $request)
{
    // 1. Validate
    $data = $request->validate([
        'title'              => ['required', 'string', 'max:255'],
        'description'        => ['nullable', 'string'],
        'visibility'         => ['required', 'in:public,unlisted,private'],
        // Add Time Limit Validation
        'time_limit_seconds' => ['nullable', 'integer', 'min:1'], 
        'cover_image'        => ['nullable', 'image', 'max:2048'],
    ]);

    // 2. Handle Image
    $coverImageUrl = null;
    if ($request->file('cover_image')) {
        $path = $request->file('cover_image')->store('quizzes', 'public');
        $coverImageUrl = '/storage/' . $path;
    }

    // 3. Create Quiz
    $quiz = Quiz::create([
        'user_id'            => $request->user()->id,
        'title'              => $data['title'],
        'description'        => $data['description'],
        'visibility'         => $data['visibility'],
        // Save the time limit
        'time_limit_seconds' => $data['time_limit_seconds'] ?? null, 
        'cover_image_url'    => $coverImageUrl,
    ]);

    // 4. Redirect to the Questions Editor (Edit.tsx)
    // This is where "Identification" questions are added
    return redirect()->route('quizzes.edit', $quiz->id);
}

    /** AUTH: edit */
public function edit(Quiz $quiz, Request $request)
    {
        if ($quiz->user_id !== $request->user()->id) abort(403);

        // Load questions and options for the editor
        $quiz->load(['questions.options']);

        return Inertia::render('Quizzes/Edit', [
            'quiz' => $quiz,
        ]);
    }
    /** AUTH: update */
 public function update(Quiz $quiz, Request $request)
{
    if ($quiz->user_id !== $request->user()->id) {
        abort(403);
    }

    $data = $request->validate([
        'title'              => ['required', 'string'],
        'description'        => ['nullable', 'string'],
        'visibility'         => ['required', 'in:public,unlisted,private'],
        'time_limit_seconds' => ['nullable', 'integer', 'min:0'], // <--- ADD THIS
        'cover_image'        => ['nullable', 'image', 'max:2048'],
    ]);

    $coverImageUrl = $quiz->cover_image_url;

    if ($request->file('cover_image')) {
        if ($quiz->cover_image_url) {
            \Illuminate\Support\Facades\Storage::disk('public')->delete(
                str_replace('/storage/', '', $quiz->cover_image_url)
            );
        }
        $path = $request->file('cover_image')->store('quizzes', 'public');
        $coverImageUrl = '/storage/' . $path;
    }

    $quiz->update([
        'title'              => $data['title'],
        'description'        => $data['description'],
        'visibility'         => $data['visibility'],
        'time_limit_seconds' => $data['time_limit_seconds'] ?? null, // <--- SAVE THIS
        'cover_image_url'    => $coverImageUrl,
    ]);

    return back()->with('success', 'Quiz updated.');
}
    public function destroy(Request $request, Question $question)
    {
        $this->ensureOwner($question->quiz, $request);
        $question->delete();
        return back()->with('success', 'Question deleted.');
    }

    protected function ensureOwner(Quiz $quiz, Request $request): void
    {
        if (!$request->user() || $quiz->user_id !== $request->user()->id) {
            abort(403, 'Unauthorized.');
        }
    }
}

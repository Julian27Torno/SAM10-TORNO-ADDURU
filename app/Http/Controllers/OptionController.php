<?php

namespace App\Http\Controllers;

use App\Models\Option;
use App\Models\Question;
use Illuminate\Http\Request;

class OptionController extends Controller
{
    public function __construct()
    {
        // Only authors can modify options; viewing happens through quiz/question pages
        $this->middleware('auth');
    }

    /**
     * Create a new option under a question.
     * POST /questions/{question}/options
     */
    public function store(Request $request, Question $question)
    {
        $this->ensureOwner($question, $request);

        $data = $request->validate([
            'text'        => ['required', 'string', 'max:1000'],
            'is_correct'  => ['boolean'],
            'position'    => ['nullable', 'integer', 'min:0'],
            'explanation' => ['nullable', 'string'],
        ]);

        // Default position = append to end
        if (!isset($data['position'])) {
            $maxPos = $question->options()->max('position') ?? 0;
            $data['position'] = $maxPos + 1;
        }

        $data['question_id'] = $question->id;
        $option = Option::create($data);

        // Enforce correctness rules after creating
        $this->enforceCorrectnessConstraint($question, $option);

        return back()->with('success', 'Option added.');
    }

    /**
     * Update an option (text / correctness / explanation / position).
     * PUT /options/{option}
     */
    public function update(Request $request, Option $option)
    {
        $question = $option->question;
        $this->ensureOwner($question, $request);

        $data = $request->validate([
            'text'        => ['sometimes', 'required', 'string', 'max:1000'],
            'is_correct'  => ['sometimes', 'boolean'],
            'position'    => ['sometimes', 'nullable', 'integer', 'min:0'],
            'explanation' => ['sometimes', 'nullable', 'string'],
        ]);

        // If position null → keep current; if provided → set directly
        if (array_key_exists('position', $data) && $data['position'] === null) {
            unset($data['position']);
        }

        $option->update($data);

        // Enforce correctness rules if correctness changed or question type is restrictive
        if (array_key_exists('is_correct', $data)) {
            $this->enforceCorrectnessConstraint($question, $option);
        }

        return back()->with('success', 'Option updated.');
    }

    /**
     * Delete an option.
     * DELETE /options/{option}
     */
    public function destroy(Request $request, Option $option)
    {
        $question = $option->question;
        $this->ensureOwner($question, $request);

        $option->delete();

        return back()->with('success', 'Option deleted.');
    }

    /**
     * Reorder options for a question in one go.
     * PATCH /questions/{question}/options/reorder
     * Payload: { order: [optionId1, optionId2, ...] }
     */
    public function reorder(Request $request, Question $question)
    {
        $this->ensureOwner($question, $request);

        $data = $request->validate([
            'order'   => ['required', 'array', 'min:1'],
            'order.*' => ['integer', 'distinct', 'exists:options,id'],
        ]);

        // Only allow reordering options that belong to this question
        $optionIds = $question->options()->pluck('id')->all();
        $incoming  = $data['order'];

        // Filter to intersection to avoid tampering
        $filtered = array_values(array_intersect($incoming, $optionIds));

        foreach ($filtered as $idx => $optId) {
            Option::where('id', $optId)->update(['position' => $idx + 1]);
        }

        return back()->with('success', 'Options reordered.');
    }

    /**
     * Helper: ensure only one correct option exists for single/true_false.
     * If the updated/created option is set correct and question type is restrictive,
     * we set all other options to false.
     */
    protected function enforceCorrectnessConstraint(Question $question, Option $touched): void
    {
        $restrictSingle = in_array($question->type, ['single', 'true_false'], true);

        if ($restrictSingle && $touched->is_correct) {
            $question->options()
                ->where('id', '!=', $touched->id)
                ->where('is_correct', true)
                ->update(['is_correct' => false]);
        }
    }

    /**
     * Helper: only quiz owner may modify options
     */
    protected function ensureOwner(Question $question, Request $request): void
    {
        $quiz = $question->quiz;
        if (!$request->user() || $quiz->user_id !== $request->user()->id) {
            abort(403, 'You do not have permission to modify options for this quiz.');
        }
    }
}

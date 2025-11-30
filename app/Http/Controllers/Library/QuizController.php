<?php

namespace App\Http\Controllers\Library;

use App\Http\Controllers\Controller;
use App\Models\Quiz;
use App\Models\QuizCategory;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;

class QuizController extends Controller
{
    public function index(Request $request)
    {
        $query = Quiz::where('user_id', auth()->id())
            ->with('category');

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Filter by category
        if ($request->filled('category')) {
            $query->where('quiz_category_id', $request->category);
        }

        // Search
        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('title', 'like', '%' . $request->search . '%')
                  ->orWhere('description', 'like', '%' . $request->search . '%')
                  ->orWhere('join_code', 'like', '%' . $request->search . '%');
            });
        }

        $quizzes = $query->latest()->paginate(12);
        $categories = QuizCategory::all();

        return Inertia::render('library/quizzes/index', [
            'quizzes' => $quizzes,
            'categories' => $categories,
            'filters' => $request->only(['status', 'category', 'search']),
        ]);
    }

    public function create()
    {
        $categories = QuizCategory::all();
        
        return Inertia::render('library/quizzes/create', [
            'categories' => $categories,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'quiz_category_id' => 'required|exists:quiz_categories,id',
        ]);

        Quiz::create([
            'user_id' => auth()->id(),
            'title' => $request->title,
            'slug' => Str::slug($request->title) . '-' . Str::random(6),
            'join_code' => strtoupper(Str::random(6)),
            'description' => $request->description,
            'quiz_category_id' => $request->quiz_category_id,
            'status' => 'draft',
        ]);

        return redirect()->route('library.quizzes.index')
            ->with('success', 'Quiz created successfully.');
    }

    public function edit(Quiz $quiz)
    {
        if ($quiz->user_id !== auth()->id()) {
            abort(403);
        }

        $categories = QuizCategory::all();

        return Inertia::render('library/quizzes/edit', [
            'quiz' => $quiz->load('category'),
            'categories' => $categories,
        ]);
    }

    public function update(Request $request, Quiz $quiz)
    {
        if ($quiz->user_id !== auth()->id()) {
            abort(403);
        }

        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'quiz_category_id' => 'nullable|exists:quiz_categories,id',
            'status' => 'required|in:draft,live,finished,archived',
        ]);

        $quiz->update([
            'title' => $request->title,
            'description' => $request->description,
            'quiz_category_id' => $request->quiz_category_id,
            'status' => $request->status,
        ]);

        return redirect()->route('library.quizzes.index')
            ->with('success', 'Quiz updated successfully.');
    }

    public function destroy(Quiz $quiz)
    {
        if ($quiz->user_id !== auth()->id()) {
            abort(403);
        }

        $quiz->delete();

        return redirect()->route('library.quizzes.index')
            ->with('success', 'Quiz deleted successfully.');
    }

    public function questions(Quiz $quiz)
    {
        if ($quiz->user_id !== auth()->id()) {
            abort(403);
        }

        return Inertia::render('library/quizzes/questions', [
            'quiz' => $quiz->load(['questions.options']),
        ]);
    }

    public function storeQuestions(Request $request, Quiz $quiz)
    {
        if ($quiz->user_id !== auth()->id()) {
            abort(403);
        }

        $data = $request->validate([
            'questions' => 'array',
            'questions.*.id' => 'nullable|integer',
            'questions.*.question_text' => 'required|string',
            'questions.*.question_type' => 'required|string',
            'questions.*.time_limit' => 'required|integer',
            'questions.*.points' => 'required|integer',
            'questions.*.options' => 'array',
            'questions.*.options.*.option_text' => 'required|string',
            'questions.*.options.*.is_correct' => 'boolean',
        ]);

        // Simple sync strategy: delete all and recreate (or update existing)
        // For a better UX, we might want to be smarter here, but for now let's iterate and update/create
        
        // This is a simplified implementation. In a real app, we'd handle IDs to update existing records.
        // For this MVP, let's assume we receive the full state.
        
        // Note: A proper sync would be more complex. 
        // Let's implement a basic "update or create" loop.

        $existingQuestionIds = collect($request->questions)->pluck('id')->filter()->toArray();
        $quiz->questions()->whereNotIn('id', $existingQuestionIds)->delete();

        foreach ($request->questions as $index => $qData) {
            $question = $quiz->questions()->updateOrCreate(
                ['id' => $qData['id'] ?? null],
                [
                    'question_text' => $qData['question_text'],
                    'question_type' => $qData['question_type'],
                    'time_limit' => $qData['time_limit'],
                    'points' => $qData['points'],
                    'order' => $index,
                ]
            );

            // Handle options
            $question->options()->delete(); // Simplest way for options for now
            foreach ($qData['options'] as $oIndex => $oData) {
                $question->options()->create([
                    'option_text' => $oData['option_text'],
                    'is_correct' => $oData['is_correct'],
                    'order' => $oIndex,
                ]);
            }
        }

        return back()->with('success', 'Questions saved successfully.');
    }
}

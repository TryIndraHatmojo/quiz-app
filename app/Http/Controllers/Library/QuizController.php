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
}

<?php

namespace App\Http\Controllers\Library;

use App\Http\Controllers\Controller;
use App\Models\Quiz;
use App\Models\QuizCategory;
use App\Models\QuizBackground;
use App\Models\Gallery;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
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
        $backgrounds = QuizBackground::where('is_public', true)
            ->orWhere('user_id', auth()->id())
            ->latest()
            ->get();
        
        return Inertia::render('library/quizzes/create', [
            'categories' => $categories,
            'backgrounds' => $backgrounds,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'quiz_category_id' => 'required|exists:quiz_categories,id',
            'quiz_background_id' => 'nullable|exists:quiz_backgrounds,id',
            'background_file' => 'nullable|file|mimes:jpeg,png,jpg,gif|max:10240',
        ]);

        $backgroundId = $request->quiz_background_id;

        if ($request->hasFile('background_file')) {
            $file = $request->file('background_file');
            $fileName = time() . '_' . Str::slug($request->title) . '_bg.' . $file->getClientOriginalExtension();
            
            $destinationPath = public_path('uploads/backgrounds');
            if (!File::exists($destinationPath)) {
                File::makeDirectory($destinationPath, 0755, true);
            }
            
            $file->move($destinationPath, $fileName);
            $filePath = '/uploads/backgrounds/' . $fileName;

            $background = QuizBackground::create([
                'user_id' => auth()->id(),
                'name' => 'Background for ' . $request->title,
                'image_path' => $filePath,
                'is_public' => false,
            ]);

            $backgroundId = $background->id;
        }

        Quiz::create([
            'user_id' => auth()->id(),
            'title' => $request->title,
            'slug' => Str::slug($request->title) . '-' . Str::random(6),
            'join_code' => strtoupper(Str::random(6)),
            'description' => $request->description,
            'quiz_category_id' => $request->quiz_category_id,
            'quiz_background_id' => $backgroundId,
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
        $backgrounds = QuizBackground::where('is_public', true)
            ->orWhere('user_id', auth()->id())
            ->latest()
            ->get();

        return Inertia::render('library/quizzes/edit', [
            'quiz' => $quiz->load(['category', 'background']),
            'categories' => $categories,
            'backgrounds' => $backgrounds,
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
            'quiz_background_id' => 'nullable|exists:quiz_backgrounds,id',
            'background_file' => 'nullable|file|mimes:jpeg,png,jpg,gif|max:10240',
            'status' => 'required|in:draft,live,finished,archived',
        ]);

        $backgroundId = $request->quiz_background_id;

        if ($request->hasFile('background_file')) {
            $file = $request->file('background_file');
            $fileName = time() . '_' . Str::slug($request->title) . '_bg.' . $file->getClientOriginalExtension();
            
            $destinationPath = public_path('uploads/backgrounds');
            if (!File::exists($destinationPath)) {
                File::makeDirectory($destinationPath, 0755, true);
            }
            
            $file->move($destinationPath, $fileName);
            $filePath = '/uploads/backgrounds/' . $fileName;

            $background = QuizBackground::create([
                'user_id' => auth()->id(),
                'name' => 'Background for ' . $request->title,
                'image_path' => $filePath,
                'is_public' => false,
            ]);

            $backgroundId = $background->id;
        }

        $quiz->update([
            'title' => $request->title,
            'description' => $request->description,
            'quiz_category_id' => $request->quiz_category_id,
            'quiz_background_id' => $backgroundId,
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

        $galleries = Gallery::latest()->get();

        return Inertia::render('library/quizzes/questions', [
            'quiz' => $quiz->load(['questions.options', 'questions.matchingPairs', 'questions.shortAnswerFields']),
            'galleries' => $galleries,
        ]);
    }

    public function preview(Quiz $quiz)
    {
        if ($quiz->user_id !== auth()->id()) {
            abort(403);
        }

        return Inertia::render('library/quizzes/preview', [
            'quiz' => $quiz->load(['questions.options', 'questions.matchingPairs', 'questions.shortAnswerFields', 'background']),
        ]);
    }

    public function storeQuestions(Request $request, Quiz $quiz)
    {
        if ($quiz->user_id !== auth()->id()) {
            abort(403);
        }

        $request->validate([
            'questions' => 'array',
            'questions.*.id' => 'nullable|integer',
            'questions.*.question_text' => 'required|string',
            'questions.*.question_type' => 'required|in:multiple_choice,long_answer,short_answer,matching_pairs,true_false',
            'questions.*.media_path' => 'nullable|string',
            'questions.*.time_limit' => 'required|integer',
            'questions.*.points' => 'required|integer',
            'questions.*.options' => 'nullable|array',
            'questions.*.options.*.option_text' => 'nullable|string',
            'questions.*.options.*.is_correct' => 'boolean',
            'questions.*.matching_pairs' => 'nullable|array',
            'questions.*.matching_pairs.*.left_text' => 'nullable|string',
            'questions.*.matching_pairs.*.right_text' => 'nullable|string',
            'questions.*.matching_pairs.*.left_media_path' => 'nullable|string',
            'questions.*.matching_pairs.*.right_media_path' => 'nullable|string',
            'questions.*.short_answer_fields' => 'nullable|array',
            'questions.*.short_answer_fields.*.label' => 'nullable|string',
            'questions.*.short_answer_fields.*.placeholder' => 'nullable|string',
            'questions.*.short_answer_fields.*.character_limit' => 'nullable|integer',
            'questions.*.short_answer_fields.*.expected_answer' => 'nullable|string',
            'questions.*.short_answer_fields.*.case_sensitive' => 'boolean',
            'questions.*.short_answer_fields.*.trim_whitespace' => 'boolean',
        ]);

        $existingQuestionIds = collect($request->questions)->pluck('id')->filter()->toArray();
        $quiz->questions()->whereNotIn('id', $existingQuestionIds)->delete();

        foreach ($request->questions as $index => $qData) {
            $question = $quiz->questions()->updateOrCreate(
                ['id' => $qData['id'] ?? null],
                [
                    'question_text' => $qData['question_text'],
                    'question_type' => $qData['question_type'],
                    'media_path' => $qData['media_path'] ?? null,
                    'time_limit' => $qData['time_limit'],
                    'points' => $qData['points'],
                    'order' => $index,
                ]
            );

            // Clear existing related data
            $question->options()->delete();
            $question->matchingPairs()->delete();
            $question->shortAnswerFields()->delete();

            // Handle options for multiple_choice and true_false
            if (in_array($qData['question_type'], ['multiple_choice', 'true_false'])) {
                $options = $qData['options'] ?? [];
                foreach ($options as $oIndex => $oData) {
                    if (!empty($oData['option_text'])) {
                        $question->options()->create([
                            'option_text' => $oData['option_text'],
                            'is_correct' => $oData['is_correct'] ?? false,
                            'order' => $oIndex,
                        ]);
                    }
                }
            }

            // Handle matching pairs
            if ($qData['question_type'] === 'matching_pairs') {
                $pairs = $qData['matching_pairs'] ?? [];
                foreach ($pairs as $pIndex => $pData) {
                    if (!empty($pData['left_text']) || !empty($pData['right_text'])) {
                        $question->matchingPairs()->create([
                            'left_text' => $pData['left_text'] ?? '',
                            'right_text' => $pData['right_text'] ?? '',
                            'left_media_path' => $pData['left_media_path'] ?? null,
                            'right_media_path' => $pData['right_media_path'] ?? null,
                            'order' => $pIndex,
                        ]);
                    }
                }
            }

            // Handle short answer fields
            if (in_array($qData['question_type'], ['short_answer', 'long_answer'])) {
                $fields = $qData['short_answer_fields'] ?? [];
                foreach ($fields as $fIndex => $fData) {
                    $question->shortAnswerFields()->create([
                        'label' => $fData['label'] ?? null,
                        'placeholder' => $fData['placeholder'] ?? null,
                        'character_limit' => $fData['character_limit'] ?? null,
                        'expected_answer' => $fData['expected_answer'] ?? '',
                        'case_sensitive' => $fData['case_sensitive'] ?? false,
                        'trim_whitespace' => $fData['trim_whitespace'] ?? true,
                        'order' => $fIndex,
                    ]);
                }
            }
        }

        return back()->with('success', 'Questions saved successfully.');
    }
}

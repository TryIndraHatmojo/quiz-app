<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Models\QuizCategory;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;

class QuizCategoryController extends Controller
{
    public function index(Request $request)
    {
        $categories = QuizCategory::when($request->name, function ($query, $name) {
                $query->where('name', 'like', "%{$name}%");
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('master/categories/index', [
            'categories' => $categories,
            'filters' => $request->only('name'),
        ]);
    }

    public function create()
    {
        return Inertia::render('master/categories/create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:quiz_categories,name'],
            'description' => ['nullable', 'string'],
        ]);

        $validated['slug'] = Str::slug($validated['name']);

        QuizCategory::create($validated);

        return redirect()->route('master.categories.index')
            ->with('success', 'Mata Pelajaran berhasil ditambahkan.');
    }

    public function edit(QuizCategory $category)
    {
        return Inertia::render('master/categories/edit', [
            'category' => $category,
        ]);
    }

    public function update(Request $request, QuizCategory $category)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:quiz_categories,name,' . $category->id],
            'description' => ['nullable', 'string'],
        ]);

        $validated['slug'] = Str::slug($validated['name']);

        $category->update($validated);

        return redirect()->route('master.categories.index')
            ->with('success', 'Mata Pelajaran berhasil diperbarui.');
    }

    public function destroy(QuizCategory $category)
    {
        // Prevent deletion if category is associated with quizzes
        if ($category->quizzes()->count() > 0) {
            return back()->with('error', 'Tidak dapat menghapus mata pelajaran karena sedang digunakan oleh kuis.');
        }

        $category->delete();

        return redirect()->route('master.categories.index')
            ->with('success', 'Mata Pelajaran berhasil dihapus.');
    }
}

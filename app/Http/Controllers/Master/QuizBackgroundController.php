<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Models\QuizBackground;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Inertia\Inertia;
use Illuminate\Support\Str;

class QuizBackgroundController extends Controller
{
    public function index()
    {
        $backgrounds = QuizBackground::with('user')
            ->latest()
            ->paginate(10);

        return Inertia::render('master/backgrounds/index', [
            'backgrounds' => $backgrounds,
        ]);
    }

    public function create()
    {
        return Inertia::render('master/backgrounds/create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'image' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
            'is_public' => 'boolean',
        ]);

        $image = $request->file('image');
        $imageName = time() . '_' . Str::slug($request->name) . '.' . $image->getClientOriginalExtension();
        
        // Move directly to public folder
        $destinationPath = public_path('uploads/backgrounds');
        if (!File::exists($destinationPath)) {
            File::makeDirectory($destinationPath, 0755, true);
        }
        
        $image->move($destinationPath, $imageName);
        $imagePath = '/uploads/backgrounds/' . $imageName;

        QuizBackground::create([
            'user_id' => \Illuminate\Support\Facades\Auth::id(),
            'name' => $request->name,
            'image_path' => $imagePath,
            'is_public' => $request->is_public ?? false,
        ]);

        return redirect()->route('master.backgrounds.index')
            ->with('success', 'Latar belakang berhasil ditambahkan.');
    }

    public function edit(QuizBackground $background)
    {
        return Inertia::render('master/backgrounds/edit', [
            'background' => $background,
        ]);
    }

    public function update(Request $request, QuizBackground $background)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'is_public' => 'boolean',
        ]);

        $data = [
            'name' => $request->name,
            'is_public' => $request->is_public ?? false,
        ];

        if ($request->hasFile('image')) {
            // Delete old image
            $oldPath = public_path($background->image_path);
            if (File::exists($oldPath)) {
                File::delete($oldPath);
            }

            // Upload new image
            $image = $request->file('image');
            $imageName = time() . '_' . Str::slug($request->name) . '.' . $image->getClientOriginalExtension();
            
            $destinationPath = public_path('uploads/backgrounds');
            if (!File::exists($destinationPath)) {
                File::makeDirectory($destinationPath, 0755, true);
            }
            
            $image->move($destinationPath, $imageName);
            $data['image_path'] = '/uploads/backgrounds/' . $imageName;
        }

        $background->update($data);

        return redirect()->route('master.backgrounds.index')
            ->with('success', 'Latar belakang berhasil diperbarui.');
    }

    public function destroy(QuizBackground $background)
    {
        // Delete image file
        $imagePath = public_path($background->image_path);
        if (File::exists($imagePath)) {
            File::delete($imagePath);
        }

        $background->delete();

        return redirect()->route('master.backgrounds.index')
            ->with('success', 'Latar belakang berhasil dihapus.');
    }
}

<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Models\Gallery;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\File;
use Inertia\Inertia;
use Illuminate\Support\Str;

class GalleryController extends Controller
{
    public function index()
    {
        $galleries = Gallery::with('user')
            ->latest()
            ->paginate(10);

        return Inertia::render('master/galleries/index', [
            'galleries' => $galleries,
        ]);
    }

    public function create()
    {
        return Inertia::render('master/galleries/create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'nullable|string|max:255',
            'file' => 'required|file|mimes:jpeg,png,jpg,gif,mp4,webm|max:10240', // Max 10MB
        ]);

        $file = $request->file('file');
        $fileName = time() . '_' . Str::slug($request->title ?? 'gallery') . '.' . $file->getClientOriginalExtension();
        
        // Move directly to public folder
        $destinationPath = public_path('uploads/galleries');
        if (!File::exists($destinationPath)) {
            File::makeDirectory($destinationPath, 0755, true);
        }
        
        $file->move($destinationPath, $fileName);
        $filePath = '/uploads/galleries/' . $fileName;
        
        $mimeType = $file->getClientMimeType();
        $fileType = str_starts_with($mimeType, 'video') ? 'video' : 'image';

        Gallery::create([
            'user_id' => Auth::id(),
            'title' => $request->title ?? $file->getClientOriginalName(),
            'file_path' => $filePath,
            'file_type' => $fileType,
            'mime_type' => $mimeType,
            'size' => $file->getSize(),
        ]);

        return redirect()->route('master.galleries.index')
            ->with('success', 'Galeri berhasil ditambahkan.');
    }

    public function edit(Gallery $gallery)
    {
        return Inertia::render('master/galleries/edit', [
            'gallery' => $gallery,
        ]);
    }

    public function update(Request $request, Gallery $gallery)
    {
        $request->validate([
            'title' => 'nullable|string|max:255',
            'file' => 'nullable|file|mimes:jpeg,png,jpg,gif,mp4,webm|max:10240',
        ]);

        $data = [
            'title' => $request->title,
        ];

        if ($request->hasFile('file')) {
            // Delete old file
            $oldPath = public_path($gallery->file_path);
            if (File::exists($oldPath)) {
                File::delete($oldPath);
            }

            // Upload new file
            $file = $request->file('file');
            $fileName = time() . '_' . Str::slug($request->title ?? 'gallery') . '.' . $file->getClientOriginalExtension();
            
            $destinationPath = public_path('uploads/galleries');
            if (!File::exists($destinationPath)) {
                File::makeDirectory($destinationPath, 0755, true);
            }
            
            $file->move($destinationPath, $fileName);
            $filePath = '/uploads/galleries/' . $fileName;
            
            $mimeType = $file->getClientMimeType();
            $fileType = str_starts_with($mimeType, 'video') ? 'video' : 'image';

            $data['file_path'] = $filePath;
            $data['file_type'] = $fileType;
            $data['mime_type'] = $mimeType;
            $data['size'] = $file->getSize();
        }

        $gallery->update($data);

        return redirect()->route('master.galleries.index')
            ->with('success', 'Galeri berhasil diperbarui.');
    }

    public function destroy(Gallery $gallery)
    {
        // Delete file
        $filePath = public_path($gallery->file_path);
        if (File::exists($filePath)) {
            File::delete($filePath);
        }

        $gallery->delete();

        return redirect()->route('master.galleries.index')
            ->with('success', 'Galeri berhasil dihapus.');
    }
}

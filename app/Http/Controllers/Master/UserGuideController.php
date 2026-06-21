<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Models\UserGuide;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class UserGuideController extends Controller
{
    public function index(Request $request): Response
    {
        $this->ensureAdmin($request);

        return Inertia::render('master/user-guide/index', [
            'guide' => UserGuide::query()->with('uploader:id,name')->latest()->first(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $this->ensureAdmin($request);

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'file' => ['required', 'file', 'mimes:pdf,doc,docx', 'max:20480'],
        ]);

        $file = $request->file('file');
        $newPath = $file->store('user-guides', 'local');
        $oldPath = null;

        try {
            DB::transaction(function () use ($request, $validated, $file, $newPath, &$oldPath) {
                $guide = UserGuide::query()->latest()->lockForUpdate()->first();
                $oldPath = $guide?->file_path;

                $attributes = [
                    'title' => $validated['title'],
                    'file_path' => $newPath,
                    'original_name' => $file->getClientOriginalName(),
                    'mime_type' => $file->getMimeType() ?: 'application/octet-stream',
                    'size' => $file->getSize(),
                    'uploaded_by' => $request->user()->id,
                ];

                $guide ? $guide->update($attributes) : UserGuide::query()->create($attributes);
            });
        } catch (Throwable $exception) {
            Storage::disk('local')->delete($newPath);
            throw $exception;
        }

        if ($oldPath && $oldPath !== $newPath) {
            Storage::disk('local')->delete($oldPath);
        }

        return back()->with('success', 'Buku panduan berhasil disimpan.');
    }

    public function destroy(Request $request): RedirectResponse
    {
        $this->ensureAdmin($request);

        $guide = UserGuide::query()->latest()->firstOrFail();
        Storage::disk('local')->delete($guide->file_path);
        $guide->delete();

        return back()->with('success', 'Buku panduan berhasil dihapus.');
    }

    private function ensureAdmin(Request $request): void
    {
        abort_unless($request->user()?->isAdmin(), 403);
    }
}

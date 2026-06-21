<?php

namespace App\Http\Controllers;

use App\Models\UserGuide;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class UserGuideController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('user-guide/index', [
            'guide' => UserGuide::query()->latest()->first(),
        ]);
    }

    public function download(): StreamedResponse
    {
        $guide = UserGuide::query()->latest()->firstOrFail();

        abort_unless(Storage::disk('local')->exists($guide->file_path), 404);

        return Storage::disk('local')->download(
            $guide->file_path,
            $guide->original_name,
            ['Content-Type' => $guide->mime_type]
        );
    }
}

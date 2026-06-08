<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\PasswordResetRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class PasswordResetRequestController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'identifier' => ['required', 'string', 'max:255'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $identifier = trim($validated['identifier']);
        $identifierKey = Str::lower($identifier);
        $user = User::query()
            ->whereRaw('LOWER(email) = ?', [$identifierKey])
            ->orWhereRaw('LOWER(nomor_induk_siswa) = ?', [$identifierKey])
            ->first();

        if (! $user) {
            throw ValidationException::withMessages([
                'identifier' => 'Email atau nomor induk siswa tidak ditemukan.',
            ]);
        }

        PasswordResetRequest::query()->updateOrCreate(
            [
                'user_id' => $user->id,
                'status' => PasswordResetRequest::STATUS_PENDING,
            ],
            [
                'identifier' => $identifier,
                'password' => Hash::make($validated['password']),
            ]
        );

        return back()->with('status', 'Pengajuan reset password berhasil dikirim. Silakan tunggu persetujuan admin.');
    }
}

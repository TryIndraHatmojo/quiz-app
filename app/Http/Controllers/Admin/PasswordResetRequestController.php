<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PasswordResetRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PasswordResetRequestController extends Controller
{
    public function index(Request $request)
    {
        $this->authorizeAdmin($request);

        $status = $request->query('status', PasswordResetRequest::STATUS_PENDING);

        $requests = PasswordResetRequest::query()
            ->with(['user.roles', 'reviewer'])
            ->when($status !== 'all', fn ($query) => $query->where('status', $status))
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('admin/password-reset-requests/index', [
            'requests' => $requests,
            'filters' => [
                'status' => $status,
            ],
            'stats' => [
                'pending' => PasswordResetRequest::query()->where('status', PasswordResetRequest::STATUS_PENDING)->count(),
                'approved' => PasswordResetRequest::query()->where('status', PasswordResetRequest::STATUS_APPROVED)->count(),
                'rejected' => PasswordResetRequest::query()->where('status', PasswordResetRequest::STATUS_REJECTED)->count(),
            ],
        ]);
    }

    public function approve(Request $request, PasswordResetRequest $passwordResetRequest)
    {
        $this->authorizeAdmin($request);

        if ($passwordResetRequest->status !== PasswordResetRequest::STATUS_PENDING) {
            return back()->with('error', 'Pengajuan ini sudah diproses.');
        }

        $passwordResetRequest->user->forceFill([
            'password' => $passwordResetRequest->password,
        ])->save();

        $passwordResetRequest->update([
            'status' => PasswordResetRequest::STATUS_APPROVED,
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => now(),
        ]);

        return back()->with('success', 'Pengajuan reset password disetujui. Password pengguna sudah diperbarui.');
    }

    public function reject(Request $request, PasswordResetRequest $passwordResetRequest)
    {
        $this->authorizeAdmin($request);

        if ($passwordResetRequest->status !== PasswordResetRequest::STATUS_PENDING) {
            return back()->with('error', 'Pengajuan ini sudah diproses.');
        }

        $passwordResetRequest->update([
            'status' => PasswordResetRequest::STATUS_REJECTED,
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => now(),
        ]);

        return back()->with('success', 'Pengajuan reset password ditolak.');
    }

    private function authorizeAdmin(Request $request): void
    {
        abort_unless($request->user()?->isAdmin(), 403);
    }
}

<?php

namespace App\Http\Controllers\Library;

use App\Http\Controllers\Controller;
use App\Models\CatatanTelaahSoal;
use App\Models\Quiz;
use App\Models\QuizQuestion;
use App\Models\User;
use Illuminate\Http\Request;

class CatatanTelaahSoalController extends Controller
{
    /**
     * Ambil semua catatan telaah untuk suatu soal.
     */
    public function index(QuizQuestion $question)
    {
        $user = auth()->user();
        $quiz = $question->quiz;

        // Hanya user dengan akses telaah_soal atau edit yang boleh melihat catatan
        if (! $user || ! $this->canViewCatatan($quiz, $user)) {
            abort(403);
        }

        $catatan = $question->catatanTelaah()->with('user')->get();

        return response()->json([
            'catatan' => $catatan,
        ]);
    }

    /**
     * Simpan catatan telaah baru.
     */
    public function store(Request $request, QuizQuestion $question)
    {
        $user = auth()->user();
        $quiz = $question->quiz;

        // Hanya user dengan akses telaah_soal yang boleh memberi catatan
        if (! $user || ! $this->canStoreCatatan($quiz, $user)) {
            abort(403, 'Anda tidak memiliki akses telaah soal untuk kuis ini.');
        }

        $request->validate([
            'catatan' => 'required|string|min:5|max:2000',
        ]);

        $catatan = CatatanTelaahSoal::create([
            'quiz_question_id' => $question->id,
            'user_id' => $user->id,
            'catatan' => $request->catatan,
            'status' => CatatanTelaahSoal::STATUS_BUTUH_REVIEW,
        ]);

        $catatan->load('user');

        return back()->with('success', 'Catatan telaah berhasil ditambahkan.');
    }

    /**
     * Ubah status catatan menjadi selesai.
     */
    public function resolve(CatatanTelaahSoal $catatan)
    {
        $user = auth()->user();
        $quiz = $catatan->question->quiz;

        // Hanya user owner kuis atau punya akses edit yang boleh resolve.
        if (! $user || ! $this->canResolveCatatan($quiz, $user)) {
            abort(403, 'Anda tidak memiliki akses untuk menandai catatan selesai.');
        }

        $catatan->update([
            'status' => CatatanTelaahSoal::STATUS_SELESAI,
        ]);

        return back()->with('success', 'Catatan telah ditandai selesai.');
    }

    /**
     * Buka kembali catatan yang sudah selesai.
     */
    public function reopen(CatatanTelaahSoal $catatan)
    {
        $user = auth()->user();
        $quiz = $catatan->question->quiz;

        if (! $user || (! $user->isAdmin() && ! $quiz->isInUserAudience($user))) {
            abort(403);
        }

        // Yang bisa membuka kembali: reviewer pemilik catatan, atau editor/owner quiz
        if ($catatan->user_id !== $user->id
            && ! $this->canResolveCatatan($quiz, $user)
        ) {
            abort(403);
        }

        $catatan->update([
            'status' => CatatanTelaahSoal::STATUS_BUTUH_REVIEW,
        ]);

        return back()->with('success', 'Catatan dibuka kembali.');
    }

    /**
     * Hapus catatan telaah.
     */
    public function destroy(CatatanTelaahSoal $catatan)
    {
        $user = auth()->user();
        $quiz = $catatan->question->quiz;

        // Hanya pemilik catatan yang bisa menghapus
        if (! $user || (! $user->isAdmin() && ! $quiz->isInUserAudience($user)) || $catatan->user_id !== $user->id) {
            abort(403, 'Anda hanya bisa menghapus catatan milik Anda sendiri.');
        }

        $catatan->delete();

        return back()->with('success', 'Catatan telah dihapus.');
    }

    /**
     * Cek apakah user boleh melihat catatan telaah pada quiz ini.
     */
    private function canViewCatatan(Quiz $quiz, User $user): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        if (! $quiz->isInUserAudience($user)) {
            return false;
        }

        return $quiz->user_id === $user->id
            || $quiz->hasTeacherAccess($user->id, 'edit')
            || $quiz->hasTeacherAccess($user->id, 'telaah_soal');
    }

    /**
     * Cek apakah user boleh menandai catatan selesai.
     */
    private function canResolveCatatan(Quiz $quiz, User $user): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        if (! $quiz->isInUserAudience($user)) {
            return false;
        }

        return $quiz->user_id === $user->id
            || $quiz->hasTeacherAccess($user->id, 'edit');
    }

    private function canStoreCatatan(Quiz $quiz, User $user): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        return $quiz->isInUserAudience($user)
            && $quiz->hasTeacherAccess($user->id, 'telaah_soal');
    }
}

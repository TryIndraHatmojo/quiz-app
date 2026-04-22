<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return redirect()->route('dashboard');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [App\Http\Controllers\DashboardController::class, 'index'])->name('dashboard');
});

Route::middleware(['auth', 'verified'])->prefix('master')->name('master.')->group(function () {
    Route::resource('users', App\Http\Controllers\Master\UserController::class);
    Route::resource('roles', App\Http\Controllers\Master\RoleController::class);
    Route::get('roles/{role}/access', [App\Http\Controllers\Master\RoleMenuController::class, 'index'])->name('roles.access');
    Route::post('roles/{role}/access', [App\Http\Controllers\Master\RoleMenuController::class, 'update'])->name('roles.access.update');
    Route::resource('categories', App\Http\Controllers\Master\QuizCategoryController::class)->parameters(['categories' => 'category']);
    Route::resource('kelas', App\Http\Controllers\Master\KelasController::class)->parameters(['kelas' => 'kela']);
    Route::resource('backgrounds', App\Http\Controllers\Master\QuizBackgroundController::class);
    Route::resource('galleries', App\Http\Controllers\Master\GalleryController::class);
    Route::resource('jenjang', App\Http\Controllers\Master\JenjangController::class);
});

Route::middleware(['auth', 'verified'])->prefix('library')->name('library.')->group(function () {
    Route::resource('quizzes', App\Http\Controllers\Library\QuizController::class);
    Route::patch('quizzes/{quiz}/status', [App\Http\Controllers\Library\QuizController::class, 'updateStatus'])->name('quizzes.status.update');
    Route::get('quizzes/{quiz}/questions', [App\Http\Controllers\Library\QuizController::class, 'questions'])->name('quizzes.questions');
    Route::post('quizzes/{quiz}/questions', [App\Http\Controllers\Library\QuizController::class, 'storeQuestions'])->name('quizzes.questions.store');
    Route::get('quizzes/{quiz}/preview', [App\Http\Controllers\Library\QuizController::class, 'preview'])->name('quizzes.preview');
    Route::get('quizzes/{quiz}/telaah-soal', [App\Http\Controllers\Library\QuizController::class, 'telaahSoal'])->name('quizzes.telaah-soal');
    
    // Quiz Access Management
    Route::get('quizzes/{quiz}/access', [App\Http\Controllers\Library\QuizController::class, 'access'])->name('quizzes.access');
    Route::post('quizzes/{quiz}/access/teacher', [App\Http\Controllers\Library\QuizController::class, 'grantTeacherAccess'])->name('quizzes.access.teacher.grant');
    Route::delete('quizzes/{quiz}/access/teacher/{user}', [App\Http\Controllers\Library\QuizController::class, 'revokeTeacherAccess'])->name('quizzes.access.teacher.revoke');
    Route::post('quizzes/{quiz}/access/student', [App\Http\Controllers\Library\QuizController::class, 'grantStudentAccess'])->name('quizzes.access.student.grant');
    Route::delete('quizzes/{quiz}/access/student/{user}', [App\Http\Controllers\Library\QuizController::class, 'revokeStudentAccess'])->name('quizzes.access.student.revoke');
    Route::post('quizzes/{quiz}/access/student/jenjang', [App\Http\Controllers\Library\QuizController::class, 'grantStudentAccessByJenjang'])->name('quizzes.access.student.jenjang');

    // Catatan Telaah Soal
    Route::get('questions/{question}/catatan', [App\Http\Controllers\Library\CatatanTelaahSoalController::class, 'index'])->name('catatan-telaah.index');
    Route::post('questions/{question}/catatan', [App\Http\Controllers\Library\CatatanTelaahSoalController::class, 'store'])->name('catatan-telaah.store');
    Route::patch('catatan-telaah/{catatan}/resolve', [App\Http\Controllers\Library\CatatanTelaahSoalController::class, 'resolve'])->name('catatan-telaah.resolve');
    Route::patch('catatan-telaah/{catatan}/reopen', [App\Http\Controllers\Library\CatatanTelaahSoalController::class, 'reopen'])->name('catatan-telaah.reopen');
    Route::delete('catatan-telaah/{catatan}', [App\Http\Controllers\Library\CatatanTelaahSoalController::class, 'destroy'])->name('catatan-telaah.destroy');
});

// Quiz Attempt Routes (for students taking quizzes)
Route::middleware(['auth', 'verified'])->prefix('quiz')->name('quiz.')->group(function () {
    Route::get('{quiz}/start', [App\Http\Controllers\QuizAttemptController::class, 'start'])->name('start');
    Route::post('attempt/{attempt}/answer', [App\Http\Controllers\QuizAttemptController::class, 'saveAnswer'])->name('answer');
    Route::post('attempt/{attempt}/complete', [App\Http\Controllers\QuizAttemptController::class, 'complete'])->name('complete');
    Route::get('attempt/{attempt}/result', [App\Http\Controllers\QuizAttemptController::class, 'result'])->name('result');
});

Route::middleware(['auth', 'verified'])->prefix('nilai')->name('nilai.')->group(function () {
    Route::get('/', [App\Http\Controllers\Nilai\NilaiController::class, 'index'])->name('index');
    Route::get('/{attempt}', [App\Http\Controllers\Nilai\NilaiController::class, 'show'])->name('show');
    Route::patch('/{attempt}/question-score', [App\Http\Controllers\Nilai\NilaiController::class, 'updateQuestionScore'])->name('question-score.update');
});

require __DIR__.'/settings.php';

<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [App\Http\Controllers\DashboardController::class, 'index'])->name('dashboard');
});

Route::middleware(['auth', 'verified'])->prefix('master')->name('master.')->group(function () {
    Route::resource('users', App\Http\Controllers\Master\UserController::class);
    Route::resource('roles', App\Http\Controllers\Master\RoleController::class);
    Route::resource('categories', App\Http\Controllers\Master\QuizCategoryController::class)->parameters(['categories' => 'category']);
    Route::resource('kelas', App\Http\Controllers\Master\KelasController::class)->parameters(['kelas' => 'kela']);
    Route::resource('backgrounds', App\Http\Controllers\Master\QuizBackgroundController::class);
    Route::resource('galleries', App\Http\Controllers\Master\GalleryController::class);
    Route::resource('jenjang', App\Http\Controllers\Master\JenjangController::class);
});

Route::middleware(['auth', 'verified'])->prefix('library')->name('library.')->group(function () {
    Route::resource('quizzes', App\Http\Controllers\Library\QuizController::class);
    Route::get('quizzes/{quiz}/questions', [App\Http\Controllers\Library\QuizController::class, 'questions'])->name('quizzes.questions');
    Route::post('quizzes/{quiz}/questions', [App\Http\Controllers\Library\QuizController::class, 'storeQuestions'])->name('quizzes.questions.store');
    Route::get('quizzes/{quiz}/preview', [App\Http\Controllers\Library\QuizController::class, 'preview'])->name('quizzes.preview');
    
    // Quiz Access Management
    Route::get('quizzes/{quiz}/access', [App\Http\Controllers\Library\QuizController::class, 'access'])->name('quizzes.access');
    Route::post('quizzes/{quiz}/access/teacher', [App\Http\Controllers\Library\QuizController::class, 'grantTeacherAccess'])->name('quizzes.access.teacher.grant');
    Route::delete('quizzes/{quiz}/access/teacher/{user}', [App\Http\Controllers\Library\QuizController::class, 'revokeTeacherAccess'])->name('quizzes.access.teacher.revoke');
    Route::post('quizzes/{quiz}/access/student', [App\Http\Controllers\Library\QuizController::class, 'grantStudentAccess'])->name('quizzes.access.student.grant');
    Route::delete('quizzes/{quiz}/access/student/{user}', [App\Http\Controllers\Library\QuizController::class, 'revokeStudentAccess'])->name('quizzes.access.student.revoke');
    Route::post('quizzes/{quiz}/access/student/jenjang', [App\Http\Controllers\Library\QuizController::class, 'grantStudentAccessByJenjang'])->name('quizzes.access.student.jenjang');
});

// Quiz Attempt Routes (for students taking quizzes)
Route::middleware(['auth', 'verified'])->prefix('quiz')->name('quiz.')->group(function () {
    Route::get('{quiz}/start', [App\Http\Controllers\QuizAttemptController::class, 'start'])->name('start');
    Route::post('attempt/{attempt}/answer', [App\Http\Controllers\QuizAttemptController::class, 'saveAnswer'])->name('answer');
    Route::post('attempt/{attempt}/complete', [App\Http\Controllers\QuizAttemptController::class, 'complete'])->name('complete');
    Route::get('attempt/{attempt}/result', [App\Http\Controllers\QuizAttemptController::class, 'result'])->name('result');
});

require __DIR__.'/settings.php';

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
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});

Route::middleware(['auth', 'verified'])->prefix('master')->name('master.')->group(function () {
    Route::resource('users', App\Http\Controllers\Master\UserController::class);
    Route::resource('roles', App\Http\Controllers\Master\RoleController::class);
    Route::resource('backgrounds', App\Http\Controllers\Master\QuizBackgroundController::class);
    Route::resource('galleries', App\Http\Controllers\Master\GalleryController::class);
});

Route::middleware(['auth', 'verified'])->prefix('library')->name('library.')->group(function () {
    Route::resource('quizzes', App\Http\Controllers\Library\QuizController::class);
    Route::get('quizzes/{quiz}/questions', [App\Http\Controllers\Library\QuizController::class, 'questions'])->name('quizzes.questions');
    Route::post('quizzes/{quiz}/questions', [App\Http\Controllers\Library\QuizController::class, 'storeQuestions'])->name('quizzes.questions.store');
});

require __DIR__.'/settings.php';

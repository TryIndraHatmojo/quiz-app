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
    Route::get('/users', [App\Http\Controllers\Master\UserController::class, 'index'])->name('users.index');
    Route::get('/roles', [App\Http\Controllers\Master\RoleController::class, 'index'])->name('roles.index');
});

require __DIR__.'/settings.php';

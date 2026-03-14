<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\BlogController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

Route::get('/blog', function () {
    return Inertia::render('weekly-blog/blog');
});

Route::get('/create', function () {
    return Inertia::render('weekly-blog/create');
});

Route::get('/edit/{id}', function ($id) {
    return Inertia::render('weekly-blog/edit');
});

// Blog routes
Route::get('/blogs', [BlogController::class, 'index']);
Route::post('/blogs', [BlogController::class, 'store']);
Route::get('/blogs/{id}', [BlogController::class, 'show']);
Route::put('/blogs/{id}', [BlogController::class, 'update']);
Route::delete('/blogs/{id}', [BlogController::class, 'destroy']);
Route::get('/docs', function () {
    return response()->json(\App\Models\Blog::whereNotNull('documentation_images')
        ->where('documentation_images', '!=', '[]')
        ->get(['id', 'task', 'week', 'date', 'featured_image', 'documentation_images']));
});

require __DIR__.'/auth.php';

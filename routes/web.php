<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\BlogController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Illuminate\Http\Request;

// Simple test route
Route::get('/test', function () {
    return response()->json([
        'status' => 'ok',
        'timestamp' => now(),
        'php_version' => PHP_VERSION,
    ]);
});

// Debug route to show Laravel errors
Route::get('/debug', function () {
    $error = error_get_last();
    $message = $error ? $error['message'] : 'No PHP error';
    $exception = app('exceptions')->getException();
    return response()->json([
        'error' => $message,
        'exception' => $exception ? $exception->getMessage() : null,
        'env' => config('app.env'),
        'url' => config('app.url'),
        'storage_link_exists' => file_exists(public_path('storage')),
    ]);
});

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

Route::get('/admin', function () {
    return Inertia::render('weekly-blog/admin');
});

Route::post('/admin/check-password', function (Request $request) {
    $expectedPassword = env('ADMIN_PASSWORD');

    if (empty($expectedPassword)) {
        return response()->json(['error' => 'Admin not configured'], 500);
    }

    $password = $request->input('password');
    if (!is_string($password) || $password !== $expectedPassword) {
        return response()->json(['error' => 'Forbidden'], 403);
    }

    return response()->json(['ok' => true]);
});

Route::post('/admin/unlock', function (Request $request) {
    $expectedPassword = env('ADMIN_PASSWORD');
    $expectedToken = env('ADMIN_TOKEN');

    if (empty($expectedPassword) || empty($expectedToken)) {
        return response()->json(['error' => 'Admin not configured'], 500);
    }

    $password = $request->input('password');
    $token = $request->input('token');

    if (!is_string($password) || !is_string($token)) {
        return response()->json(['error' => 'Forbidden'], 403);
    }

    if ($password !== $expectedPassword || $token !== $expectedToken) {
        return response()->json(['error' => 'Forbidden'], 403);
    }

    return response()->json(['ok' => true]);
});

// Blog routes
Route::get('/blogs', [BlogController::class, 'index']);
Route::post('/blogs', [BlogController::class, 'store'])->middleware('admin.token');
Route::get('/blogs/{id}', [BlogController::class, 'show']);
Route::put('/blogs/{id}', [BlogController::class, 'update'])->middleware('admin.token');
Route::delete('/blogs/{id}', [BlogController::class, 'destroy'])->middleware('admin.token');
Route::get('/docs', function () {
    return response()->json(\App\Models\Blog::whereNotNull('documentation_images')
        ->where('documentation_images', '!=', '[]')
        ->get(['id', 'task', 'week', 'date_from', 'date_to', 'featured_image', 'documentation_images']));
});

require __DIR__.'/auth.php';

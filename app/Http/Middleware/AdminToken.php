<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class AdminToken
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next)
    {
        $expected = env('ADMIN_TOKEN');

        // If no token is configured, do not block requests (useful for local dev).
        if (empty($expected)) {
            return $next($request);
        }

        $provided = $request->header('X-ADMIN-TOKEN');

        if (!is_string($provided) || $provided !== $expected) {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        return $next($request);
    }
}

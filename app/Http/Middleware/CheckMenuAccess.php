<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\Menu;

class CheckMenuAccess
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        if (!$user) {
            return $next($request);
        }

        $routeName = $request->route()?->getName();
        if (!$routeName) {
            return $next($request);
        }

        // Cek apakah route ini terdaftar sebagai menu
        $menu = Menu::where('route_name', $routeName)->first();

        if (!$menu) {
            return $next($request);
        }

        // Admin selalu memiliki akses (optional)
        if ($user->roles()->where('name', 'Admin')->exists()) {
            return $next($request);
        }

        // Cek apakah user memiliki peran yang terhubung ke menu ini
        $hasAccess = $user->roles()->whereHas('menus', function ($query) use ($menu) {
            $query->where('menus.id', $menu->id);
        })->exists();

        if (!$hasAccess) {
            if ($request->wantsJson()) {
                return response()->json(['message' => 'Anda tidak memiliki hak akses ke halaman ini.'], 403);
            }
            
            // Jika Inertia/Web, redirect dengan pesan error
            return redirect()->route('dashboard')->with('error', 'Anda tidak memiliki hak akses ke menu tersebut.');
        }

        return $next($request);
    }
}

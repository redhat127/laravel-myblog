<?php

namespace App\Http\Middleware;

use App\Models\RememberToken;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cookie;
use Symfony\Component\HttpFoundation\Response;

class RememberDevice
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $token = $request->cookie('remember_device');

        if ($token) {
            $hashed = hash('sha256', $token);
            $remember = RememberToken::where('token', $hashed)->first();

            if ($remember) {
                // If not authenticated, log them in
                if (! Auth::check()) {
                    Auth::loginUsingId($remember->user_id);
                    $request->session()->regenerate();
                }

                // Update last used timestamp
                $remember->update([
                    'last_used_at' => now(),
                    'ip_address' => $request->ip(),
                ]);

                // Always prolong the cookie
                Cookie::queue(
                    'remember_device',
                    $token,
                    60 * 24 * 30 // 30 days
                );
            }
        }

        return $next($request);
    }
}

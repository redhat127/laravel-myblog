<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\CustomRateLimiter;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cookie;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class LoginController extends Controller
{
    public function get()
    {
        return inertia('auth/login');
    }

    public function post()
    {
        $ipKey = 'auth.login.ip.'.request()->ip();

        if (CustomRateLimiter::tooManyAttempts($ipKey, maxAttempts: 30)) {
            return CustomRateLimiter::response($ipKey);
        }

        $validated = request()->validate([
            'email' => ['bail', 'required', 'string', 'email', 'max:50'],
            'password' => ['bail', 'required', 'string', 'min:1', 'max:50'],
            'remember_me' => ['bail', 'required', 'boolean'],
        ]);

        $email = strtolower($validated['email']);
        $key = 'auth.login.post.'
            .request()->ip()
            .'.'
            .hash('sha256', $email);

        if (CustomRateLimiter::tooManyAttempts($key, maxAttempts: 5)) {
            return CustomRateLimiter::response($key);
        }

        $credentials = collect($validated)->except('remember_me')->all();

        $user = User::whereEmail($credentials['email'])
            ->first();

        if ($user && Hash::check($credentials['password'], $user->password)) {
            Auth::login($user);

            if ($validated['remember_me']) {
                $plainToken = Str::random(64);

                request()->user()->rememberTokens()->create([
                    'token' => hash('sha256', $plainToken),
                    'ip_address' => request()->ip(),
                    'user_agent' => request()->userAgent(),
                    'last_used_at' => now(),
                ]);

                Cookie::queue(
                    'remember_device',
                    $plainToken,
                    60 * 24 * 30 // 30 days
                );
            }

            request()->session()->regenerate();

            CustomRateLimiter::clear($key);

            return redirect()->intended()
                ->with('flashMessage', [
                    'type' => 'success',
                    'text' => 'You are logged in.',
                ]);
        }

        throw ValidationException::withMessages([
            'email' => 'Invalid email or password.',
        ]);
    }
}

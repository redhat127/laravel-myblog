<?php

namespace App\Services;

use Illuminate\Support\Facades\RateLimiter;

class CustomRateLimiter
{
    public static function tooManyAttempts(string $key, int $maxAttempts = 3): bool
    {
        if (RateLimiter::tooManyAttempts($key, $maxAttempts)) {
            return true;
        }

        RateLimiter::increment($key);

        return false;
    }

    public static function response(string $key)
    {
        return back()->with('flashMessage', [
            'type' => 'error',
            'text' => 'Too many requests have been sent. try again in '
                .RateLimiter::availableIn($key)
                .' seconds.',
        ]);
    }

    public static function clear(string $key): void
    {
        RateLimiter::clear($key);
    }
}

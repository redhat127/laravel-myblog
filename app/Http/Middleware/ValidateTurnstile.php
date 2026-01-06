<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Symfony\Component\HttpFoundation\Response;

class ValidateTurnstile
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (! app()->isProduction()) {
            return $next($request);
        }

        if (! config('services.turnstile.secret_key')) {
            logger()->error('Turnstile secret key not configured');
            abort(500, 'Security verification not configured');
        }

        $token = $request->input('cf-turnstile-response');

        if (! $token) {
            return back()->with('flashMessage', [
                'type' => 'error',
                'text' => 'Complete the verification challenge first.',
            ]);
        }

        try {
            $response = Http::timeout(10)
                ->asForm()
                ->post('https://challenges.cloudflare.com/turnstile/v0/siteverify', [
                    'secret' => config('services.turnstile.secret_key'),
                    'response' => $token,
                    'remoteip' => $request->ip(),
                ]);

            if (! $response->successful()) {
                throw new \Exception('Turnstile API request failed');
            }

            $result = $response->json();

            if (! $result['success']) {
                $errorCodes = $result['error-codes'] ?? [];
                $errorMessage = 'Verification failed. try again.';

                if (in_array('timeout-or-duplicate', $errorCodes)) {
                    $errorMessage = 'Verification expired or already used. try again.';
                } elseif (in_array('invalid-input-response', $errorCodes)) {
                    $errorMessage = 'Invalid verification token. try again.';
                }

                return back()->with('flashMessage', [
                    'type' => 'error',
                    'text' => $errorMessage,
                ]);
            }
        } catch (\Exception $e) {
            logger()->error('Turnstile verification failed', [
                'error' => $e->getMessage(),
                'token' => substr($token, 0, 10).'...',
            ]);

            return back()->with('flashMessage', [
                'type' => 'error',
                'text' => 'Verification service unavailable. try again later.',
            ]);
        }

        return $next($request);
    }
}

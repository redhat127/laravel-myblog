<?php

use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\RememberDevice;
use App\HttpStatusCode;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpFoundation\Response;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->web(append: [
            RememberDevice::class,
            HandleInertiaRequests::class,
            // AddLinkHeadersForPreloadedAssets::class,
        ]);

        $middleware->redirectGuestsTo(fn () => route('auth.login.get'));
        $middleware->redirectUsersTo(fn () => route('home'));

        $middleware->throttleWithRedis();
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->respond(function (
            Response $response,
            Throwable $exception,
            Request $request
        ) {
            if (! app()->isProduction() || $exception instanceof ValidationException) {
                return $response;
            }

            $statusCode = $response->getStatusCode();

            if ($statusCode < 400 || $statusCode >= 600) {
                return $response;
            }

            $message = HttpStatusCode::getMessage($statusCode);

            if (! $request->isMethod('GET')) {
                $redirect = url()->previous()
                    ? back()
                    : redirect()->route('home');

                return $redirect->with('flashMessage', [
                    'type' => 'error',
                    'text' => $message,
                ]);
            }

            return inertia('error', [
                'statusCode' => $statusCode,
                'title' => HttpStatusCode::getTitle($statusCode),
                'message' => $message,
            ])
                ->toResponse($request)
                ->setStatusCode($statusCode);
        });
    })->create();

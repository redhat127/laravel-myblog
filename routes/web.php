<?php

use App\Http\Controllers\ChangePasswordController;
use App\Http\Controllers\LoginController;
use App\Http\Controllers\LogoutController;
use App\Http\Controllers\PostController;
use App\Http\Controllers\ResetPasswordController;
use App\Http\Middleware\ValidateTurnstile;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return inertia('home');
})->name('home');

Route::middleware('guest')
    ->group(function () {
        Route::prefix('auth')
            ->name('auth.')
            ->group(function () {
                Route::prefix('login')
                    ->name('login.')
                    ->controller(LoginController::class)
                    ->group(function () {
                        Route::get('/', 'get')->name('get');
                        Route::post('/', 'post')->name('post')
                            ->middleware(ValidateTurnstile::class);
                    });

                Route::prefix('logout')
                    ->name('logout.')
                    ->controller(LogoutController::class)
                    ->withoutMiddleware('guest')
                    ->middleware('auth')
                    ->group(function () {
                        Route::post('/', 'post')->name('post');
                    });

                Route::prefix('reset-password')
                    ->name('reset-password.')
                    ->controller(ResetPasswordController::class)
                    ->group(function () {
                        Route::get('/', 'get')->name('get');
                        Route::post('/', 'post')->name('post')
                            ->middleware(ValidateTurnstile::class);
                    });

                Route::prefix('change-password')
                    ->name('change-password.')
                    ->controller(ChangePasswordController::class)
                    ->group(function () {
                        Route::get('/', 'get')->name('get');
                        Route::post('/', 'post')->name('post')
                            ->middleware(ValidateTurnstile::class);
                    });
            });
    });

Route::middleware('auth')
    ->group(function () {
        Route::prefix('post')
            ->name('post.')
            ->controller(PostController::class)
            ->group(function () {
                Route::get('/', 'all')->name('all');
                Route::get('/create', 'create')->name('create');
                Route::post('/create', 'store')->name('store');
            });
    });

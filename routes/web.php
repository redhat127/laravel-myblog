<?php

use App\Http\Controllers\LoginController;
use App\Http\Controllers\LogoutController;
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
                        Route::post('/', 'post')->name('post');
                    });

                Route::prefix('logout')
                    ->name('logout.')
                    ->controller(LogoutController::class)
                    ->withoutMiddleware('guest')
                    ->middleware('auth')
                    ->group(function () {
                        Route::post('/', 'post')->name('post');
                    });
            });
    });

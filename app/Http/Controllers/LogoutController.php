<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Auth;

class LogoutController extends Controller
{
    public function post()
    {
        self::logoutAction();

        return redirect()->route('home')->with('flashMessage', [
            'type' => 'success',
            'text' => 'You are logged out.',
        ]);
    }

    public static function logoutAction()
    {
        Auth::logout();

        request()->session()->invalidate();
        request()->session()->regenerateToken();
    }
}

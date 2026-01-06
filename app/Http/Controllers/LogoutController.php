<?php

namespace App\Http\Controllers;

use App\Models\RememberToken;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cookie;

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
        if ($token = request()->cookie('remember_device')) {
            RememberToken::where('token', hash('sha256', $token))->delete();
        }

        Auth::logout();

        request()->session()->invalidate();
        request()->session()->regenerateToken();

        Cookie::queue(Cookie::forget('remember_device'));
    }
}

<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class LoginController extends Controller
{
    public function get()
    {
        return inertia('auth/login');
    }

    public function post()
    {
        $validated = request()->validate([
            'email' => ['bail', 'required', 'string', 'email', 'max:50'],
            'password' => ['bail', 'required', 'string', 'min:1', 'max:50'],
            'remember_me' => ['bail', 'required', 'boolean'],
        ]);

        $credentials = collect($validated)->except('remember_me')->all();

        $user = User::whereEmail($credentials['email'])
            ->first();

        if ($user && Hash::check($credentials['password'], $user->password)) {
            Auth::login($user, $validated['remember_me']);

            request()->session()->regenerate();

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

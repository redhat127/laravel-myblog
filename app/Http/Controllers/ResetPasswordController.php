<?php

namespace App\Http\Controllers;

use App\Mail\Auth\ResetPasswordMail;
use App\Models\User;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class ResetPasswordController extends Controller
{
    public function get()
    {
        return inertia('auth/reset-password');
    }

    public function post()
    {
        $validated = request()->validate([
            'email' => ['bail', 'required', 'string', 'email', 'max:50'],
        ]);

        $email = $validated['email'];

        $user = User::whereEmail($email)->first();

        if ($user) {
            $user->resetPassword()->delete();

            $token = Str::random(32);
            $expires_in_minutes = 30;

            $user->resetPassword()->create([
                'token' => $token,
                'expires_at' => now()->addMinutes($expires_in_minutes),
            ]);

            Mail::to($user)->send(new ResetPasswordMail(
                name: $user->name,
                token: $token,
                expires_in_minutes: $expires_in_minutes
            ));
        }

        return back()->with('flashMessage', [
            'type' => 'success',
            'text' => 'If your email address exists in our system, we will send you a token to reset your password.',
        ]);
    }
}

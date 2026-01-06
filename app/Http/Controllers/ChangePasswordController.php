<?php

namespace App\Http\Controllers;

use App\Mail\Auth\YourPasswordChangedMail;
use App\Models\User;
use App\Services\CustomRateLimiter;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;

class ChangePasswordController extends Controller
{
    public function get()
    {
        return inertia('auth/change-password');
    }

    public function post()
    {
        $validated = request()->validate([
            'email' => ['bail', 'required', 'string', 'email', 'max:50'],
            'token' => ['bail', 'required', 'string', 'min:1', 'max:50'],
            'newPassword' => ['bail', 'required', 'string', 'min:10', 'max:50'],
        ]);

        $email = strtolower($validated['email']);
        $key = 'auth.change-password.post.'
            .request()->ip()
            .'.'
            .hash('sha256', $email);

        if (CustomRateLimiter::tooManyAttempts($key)) {
            return CustomRateLimiter::response($key);
        }

        $user = User::whereEmail($validated['email'])->first();

        if ($user) {
            $resetPassword = $user->resetPassword;

            if (
                $resetPassword
                && Hash::check($validated['token'], $resetPassword->token)
                && $resetPassword->expires_at->isFuture()
            ) {
                if (Hash::check($validated['newPassword'], $user->password)) {
                    return back()->with('flashMessage', [
                        'type' => 'error',
                        'text' => 'New password must be different from current password.',
                    ]);
                }

                $resetPassword->delete();

                $user->update([
                    'password' => $validated['newPassword'],
                    'password_changed_at' => now(),
                ]);

                $user->logoutAllDevices();

                Mail::to($user)->send(new YourPasswordChangedMail(
                    name: $user->name,
                    password_changed_at: $user->password_changed_at
                ));

                CustomRateLimiter::clear($key);

                return redirect()->route('auth.login.get')
                    ->with('flashMessage', [
                        'type' => 'success',
                        'text' => 'Your password has been changed. login with new password.',
                    ]);
            }
        }

        return redirect()->route('auth.reset-password.get')
            ->with('flashMessage', [
                'type' => 'error',
                'text' => 'Token is invalid or expired. try again.',
            ]);
    }
}

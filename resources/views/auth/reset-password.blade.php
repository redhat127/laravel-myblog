<x-mail::message>
# Reset Password

Dear, {{ $name }}

You have requested to reset your password. Use the following token to change your password:

<x-mail::panel>
**{{ $token }}**
</x-mail::panel>

This token will expire in {{ $expires_in_minutes }} minutes.

<x-mail::button :url="route('auth.change-password.get')">
Change Password
</x-mail::button>

If you did not request this reset password, no further action is required.

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>

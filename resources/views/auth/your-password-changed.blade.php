<x-mail::message>
# {{ $subject }}

Dear {{ $name }},

Your password has been changed.

**Changed on:**
- UTC: {{ $password_changed_at_utc }}
- Tehran: {{ $password_changed_at_tehran }}

We have logged you out of your devices to keep your account extra secure.

If you made this change, you can safely ignore this email.

**If you did NOT make this change**, your account may be compromised. Please take action immediately:

<x-mail::button :url="route('auth.reset-password.get')">
Reset Password Now
</x-mail::button>

If you need assistance, please contact our support team.

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>

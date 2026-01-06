<?php

namespace App\Mail\Auth;

use Carbon\Carbon;
use Carbon\CarbonImmutable;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class YourPasswordChangedMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    /**
     * Create a new message instance.
     */
    public function __construct(
        public string $name,
        private Carbon|CarbonImmutable $password_changed_at,
        public $subject = 'Your Password Changed'
    ) {
        //
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            from: new Address(config('mail.from.address-noreply'), config('mail.from.name')),
            subject: $this->subject
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            markdown: 'auth.your-password-changed',
            with: [
                'password_changed_at_utc' => $this->password_changed_at->copy()->setTimezone('UTC')->format('F j, Y \a\t g:i A'),
                'password_changed_at_tehran' => $this->password_changed_at->copy()->setTimezone('Asia/Tehran')->format('F j, Y \a\t g:i A'),
            ]
        );
    }
}

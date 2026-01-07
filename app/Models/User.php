<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Cookie;
use Illuminate\Support\Facades\DB;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, HasUlids, Notifiable;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'password_changed_at' => 'datetime',
        ];
    }

    public function getRememberTokenName()
    {
        return null;
    }

    public function rememberTokens()
    {
        return $this->hasMany(RememberToken::class);
    }

    public function resetPassword()
    {
        return $this->hasOne(ResetPassword::class);
    }

    public function logoutAllDevices()
    {
        DB::table('sessions')->where('user_id', $this->id)->delete();

        $this->deleteAllRememberDevice();
    }

    public function deleteAllRememberDevice()
    {
        RememberToken::where('user_id', $this->id)->delete();

        Cookie::queue(Cookie::forget('remember_device'));
    }

    public function posts()
    {
        return $this->hasMany(Post::class);
    }
}

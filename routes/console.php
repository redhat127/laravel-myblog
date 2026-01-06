<?php

use App\Models\ResetPassword;
use Illuminate\Support\Facades\Schedule;

Schedule::call(function () {
    ResetPassword::where('expires_at', '<', now())->delete();
})->daily();

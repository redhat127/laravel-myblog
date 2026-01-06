<?php

namespace App;

class HttpStatusCode
{
    private static array $titles = [
        401 => 'Unauthorized',
        402 => 'Payment Required',
        403 => 'Forbidden',
        404 => 'Not Found',
        419 => 'CSRF Token Mismatch',
        429 => 'Too Many Requests',
        500 => 'Internal Server Error',
        503 => 'Service Unavailable',
    ];

    private static array $messages = [
        401 => 'Authentication is required and has failed or has not been provided.',
        402 => 'Payment is required to access this resource.',
        403 => 'The server understood the request but refuses to authorize it.',
        404 => 'The requested resource could not be found on the server.',
        419 => 'CSRF token validation failed. Please try again.',
        429 => 'Too many requests have been sent in a given amount of time.',
        500 => 'An unexpected error occurred on the server.',
        503 => 'The server is temporarily unavailable or under maintenance.',
    ];

    public static function getTitle(int $statusCode): ?string
    {
        return self::$titles[$statusCode] ?? null;
    }

    public static function getMessage(int $statusCode): ?string
    {
        return self::$messages[$statusCode] ?? null;
    }
}

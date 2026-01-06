<?php

use function Pest\Laravel\get;

test('home returns 200 response', function () {
    $response = get('/');

    $response->assertStatus(200);
});

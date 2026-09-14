<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->alias([
            'admin' => \App\Http\Middleware\EnsureUserIsAdmin::class,
        ]);

        // برخی هاست‌های اشتراکی (Apache/php-cgi) هدر Authorization را حذف می‌کنند و
        // فقط به‌صورت REDIRECT_HTTP_AUTHORIZATION منتقل می‌شود؛ Sanctum بدون آن 401 می‌دهد.
        if (isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION']) && ! isset($_SERVER['HTTP_AUTHORIZATION'])) {
            $_SERVER['HTTP_AUTHORIZATION'] = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
        }
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();

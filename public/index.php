<?php

use Illuminate\Foundation\Application;
use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

// Determine if the application is in maintenance mode...
if (file_exists($maintenance = __DIR__.'/../storage/framework/maintenance.php')) {
    require $maintenance;
}

// Register the Composer autoloader...
require __DIR__.'/../vendor/autoload.php';

// هاست‌های اشتراکی (Apache + php-cgi/FastCGI) هدر Authorization را از PHP حذف می‌کنند
// و فقط به‌صورت REDIRECT_HTTP_AUTHORIZATION منتقل می‌شود؛ بدون این هدر Sanctum
// هر درخواستی را با خطای «Unauthenticated» رد می‌کند. باید قبل از ساخت شیء Request
// انجام شود چون هدرها همان لحظه از $_SERVER خوانده می‌شوند.
foreach (['REDIRECT_HTTP_AUTHORIZATION', 'REDIRECT_REDIRECT_HTTP_AUTHORIZATION'] as $key) {
    if (isset($_SERVER[$key]) && ! isset($_SERVER['HTTP_AUTHORIZATION'])) {
        $_SERVER['HTTP_AUTHORIZATION'] = $_SERVER[$key];
        break;
    }
}

// Bootstrap Laravel and handle the request...
/** @var Application $app */
$app = require_once __DIR__.'/../bootstrap/app.php';

$app->handleRequest(Request::capture());

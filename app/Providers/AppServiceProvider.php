<?php

namespace App\Providers;

use Illuminate\Http\Request;
use Illuminate\Support\ServiceProvider;
use Laravel\Sanctum\Sanctum;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // برخی هاست‌های اشتراکی هدر Authorization را به‌کلی از PHP حذف می‌کنند؛
        // فرانت‌اند همان توکن را در هدر X-Auth-Token هم ارسال می‌کند تا احراز
        // هویت حتی در بدترین پیکربندی‌های هاست از کار نیفتد.
        Sanctum::getAccessTokenFromRequestUsing(function (Request $request) {
            return $request->bearerToken() ?: $request->header('X-Auth-Token');
        });
    }
}

<?php

namespace App\Http\Controllers;

use App\Models\User;

abstract class Controller
{
    // بررسی مجوز کاربر جاری؛ در صورت نداشتن، خطای 403 با پیام فارسی برمی‌گرداند
    protected function requirePermission(User $user, string $permission): void
    {
        if (! $user->hasPermissionTo($permission)) {
            $label = User::PERMISSIONS[$permission] ?? $permission;
            abort(403, "برای «{$label}» مجوز ندارید. با مدیر سامانه هماهنگ کنید.");
        }
    }
}

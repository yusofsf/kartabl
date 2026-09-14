<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // تنها حساب پیش‌فرض: مدیر سامانه
        User::updateOrCreate(
            ['mobile' => '09191546136'],
            [
                'name' => 'مدیر سامانه',
                'email' => null,
                'password' => '123456789',
                'role' => 'admin',
                'post' => 'مدیر کارتابل',
                'unit' => 'مدیریت',
                'is_active' => true,
            ]
        );
    }
}

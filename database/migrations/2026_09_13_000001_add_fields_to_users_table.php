<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('mobile')->unique()->after('name');
            $table->string('role')->default('user')->after('mobile'); // admin | user
            $table->string('post')->nullable()->after('role'); // سمت سازمانی
            $table->string('unit')->nullable()->after('post'); // واحد سازمانی
            $table->boolean('is_active')->default(true)->after('unit');
            $table->timestamp('last_login_at')->nullable()->after('is_active');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['mobile', 'role', 'post', 'unit', 'is_active', 'last_login_at']);
        });
    }
};

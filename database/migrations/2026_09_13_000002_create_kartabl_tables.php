<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // گروه‌های چت
        Schema::create('chat_groups', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->foreignId('created_by')->constrained('users')->cascadeOnDelete();
            $table->timestamps();
        });

        Schema::create('chat_group_user', function (Blueprint $table) {
            $table->id();
            $table->foreignId('chat_group_id')->constrained('chat_groups')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->timestamps();
            $table->unique(['chat_group_id', 'user_id']);
        });

        // پیام‌های چت (گروهی و خصوصی)
        Schema::create('chat_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('chat_group_id')->nullable()->constrained('chat_groups')->cascadeOnDelete();
            $table->foreignId('sender_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('recipient_id')->nullable()->constrained('users')->cascadeOnDelete();
            $table->text('message');
            $table->timestamp('read_at')->nullable();
            $table->timestamps();
        });

        // اطلاعیه‌ها / پیام کلی
        Schema::create('announcements', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('body');
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->boolean('pinned')->default(false);
            $table->timestamp('published_at')->useCurrent();
            $table->timestamps();
        });

        Schema::create('announcement_reads', function (Blueprint $table) {
            $table->id();
            $table->foreignId('announcement_id')->constrained('announcements')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->timestamp('read_at');
            $table->unique(['announcement_id', 'user_id']);
        });

        // مراودات داخلی (پیگیری‌ها / ارباب‌رجوع)
        Schema::create('correspondences', function (Blueprint $table) {
            $table->id();
            $table->string('number')->unique(); // شماره اندیکاتور
            $table->foreignId('creator_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('assignee_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('title');
            $table->text('body');
            $table->string('status')->default('pending'); // pending | in_progress | done | archived
            $table->string('priority')->default('normal'); // low | normal | high | urgent
            $table->date('due_date')->nullable();
            $table->timestamp('closed_at')->nullable();
            $table->timestamps();
        });

        Schema::create('correspondence_replies', function (Blueprint $table) {
            $table->id();
            $table->foreignId('correspondence_id')->constrained('correspondences')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->text('body');
            $table->string('status')->nullable(); // تغییر وضعیت همراه با پاسخ
            $table->timestamps();
        });

        // نامه‌ها (ارسال نامه داخلی)
        Schema::create('letters', function (Blueprint $table) {
            $table->id();
            $table->string('number')->unique(); // شماره نامه
            $table->string('type')->default('outgoing'); // incoming | outgoing
            $table->foreignId('creator_id')->constrained('users')->cascadeOnDelete();
            $table->string('subject');
            $table->text('body');
            $table->string('sender_org')->nullable();          // فرستنده (برای وارده)
            $table->string('receiver_org')->nullable();         // گیرنده (برای صادره)
            $table->date('letter_date');
            $table->string('action')->nullable();               // اقدام
            $table->string('attachment')->nullable();           // فایل پیوست
            $table->string('urgency')->default('normal');       // عادی | فوری | خیلی فوری
            $table->string('status')->default('draft');         // draft | sent | read
            $table->timestamps();
        });

        Schema::create('letter_recipients', function (Blueprint $table) {
            $table->id();
            $table->foreignId('letter_id')->constrained('letters')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->timestamp('read_at')->nullable();
            $table->unique(['letter_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('letter_recipients');
        Schema::dropIfExists('letters');
        Schema::dropIfExists('correspondence_replies');
        Schema::dropIfExists('correspondences');
        Schema::dropIfExists('announcement_reads');
        Schema::dropIfExists('announcements');
        Schema::dropIfExists('chat_messages');
        Schema::dropIfExists('chat_group_user');
        Schema::dropIfExists('chat_groups');
    }
};

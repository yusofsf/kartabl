<?php

use App\Http\Controllers\AnnouncementController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\CorrespondenceController;
use App\Http\Controllers\LetterController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

// ورود
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/change-password', [AuthController::class, 'changePassword']);

    // مدیریت کاربران (فقط مدیر)
    Route::middleware('admin')->apiResource('users', UserController::class)->except(['show']);

    // چت گروهی
    Route::get('/chat/groups', [ChatController::class, 'groups']);
    Route::post('/chat/groups', [ChatController::class, 'storeGroup']);
    Route::get('/chat/users', [ChatController::class, 'users']);
    Route::get('/chat/groups/{group}/messages', [ChatController::class, 'messages']);
    Route::post('/chat/groups/{group}/messages', [ChatController::class, 'sendMessage']);

    // اطلاعیه / پیام کلی
    Route::get('/announcements', [AnnouncementController::class, 'index']);
    Route::post('/announcements', [AnnouncementController::class, 'store']);
    Route::post('/announcements/{announcement}/read', [AnnouncementController::class, 'markRead']);
    Route::delete('/announcements/{announcement}', [AnnouncementController::class, 'destroy']);

    // مراودات داخلی
    Route::get('/correspondences', [CorrespondenceController::class, 'index']);
    Route::post('/correspondences', [CorrespondenceController::class, 'store']);
    Route::post('/correspondences/{correspondence}/reply', [CorrespondenceController::class, 'reply']);
    Route::patch('/correspondences/{correspondence}/status', [CorrespondenceController::class, 'updateStatus']);

    // نامه‌ها
    Route::get('/letters', [LetterController::class, 'index']);
    Route::post('/letters', [LetterController::class, 'store']);
    Route::post('/letters/{letter}/read', [LetterController::class, 'markRead']);
});

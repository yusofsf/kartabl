<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    // مجوزهای قابل اعطا توسط مدیر
    public const PERMISSIONS = [
        'send_letter' => 'ارسال نامه',
        'create_correspondence' => 'ثبت مراوده داخلی',
        'create_chat_group' => 'ایجاد گروه چت',
        'send_chat_message' => 'ارسال پیام در چت',
    ];

    protected $fillable = [
        'name',
        'email',
        'mobile',
        'password',
        'role',
        'post',
        'unit',
        'is_active',
        'permissions',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'last_login_at' => 'datetime',
            'is_active' => 'boolean',
            'permissions' => 'array',
            'password' => 'hashed',
        ];
    }

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    // مدیر همیشه همه مجوزها را دارد (نام can با متد داخلی لاراول تضاد دارد)
    public function hasPermissionTo(string $permission): bool
    {
        if ($this->isAdmin()) {
            return true;
        }

        return in_array($permission, $this->permissions ?? [], true);
    }

    // گروه‌های چت که کاربر عضو آن است
    public function chatGroups()
    {
        return $this->belongsToMany(ChatGroup::class, 'chat_group_user');
    }

    public function announcements()
    {
        return $this->hasMany(Announcement::class);
    }

    public function readAnnouncements()
    {
        return $this->belongsToMany(Announcement::class, 'announcement_reads')->withPivot('read_at');
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Announcement extends Model
{
    protected $fillable = ['title', 'body', 'user_id', 'pinned', 'published_at'];

    protected $casts = [
        'pinned' => 'boolean',
        'published_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function reads()
    {
        return $this->belongsToMany(User::class, 'announcement_reads')->withPivot('read_at');
    }
}

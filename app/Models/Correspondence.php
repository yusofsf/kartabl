<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Correspondence extends Model
{
    protected $fillable = [
        'number',
        'creator_id',
        'assignee_id',
        'title',
        'body',
        'status',
        'priority',
        'due_date',
        'closed_at',
    ];

    protected $casts = [
        'due_date' => 'date',
        'closed_at' => 'datetime',
    ];

    public function creator()
    {
        return $this->belongsTo(User::class, 'creator_id');
    }

    public function assignee()
    {
        return $this->belongsTo(User::class, 'assignee_id');
    }

    public function replies()
    {
        return $this->hasMany(CorrespondenceReply::class)->with('user')->latest();
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Letter extends Model
{
    protected $fillable = [
        'number',
        'type',
        'creator_id',
        'subject',
        'body',
        'sender_org',
        'receiver_org',
        'letter_date',
        'action',
        'attachment',
        'urgency',
        'status',
    ];

    protected $casts = [
        'letter_date' => 'date',
    ];

    public function creator()
    {
        return $this->belongsTo(User::class, 'creator_id');
    }

    public function recipients()
    {
        return $this->belongsToMany(User::class, 'letter_recipients')->withPivot('read_at');
    }
}

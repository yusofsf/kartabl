<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CorrespondenceReply extends Model
{
    protected $fillable = ['correspondence_id', 'user_id', 'body', 'status'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function correspondence()
    {
        return $this->belongsTo(Correspondence::class);
    }
}

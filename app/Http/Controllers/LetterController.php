<?php

namespace App\Http\Controllers;

use App\Models\Letter;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class LetterController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $letters = Letter::with('creator:id,name,post')
            ->with(['recipients' => fn ($q) => $q->select('users.id', 'users.name', 'users.post')])
            ->when(! $user->isAdmin(), function ($query) use ($user) {
                // کاربر عادی: نامه‌هایی که ساخته یا گیرنده آن است
                $query->where(fn ($q) => $q
                    ->where('creator_id', $user->id)
                    ->orWhereHas('recipients', fn ($r) => $r->where('user_id', $user->id)));
            })
            ->latest('letter_date')
            ->get();

        return response()->json($letters);
    }

    public function store(Request $request)
    {
        $this->requirePermission($request->user(), 'send_letter');

        $data = $request->validate([
            'type' => ['required', 'in:incoming,outgoing'],
            'subject' => ['required', 'string', 'max:255'],
            'body' => ['required', 'string'],
            'sender_org' => ['nullable', 'string', 'max:255'],
            'receiver_org' => ['nullable', 'string', 'max:255'],
            'letter_date' => ['required', 'date'],
            'action' => ['nullable', 'string', 'max:255'],
            'urgency' => ['nullable', 'in:normal,urgent,very_urgent'],
            'recipients' => ['array'],
            'recipients.*' => ['integer', 'exists:users,id'],
        ]);

        $letter = Letter::create([
            'number' => ($data['type'] === 'incoming' ? 'و/' : 'ص/') . now()->format('Ymd') . '-' . strtoupper(Str::random(4)),
            'type' => $data['type'],
            'creator_id' => $request->user()->id,
            'subject' => $data['subject'],
            'body' => $data['body'],
            'sender_org' => $data['sender_org'] ?? null,
            'receiver_org' => $data['receiver_org'] ?? null,
            'letter_date' => $data['letter_date'],
            'action' => $data['action'] ?? null,
            'urgency' => $data['urgency'] ?? 'normal',
            'status' => 'sent',
        ]);

        if (! empty($data['recipients'])) {
            $letter->recipients()->attach($data['recipients']);
        }

        return response()->json(['message' => 'نامه ثبت و ارسال شد.', 'letter' => $letter->load(['creator:id,name,post', 'recipients:id,name,post'])], 201);
    }

    // گیرنده نامه را می‌خواند
    public function markRead(Request $request, Letter $letter)
    {
        $letter->recipients()->updateExistingPivot($request->user()->id, ['read_at' => now()]);

        return response()->json(['message' => 'ثبت شد.']);
    }
}

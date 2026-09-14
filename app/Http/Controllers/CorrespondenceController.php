<?php

namespace App\Http\Controllers;

use App\Models\Correspondence;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CorrespondenceController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $query = Correspondence::with(['creator:id,name,post', 'assignee:id,name,post', 'replies.user:id,name,post']);

        // کاربر عادی فقط مراودات خودش را می‌بیند؛ مدیر همه را
        if (! $user->isAdmin()) {
            $query->where(fn ($q) => $q->where('creator_id', $user->id)->orWhere('assignee_id', $user->id));
        }

        $items = $query->latest()->get();

        return response()->json($items);
    }

    public function store(Request $request)
    {
        $this->requirePermission($request->user(), 'create_correspondence');

        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'body' => ['required', 'string'],
            'assignee_id' => ['nullable', 'exists:users,id'],
            'priority' => ['nullable', 'in:low,normal,high,urgent'],
            'due_date' => ['nullable', 'date'],
        ]);

        $item = Correspondence::create([
            'number' => 'M-' . now()->format('Ymd') . '-' . strtoupper(Str::random(4)),
            'creator_id' => $request->user()->id,
            'assignee_id' => $data['assignee_id'] ?? null,
            'title' => $data['title'],
            'body' => $data['body'],
            'priority' => $data['priority'] ?? 'normal',
            'due_date' => $data['due_date'] ?? null,
            'status' => 'pending',
        ]);

        return response()->json(['message' => 'مراوده ثبت شد.', 'correspondence' => $item->load(['creator:id,name,post', 'assignee:id,name,post'])], 201);
    }

    // پاسخ / پیگیری + تغییر وضعیت
    public function reply(Request $request, Correspondence $correspondence)
    {
        $user = $request->user();

        if (! $user->isAdmin()
            && $correspondence->creator_id !== $user->id
            && $correspondence->assignee_id !== $user->id
        ) {
            abort(403, 'شما به این مراوده دسترسی ندارید.');
        }

        $data = $request->validate([
            'body' => ['required', 'string'],
            'status' => ['nullable', 'in:pending,in_progress,done,archived'],
        ]);

        $correspondence->replies()->create([
            'user_id' => $user->id,
            'body' => $data['body'],
            'status' => $data['status'] ?? null,
        ]);

        if (! empty($data['status'])) {
            $correspondence->update([
                'status' => $data['status'],
                'closed_at' => $data['status'] === 'done' ? now() : null,
            ]);
        }

        return response()->json(['message' => 'پاسخ ثبت شد.', 'correspondence' => $correspondence->load(['creator:id,name,post', 'assignee:id,name,post', 'replies.user:id,name,post'])]);
    }

    public function updateStatus(Request $request, Correspondence $correspondence)
    {
        $user = $request->user();

        if (! $user->isAdmin()
            && $correspondence->creator_id !== $user->id
            && $correspondence->assignee_id !== $user->id
        ) {
            abort(403, 'شما به این مراوده دسترسی ندارید.');
        }

        $data = $request->validate([
            'status' => ['required', 'in:pending,in_progress,done,archived'],
        ]);

        $correspondence->update([
            'status' => $data['status'],
            'closed_at' => $data['status'] === 'done' ? now() : null,
        ]);

        return response()->json(['message' => 'وضعیت به‌روزرسانی شد.']);
    }
}

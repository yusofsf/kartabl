<?php

namespace App\Http\Controllers;

use App\Models\ChatGroup;
use App\Models\ChatMessage;
use App\Models\User;
use Illuminate\Http\Request;

class ChatController extends Controller
{
    // گروه‌های چت کاربر جاری + پیام‌های جدید
    public function groups(Request $request)
    {
        $user = $request->user();

        $groups = ChatGroup::with(['users' => fn ($q) => $q->select('users.id', 'users.name', 'users.post')])
            ->withCount('messages')
            ->where('created_by', $user->id)
            ->orWhereHas('users', fn ($q) => $q->where('user_id', $user->id))
            ->latest()
            ->get();

        return response()->json($groups);
    }

    public function storeGroup(Request $request)
    {
        $this->requirePermission($request->user(), 'create_chat_group');

        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'members' => ['array'],
            'members.*' => ['integer', 'exists:users,id'],
        ]);

        $group = ChatGroup::create([
            'name' => $data['name'],
            'description' => $data['description'] ?? null,
            'created_by' => $request->user()->id,
        ]);

        // مدیر همیشه عضو گروه است
        $members = array_unique(array_merge($data['members'] ?? [], [$request->user()->id]));
        $group->users()->attach($members);

        return response()->json(['message' => 'گروه چت ایجاد شد.', 'group' => $group->load('users')], 201);
    }

    public function messages(Request $request, ChatGroup $group)
    {
        $user = $request->user();

        if (! $group->users()->where('user_id', $user->id)->exists()) {
            abort(403, 'شما عضو این گروه نیستید.');
        }

        $afterId = (int) $request->query('after', 0);

        $messages = ChatMessage::with('sender:id,name,post')
            ->where('chat_group_id', $group->id)
            ->when($afterId > 0, fn ($q) => $q->where('id', '>', $afterId))
            ->orderBy('id')
            ->get();

        return response()->json($messages);
    }

    public function sendMessage(Request $request, ChatGroup $group)
    {
        $user = $request->user();

        $this->requirePermission($user, 'send_chat_message');

        if (! $group->users()->where('user_id', $user->id)->exists()) {
            abort(403, 'شما عضو این گروه نیستید.');
        }

        $data = $request->validate([
            'message' => ['required', 'string', 'max:5000'],
        ]);

        $message = ChatMessage::create([
            'chat_group_id' => $group->id,
            'sender_id' => $user->id,
            'message' => $data['message'],
        ])->load('sender:id,name,post');

        return response()->json($message, 201);
    }

    // همه اعضا برای انتخاب در گروه جدید
    public function users()
    {
        return response()->json(
            User::where('is_active', true)->orderBy('name')->get(['id', 'name', 'post', 'unit'])
        );
    }
}

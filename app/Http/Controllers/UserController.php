<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    public function index()
    {
        return response()->json(
            User::orderBy('name')->get(['id', 'name', 'mobile', 'email', 'role', 'post', 'unit', 'is_active', 'permissions', 'last_login_at'])
        );
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'mobile' => ['required', 'string', 'regex:/^09\d{9}$/', 'unique:users,mobile'],
            'email' => ['nullable', 'email', 'unique:users,email'],
            'password' => ['required', 'min:6'],
            'role' => ['nullable', Rule::in(['admin', 'user'])],
            'post' => ['nullable', 'string', 'max:255'],
            'unit' => ['nullable', 'string', 'max:255'],
            'permissions' => ['nullable', 'array'],
            'permissions.*' => ['string', Rule::in(array_keys(User::PERMISSIONS))],
        ]);

        $user = User::create([
            'name' => $data['name'],
            'mobile' => $data['mobile'],
            'email' => $data['email'] ?? null,
            'password' => $data['password'] ?: '123456789',
            'role' => $data['role'] ?? 'user',
            'post' => $data['post'] ?? null,
            'unit' => $data['unit'] ?? null,
            'is_active' => true,
            'permissions' => $data['permissions'] ?? [],
        ]);

        return response()->json([
            'message' => 'کاربر با موفقیت ایجاد شد. رمز پیش‌فرض: 123456789',
            'user' => $user,
        ], 201);
    }

    public function update(Request $request, User $user)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'mobile' => ['required', 'string', 'regex:/^09\d{9}$/', Rule::unique('users', 'mobile')->ignore($user->id)],
            'email' => ['nullable', 'email', Rule::unique('users', 'email')->ignore($user->id)],
            'password' => ['nullable', 'min:6'],
            'role' => ['nullable', Rule::in(['admin', 'user'])],
            'post' => ['nullable', 'string', 'max:255'],
            'unit' => ['nullable', 'string', 'max:255'],
            'is_active' => ['boolean'],
            'permissions' => ['nullable', 'array'],
            'permissions.*' => ['string', Rule::in(array_keys(User::PERMISSIONS))],
        ]);

        $user->update([
            'name' => $data['name'],
            'mobile' => $data['mobile'],
            'email' => $data['email'] ?? $user->email,
            'password' => ! empty($data['password']) ? $data['password'] : $user->password,
            'role' => $data['role'] ?? $user->role,
            'post' => $data['post'] ?? $user->post,
            'unit' => $data['unit'] ?? $user->unit,
            'is_active' => $data['is_active'] ?? $user->is_active,
            'permissions' => $data['permissions'] ?? $user->permissions,
        ]);

        return response()->json(['message' => 'اطلاعات کاربر به‌روزرسانی شد.', 'user' => $user]);
    }

    public function destroy(User $user)
    {
        if ($user->id === request()->user()->id) {
            return response()->json(['message' => 'نمی‌توانید حساب خودتان را حذف کنید.'], 422);
        }

        $user->delete();

        return response()->json(['message' => 'کاربر حذف شد.']);
    }
}

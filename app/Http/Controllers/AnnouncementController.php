<?php

namespace App\Http\Controllers;

use App\Models\Announcement;
use Illuminate\Http\Request;

class AnnouncementController extends Controller
{
    public function index(Request $request)
    {
        $announcements = Announcement::with('user:id,name,post')
            ->withCount('reads')
            ->orderByDesc('pinned')
            ->orderByDesc('published_at')
            ->get()
            ->map(function ($a) use ($request) {
                $a->is_read = $a->reads->contains($request->user()->id);

                return $a;
            });

        return response()->json($announcements);
    }

    public function store(Request $request)
    {
        if (! $request->user()->isAdmin()) {
            abort(403, 'فقط مدیر می‌تواند پیام کلی منتشر کند.');
        }

        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'body' => ['required', 'string'],
            'pinned' => ['boolean'],
        ]);

        $announcement = Announcement::create([
            'title' => $data['title'],
            'body' => $data['body'],
            'pinned' => $data['pinned'] ?? false,
            'user_id' => $request->user()->id,
            'published_at' => now(),
        ]);

        return response()->json(['message' => 'پیام کلی منتشر شد.', 'announcement' => $announcement], 201);
    }

    // علامت‌گذاری به‌عنوان خوانده‌شده
    public function markRead(Request $request, Announcement $announcement)
    {
        $request->user()->readAnnouncements()->syncWithoutDetaching([
            $announcement->id => ['read_at' => now()],
        ]);

        return response()->json(['message' => 'ثبت شد.']);
    }

    public function destroy(Request $request, Announcement $announcement)
    {
        if (! $request->user()->isAdmin()) {
            abort(403, 'فقط مدیر می‌تواند اطلاعیه را حذف کند.');
        }

        $announcement->delete();

        return response()->json(['message' => 'اطلاعیه حذف شد.']);
    }
}

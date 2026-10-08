<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Message;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class MessageController extends Controller
{
    public function index(Request $request): Response
    {
        $status = $request->input('status', 'inbox');

        $query = Message::query()->latest();

        match ($status) {
            'unread' => $query->where('is_read', false)->where('is_archived', false),
            'archived' => $query->where('is_archived', true),
            default => $query->where('is_archived', false),
        };

        if ($search = trim((string) $request->input('search'))) {
            $query->where(fn ($q) => $q
                ->where('name', 'like', "%{$search}%")
                ->orWhere('email', 'like', "%{$search}%")
                ->orWhere('subject', 'like', "%{$search}%")
                ->orWhere('body', 'like', "%{$search}%"));
        }

        return Inertia::render('admin/messages/index', [
            'items' => $query->paginate(20)->withQueryString(),
            'query' => ['status' => $status, 'search' => $search ?: ''],
            'counts' => [
                'inbox' => Message::query()->where('is_archived', false)->count(),
                'unread' => Message::query()->where('is_read', false)->where('is_archived', false)->count(),
                'archived' => Message::query()->where('is_archived', true)->count(),
            ],
        ]);
    }

    public function show(Message $message): Response
    {
        if (! $message->is_read) {
            $message->update(['is_read' => true]);
        }

        return Inertia::render('admin/messages/show', [
            'message' => $message,
        ]);
    }

    public function update(Request $request, Message $message): RedirectResponse
    {
        $data = $request->validate([
            'action' => ['required', Rule::in(['read', 'unread', 'archive', 'unarchive', 'replied'])],
        ]);

        match ($data['action']) {
            'read' => $message->update(['is_read' => true]),
            'unread' => $message->update(['is_read' => false]),
            'archive' => $message->update(['is_archived' => true, 'is_read' => true]),
            'unarchive' => $message->update(['is_archived' => false]),
            'replied' => $message->update(['replied_at' => now(), 'is_read' => true]),
            default => null,
        };

        return back()->with('success', 'Сообщение обновлено.');
    }

    public function destroy(Message $message): RedirectResponse
    {
        $message->delete();

        return redirect('/admin/messages')->with('success', 'Сообщение удалено.');
    }

    public function bulk(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'action' => ['required', Rule::in(['read', 'archive', 'delete'])],
            'ids' => ['required', 'array'],
            'ids.*' => ['integer'],
        ]);

        $query = Message::query()->whereKey($data['ids']);

        match ($data['action']) {
            'read' => $query->update(['is_read' => true]),
            'archive' => $query->update(['is_archived' => true, 'is_read' => true]),
            'delete' => $query->delete(),
            default => null,
        };

        return back()->with('success', 'Готово.');
    }
}

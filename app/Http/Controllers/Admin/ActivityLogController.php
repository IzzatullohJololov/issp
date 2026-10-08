<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ActivityLogController extends Controller
{
    public function index(Request $request): Response
    {
        $query = ActivityLog::query()->with('user:id,name')->latest();

        if ($userId = $request->input('user')) {
            $query->where('user_id', $userId);
        }

        if ($action = $request->input('action')) {
            $query->where('action', $action);
        }

        if ($search = trim((string) $request->input('search'))) {
            $query->where('description', 'like', "%{$search}%");
        }

        return Inertia::render('admin/activity/index', [
            'items' => $query->paginate(40)->withQueryString()->through(fn (ActivityLog $log) => [
                'id' => $log->id,
                'action' => $log->action,
                'description' => $log->description,
                'subject' => $log->subject_type ? class_basename($log->subject_type) : null,
                'subject_id' => $log->subject_id,
                'properties' => $log->properties,
                'user' => $log->user?->name,
                'ip' => $log->ip,
                'created_at' => $log->created_at->toIso8601String(),
            ]),
            'users' => User::query()->orderBy('name')->get(['id', 'name']),
            'actions' => ActivityLog::query()->select('action')->distinct()->orderBy('action')->pluck('action'),
            'query' => $request->only(['user', 'action', 'search']),
        ]);
    }
}

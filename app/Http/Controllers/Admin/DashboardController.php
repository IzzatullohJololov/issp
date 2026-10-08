<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Document;
use App\Models\Event;
use App\Models\Laboratory;
use App\Models\Message;
use App\Models\News;
use App\Models\Person;
use App\Models\Publication;
use App\Models\Vacancy;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(): Response
    {
        $monthStart = now()->startOfMonth();

        return Inertia::render('admin/dashboard', [
            'stats' => [
                ['label' => 'Новости', 'value' => News::query()->count(), 'sub' => 'за месяц +'.News::query()->where('created_at', '>=', $monthStart)->count(), 'href' => '/admin/news', 'icon' => 'newspaper'],
                ['label' => 'События', 'value' => Event::query()->count(), 'sub' => 'предстоящих '.Event::query()->upcoming()->count(), 'href' => '/admin/events', 'icon' => 'calendar'],
                ['label' => 'Сотрудники', 'value' => Person::query()->where('is_active', true)->count(), 'sub' => 'лабораторий '.Laboratory::query()->where('is_active', true)->count(), 'href' => '/admin/people', 'icon' => 'users'],
                ['label' => 'Публикации', 'value' => Publication::query()->count(), 'sub' => 'за '.now()->year.': '.Publication::query()->where('year', now()->year)->count(), 'href' => '/admin/publications', 'icon' => 'book-open'],
                ['label' => 'Документы', 'value' => Document::query()->count(), 'sub' => 'опубликовано '.Document::query()->where('is_published', true)->count(), 'href' => '/admin/documents', 'icon' => 'folder-open'],
                ['label' => 'Вакансии', 'value' => Vacancy::query()->where('is_published', true)->count(), 'sub' => 'всего '.Vacancy::query()->count(), 'href' => '/admin/vacancies', 'icon' => 'briefcase'],
            ],
            'unreadMessages' => Message::query()->where('is_read', false)->where('is_archived', false)
                ->latest()->limit(5)->get(['id', 'name', 'email', 'subject', 'created_at']),
            'drafts' => News::query()->where('is_published', false)->latest()->limit(5)->get()
                ->map(fn (News $news) => ['id' => $news->id, 'title' => $news->tr('title', 'ru'), 'updated_at' => $news->updated_at?->toIso8601String()]),
            'upcomingEvents' => Event::query()->upcoming()->limit(5)->get()
                ->map(fn (Event $event) => ['id' => $event->id, 'title' => $event->tr('title', 'ru'), 'type' => $event->typeLabel('ru'), 'starts_at' => $event->starts_at->toIso8601String()]),
            'activity' => ActivityLog::query()->with('user:id,name')->latest()->limit(12)->get()
                ->map(fn (ActivityLog $log) => [
                    'id' => $log->id,
                    'action' => $log->action,
                    'description' => $log->description,
                    'subject' => $log->subject_type ? class_basename($log->subject_type) : null,
                    'user' => $log->user?->name,
                    'created_at' => $log->created_at->toIso8601String(),
                ]),
            'newsByMonth' => $this->newsByMonth(),
        ]);
    }

    /**
     * @return array<int, array{month: string, count: int}>
     */
    protected function newsByMonth(): array
    {
        $rows = [];

        for ($i = 11; $i >= 0; $i--) {
            $month = now()->subMonths($i);
            $rows[] = [
                'month' => $month->translatedFormat('M'),
                'count' => News::query()
                    ->whereBetween('published_at', [$month->startOfMonth(), $month->endOfMonth()])
                    ->count(),
            ];
        }

        return $rows;
    }
}

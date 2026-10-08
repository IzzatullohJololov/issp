<?php

namespace App\Http\Controllers\Site;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Support\Presenter;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class EventController extends Controller
{
    public function index(Request $request): Response
    {
        $period = $request->input('period', 'upcoming');
        $type = $request->input('type');

        $query = Event::query()->published();

        $period === 'past' ? $query->past() : $query->upcoming();

        if ($type && isset(Event::TYPES[$type])) {
            $query->where('type', $type);
        }

        return Inertia::render('site/events/index', [
            'items' => $query->paginate(12)->withQueryString()->through(fn (Event $event) => Presenter::eventCard($event)),
            'types' => collect(Event::TYPES)->map(fn ($labels, $key) => ['value' => $key, 'label' => $labels[app()->getLocale()] ?? $labels['ru']])->values(),
            'filters' => ['period' => $period, 'type' => $type],
        ]);
    }

    public function show(Event $event): Response
    {
        abort_unless($event->is_published || auth()->check(), 404);

        $event->loadMissing('laboratory');

        return Inertia::render('site/events/show', [
            'item' => Presenter::event($event),
            'upcoming' => Event::query()->published()->upcoming()->whereKeyNot($event->id)->limit(4)->get()
                ->map(fn (Event $item) => Presenter::eventCard($item)),
        ]);
    }
}

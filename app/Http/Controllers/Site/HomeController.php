<?php

namespace App\Http\Controllers\Site;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\Laboratory;
use App\Models\Link;
use App\Models\News;
use App\Models\Person;
use App\Models\Publication;
use App\Models\ResearchArea;
use App\Models\Setting;
use App\Models\Slide;
use App\Support\Presenter;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function __invoke(): Response
    {
        $pinned = News::query()->published()->with('category')->where('is_pinned', true)
            ->orderByDesc('published_at')->limit(1)->get();

        $latest = News::query()->published()->with('category')
            ->whereNotIn('id', $pinned->pluck('id'))
            ->orderByDesc('published_at')->limit(6)->get();

        return Inertia::render('site/home', [
            'slides' => Slide::query()->where('is_active', true)->orderBy('sort_order')->get()
                ->map(fn (Slide $slide) => [
                    'id' => $slide->id,
                    'title' => $slide->tr('title'),
                    'subtitle' => $slide->tr('subtitle'),
                    'image' => $slide->imageUrl(),
                    'link_url' => $slide->link_url,
                    'button_text' => $slide->tr('button_text'),
                ]),
            'pinned' => $pinned->map(fn (News $news) => Presenter::newsCard($news))->first(),
            'news' => $latest->map(fn (News $news) => Presenter::newsCard($news)),
            'events' => Event::query()->published()->upcoming()->limit(4)->get()
                ->map(fn (Event $event) => Presenter::eventCard($event)),
            'researchAreas' => ResearchArea::query()->where('is_active', true)->orderBy('sort_order')->get()
                ->map(fn (ResearchArea $area) => [
                    'id' => $area->id,
                    'title' => $area->tr('title'),
                    'description' => $area->tr('description'),
                    'icon' => $area->icon,
                ]),
            'labs' => Laboratory::query()->where('is_active', true)->with('head')->orderBy('sort_order')->limit(8)->get()
                ->map(fn (Laboratory $lab) => Presenter::labCard($lab)),
            'publications' => Publication::query()->where('is_featured', true)->orderByDesc('year')->limit(4)->get()
                ->map(fn (Publication $publication) => Presenter::publication($publication)),
            'partners' => Link::query()->where('is_active', true)->where('group', 'partners')->orderBy('sort_order')->get()
                ->map(fn (Link $link) => [
                    'id' => $link->id,
                    'title' => $link->tr('title'),
                    'url' => $link->url,
                    'logo' => $link->logo_path ? '/storage/'.$link->logo_path : null,
                ]),
            'intro' => Setting::text('home_intro'),
            'stats' => collect(is_array($stats = Setting::get('stats', [])) ? $stats : [])->map(fn ($row) => [
                'value' => $row['value'] ?? '',
                'label' => is_array($row['label'] ?? null) ? ($row['label'][app()->getLocale()] ?? $row['label']['ru'] ?? '') : ($row['label'] ?? ''),
            ])->values(),
            'counts' => [
                'labs' => Laboratory::query()->where('is_active', true)->count(),
                'people' => Person::query()->where('is_active', true)->count(),
                'publications' => Publication::query()->count(),
            ],
        ]);
    }
}

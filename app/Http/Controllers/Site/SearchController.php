<?php

namespace App\Http\Controllers\Site;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\Laboratory;
use App\Models\News;
use App\Models\Page;
use App\Models\Person;
use App\Models\Publication;
use App\Support\Presenter;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SearchController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $q = trim((string) $request->input('q'));
        $like = "%{$q}%";

        $results = [];

        if (mb_strlen($q) >= 2) {
            $results = [
                'news' => News::query()->published()->with('category')
                    ->where(fn ($w) => $w->where('title->ru', 'like', $like)->orWhere('title->en', 'like', $like)->orWhere('body->ru', 'like', $like)->orWhere('body->en', 'like', $like))
                    ->orderByDesc('published_at')->limit(10)->get()->map(fn (News $n) => Presenter::newsCard($n)),
                'events' => Event::query()->published()
                    ->where(fn ($w) => $w->where('title->ru', 'like', $like)->orWhere('title->en', 'like', $like)->orWhere('speaker', 'like', $like))
                    ->orderByDesc('starts_at')->limit(10)->get()->map(fn (Event $e) => Presenter::eventCard($e)),
                'people' => Person::query()->where('is_active', true)->with('laboratory')
                    ->where(fn ($w) => $w->where('full_name->ru', 'like', $like)->orWhere('full_name->en', 'like', $like))
                    ->limit(10)->get()->map(fn (Person $p) => Presenter::personCard($p)),
                'labs' => Laboratory::query()->where('is_active', true)->with('head')
                    ->where(fn ($w) => $w->where('name->ru', 'like', $like)->orWhere('name->en', 'like', $like)->orWhere('research_areas->ru', 'like', $like))
                    ->limit(10)->get()->map(fn (Laboratory $l) => Presenter::labCard($l)),
                'pages' => Page::query()->published()
                    ->where(fn ($w) => $w->where('title->ru', 'like', $like)->orWhere('title->en', 'like', $like)->orWhere('body->ru', 'like', $like)->orWhere('body->en', 'like', $like))
                    ->limit(10)->get()->map(fn (Page $p) => Presenter::pageLink($p)),
                'publications' => Publication::query()
                    ->where(fn ($w) => $w->where('title', 'like', $like)->orWhere('authors', 'like', $like)->orWhere('doi', 'like', $like))
                    ->orderByDesc('year')->limit(10)->get()->map(fn (Publication $p) => Presenter::publication($p)),
            ];
        }

        return Inertia::render('site/search', [
            'q' => $q,
            'results' => $results,
            'total' => array_sum(array_map(fn ($group) => count($group), $results)),
        ]);
    }
}

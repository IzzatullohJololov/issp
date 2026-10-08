<?php

namespace App\Http\Controllers\Site;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\News;
use App\Support\Presenter;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class NewsController extends Controller
{
    public function index(Request $request): Response
    {
        $query = News::query()->published()->with('category')->orderByDesc('is_pinned')->orderByDesc('published_at');

        if ($category = $request->input('category')) {
            $query->whereHas('category', fn ($q) => $q->where('slug', $category));
        }

        if ($year = (int) $request->input('year')) {
            $query->whereYear('published_at', $year);
        }

        if ($search = trim((string) $request->input('q'))) {
            $query->where(fn ($q) => $q
                ->where('title->ru', 'like', "%{$search}%")
                ->orWhere('title->en', 'like', "%{$search}%")
                ->orWhere('excerpt->ru', 'like', "%{$search}%")
                ->orWhere('excerpt->en', 'like', "%{$search}%"));
        }

        return Inertia::render('site/news/index', [
            'items' => $query->paginate(12)->withQueryString()->through(fn (News $news) => Presenter::newsCard($news)),
            'categories' => Category::query()->orderBy('sort_order')->get()
                ->map(fn (Category $category) => ['slug' => $category->slug, 'name' => $category->tr('name'), 'color' => $category->color]),
            'years' => News::query()->published()->whereNotNull('published_at')->pluck('published_at')
                ->map(fn ($date) => $date->year)->unique()->sortDesc()->values(),
            'filters' => ['category' => $category, 'year' => $year ?: null, 'q' => $search ?: null],
        ]);
    }

    public function show(News $news): Response
    {
        abort_unless($news->is_published && (! $news->published_at || $news->published_at->isPast()) || auth()->check(), 404);

        $news->loadMissing('category');
        $news->increment('views');

        $related = News::query()->published()->with('category')
            ->whereKeyNot($news->id)
            ->when($news->category_id, fn ($q) => $q->where('category_id', $news->category_id))
            ->orderByDesc('published_at')->limit(3)->get();

        return Inertia::render('site/news/show', [
            'item' => Presenter::news($news),
            'related' => $related->map(fn (News $item) => Presenter::newsCard($item)),
        ]);
    }
}

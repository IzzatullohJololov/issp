<?php

namespace App\Http\Controllers\Site;

use App\Http\Controllers\Controller;
use App\Models\Laboratory;
use App\Models\Publication;
use App\Support\Presenter;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PublicationController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Publication::query()->with('laboratory')->orderByDesc('year')->orderBy('authors');

        if ($year = (int) $request->input('year')) {
            $query->where('year', $year);
        }

        if ($type = $request->input('type')) {
            $query->where('type', $type);
        }

        if ($lab = $request->input('lab')) {
            $query->whereHas('laboratory', fn ($q) => $q->where('slug', $lab));
        }

        if ($search = trim((string) $request->input('q'))) {
            $query->where(fn ($q) => $q
                ->where('title', 'like', "%{$search}%")
                ->orWhere('authors', 'like', "%{$search}%")
                ->orWhere('journal', 'like', "%{$search}%")
                ->orWhere('doi', 'like', "%{$search}%"));
        }

        return Inertia::render('site/publications/index', [
            'items' => $query->paginate(20)->withQueryString()->through(fn (Publication $p) => Presenter::publication($p)),
            'years' => Publication::query()->select('year')->distinct()->orderByDesc('year')->pluck('year'),
            'types' => collect(Publication::TYPES)->map(fn ($labels, $key) => ['value' => $key, 'label' => $labels[app()->getLocale()] ?? $labels['ru']])->values(),
            'labs' => Laboratory::query()->where('is_active', true)->orderBy('sort_order')->get()
                ->map(fn (Laboratory $lab) => ['slug' => $lab->slug, 'name' => $lab->tr('name')]),
            'filters' => ['year' => $year ?: null, 'type' => $type, 'lab' => $lab, 'q' => $search ?: null],
            'total' => Publication::query()->count(),
        ]);
    }
}

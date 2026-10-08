<?php

namespace App\Http\Controllers\Site;

use App\Http\Controllers\Controller;
use App\Models\Document;
use App\Support\Presenter;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DocumentController extends Controller
{
    public function index(Request $request): Response
    {
        $category = $request->input('category');

        $documents = Document::query()->published()
            ->when($category, fn ($q) => $q->where('category', $category))
            ->orderBy('category')->orderBy('sort_order')->orderByDesc('published_at')
            ->get();

        $locale = app()->getLocale();

        return Inertia::render('site/documents/index', [
            'groups' => $documents->groupBy('category')->map(fn ($items, $key) => [
                'key' => $key,
                'label' => Document::CATEGORIES[$key][$locale] ?? Document::CATEGORIES[$key]['ru'] ?? $key,
                'items' => $items->map(fn (Document $document) => Presenter::document($document))->values(),
            ])->values(),
            'categories' => collect(Document::CATEGORIES)->map(fn ($labels, $key) => ['value' => $key, 'label' => $labels[$locale] ?? $labels['ru']])->values(),
            'filters' => ['category' => $category],
        ]);
    }
}

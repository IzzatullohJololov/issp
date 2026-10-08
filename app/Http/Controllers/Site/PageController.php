<?php

namespace App\Http\Controllers\Site;

use App\Http\Controllers\Controller;
use App\Models\Page;
use App\Support\Presenter;
use Inertia\Inertia;
use Inertia\Response;

class PageController extends Controller
{
    public function show(Page $page): Response
    {
        abort_unless($page->is_published || auth()->check(), 404);

        $root = $page;
        $breadcrumbs = [];

        while ($root->parent_id && $root->parent) {
            $breadcrumbs[] = Presenter::pageLink($root->parent);
            $root = $root->parent;
        }

        $siblings = Page::query()->published()
            ->where('show_in_sidebar', true)
            ->where('parent_id', $root->id)
            ->orderBy('sort_order')->get();

        return Inertia::render('site/pages/show', [
            'page' => Presenter::page($page),
            'breadcrumbs' => array_reverse($breadcrumbs),
            'sidebar' => [
                'root' => Presenter::pageLink($root),
                'items' => $siblings->map(fn (Page $sibling) => Presenter::pageLink($sibling)),
            ],
            'children' => $page->children()->published()->get()->map(fn (Page $child) => [
                ...Presenter::pageLink($child),
                'excerpt' => $child->tr('excerpt'),
            ]),
        ]);
    }
}

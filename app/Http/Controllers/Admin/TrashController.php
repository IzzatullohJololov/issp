<?php

namespace App\Http\Controllers\Admin;

use App\Admin\Resources;
use App\Http\Controllers\Controller;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class TrashController extends Controller
{
    public function index(): Response
    {
        $groups = [];

        foreach (Resources::softDeletable() as $resource) {
            $items = $resource->trashedQuery()->latest('deleted_at')->limit(100)->get();

            if ($items->isEmpty()) {
                continue;
            }

            $groups[] = [
                'slug' => $resource::$slug,
                'title' => $resource::$title,
                'icon' => $resource::$icon,
                'items' => $items->map(fn (Model $model) => [
                    'id' => $model->getKey(),
                    'title' => $resource->rowTitle($model),
                    'deleted_at' => $model->getAttribute('deleted_at')?->toIso8601String(),
                ]),
            ];
        }

        return Inertia::render('admin/trash/index', ['groups' => $groups]);
    }

    public function empty(): RedirectResponse
    {
        $count = 0;

        foreach (Resources::softDeletable() as $resource) {
            $resource->trashedQuery()->get()->each(function (Model $model) use (&$count) {
                $model->forceDelete();
                $count++;
            });
        }

        return back()->with('success', "Корзина очищена. Удалено записей: {$count}.");
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['location', 'name'])]
class Menu extends Model
{
    /**
     * @return HasMany<MenuItem, $this>
     */
    public function items(): HasMany
    {
        return $this->hasMany(MenuItem::class)->orderBy('sort_order');
    }

    /**
     * @return HasMany<MenuItem, $this>
     */
    public function rootItems(): HasMany
    {
        return $this->items()->whereNull('parent_id');
    }

    /**
     * Build a nested, localized tree for the public site.
     *
     * @return array<int, array<string, mixed>>
     */
    public static function tree(string $location): array
    {
        $menu = static::query()->where('location', $location)->first();

        if (! $menu) {
            return [];
        }

        $items = $menu->items()->where('is_active', true)->get();

        $build = function (?int $parentId) use (&$build, $items): array {
            return $items
                ->where('parent_id', $parentId)
                ->values()
                ->map(fn (MenuItem $item) => [
                    'id' => $item->id,
                    'label' => $item->tr('label'),
                    'url' => $item->url ?? '#',
                    'target' => $item->target,
                    'children' => $build($item->id),
                ])
                ->all();
        };

        return $build(null);
    }
}

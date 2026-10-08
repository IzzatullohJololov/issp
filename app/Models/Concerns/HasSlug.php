<?php

namespace App\Models\Concerns;

use Illuminate\Support\Str;

/**
 * Generates a unique slug from the "slug source" attribute when the slug is empty.
 */
trait HasSlug
{
    public static function bootHasSlug(): void
    {
        static::saving(function ($model) {
            if (blank($model->slug)) {
                $model->slug = $model->generateUniqueSlug($model->slugSource());
            } else {
                $model->slug = $model->generateUniqueSlug($model->slug);
            }
        });
    }

    protected function slugSourceAttribute(): string
    {
        return property_exists($this, 'slugFrom') ? $this->slugFrom : 'title';
    }

    protected function slugSource(): string
    {
        $value = $this->getAttribute($this->slugSourceAttribute());

        if (is_array($value)) {
            $value = $value['en'] ?? $value['ru'] ?? reset($value) ?: '';
        }

        return (string) $value;
    }

    protected function generateUniqueSlug(string $source): string
    {
        $base = Str::slug($source) ?: Str::random(8);
        $slug = $base;
        $counter = 2;

        while (
            static::withoutGlobalScopes()
                ->where('slug', $slug)
                ->when($this->exists, fn ($query) => $query->whereKeyNot($this->getKey()))
                ->exists()
        ) {
            $slug = $base.'-'.$counter++;
        }

        return $slug;
    }

    public function getRouteKeyName(): string
    {
        return 'slug';
    }
}

<?php

namespace App\Models\Concerns;

use Illuminate\Database\Eloquent\Builder;

trait Publishable
{
    /**
     * @param  Builder<static>  $query
     * @return Builder<static>
     */
    public function scopePublished(Builder $query): Builder
    {
        $query->where($query->qualifyColumn('is_published'), true);

        if ($this->hasPublishedAtColumn()) {
            $query->where(function (Builder $query) {
                $query->whereNull($query->qualifyColumn('published_at'))
                    ->orWhere($query->qualifyColumn('published_at'), '<=', now());
            });
        }

        return $query;
    }

    protected function hasPublishedAtColumn(): bool
    {
        return property_exists($this, 'usesPublishedAt') ? $this->usesPublishedAt : false;
    }
}

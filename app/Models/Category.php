<?php

namespace App\Models;

use App\Models\Concerns\HasSlug;
use App\Models\Concerns\HasTranslations;
use App\Models\Concerns\LogsActivity;
use App\Models\Contracts\Translatable;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property array<string, string> $name
 */
#[Fillable(['slug', 'name', 'color', 'sort_order'])]
class Category extends Model implements Translatable
{
    use HasSlug, HasTranslations, LogsActivity;

    /** @var array<int, string> */
    protected array $translatable = ['name'];

    protected string $slugFrom = 'name';

    /**
     * @return HasMany<News, $this>
     */
    public function news(): HasMany
    {
        return $this->hasMany(News::class);
    }
}

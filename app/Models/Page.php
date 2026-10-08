<?php

namespace App\Models;

use App\Models\Concerns\HasSlug;
use App\Models\Concerns\HasTranslations;
use App\Models\Concerns\LogsActivity;
use App\Models\Concerns\Publishable;
use App\Models\Concerns\TracksAuthors;
use App\Models\Contracts\Translatable;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * @property array<string, string> $title
 * @property array<string, string>|null $excerpt
 * @property array<string, string>|null $body
 * @property array<string, string>|null $meta_title
 * @property array<string, string>|null $meta_description
 */
#[Fillable([
    'parent_id', 'slug', 'title', 'excerpt', 'body', 'template', 'cover_path',
    'is_published', 'show_in_sidebar', 'sort_order', 'meta_title', 'meta_description',
])]
class Page extends Model implements Translatable
{
    use HasSlug, HasTranslations, LogsActivity, Publishable, SoftDeletes, TracksAuthors;

    /** @var array<int, string> */
    protected array $translatable = ['title', 'excerpt', 'body', 'meta_title', 'meta_description'];

    public const TEMPLATES = [
        'default' => 'Стандартный (с боковым меню)',
        'wide' => 'Широкий (без бокового меню)',
    ];

    protected function casts(): array
    {
        return [
            'is_published' => 'boolean',
            'show_in_sidebar' => 'boolean',
        ];
    }

    /**
     * @return BelongsTo<Page, $this>
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(Page::class, 'parent_id');
    }

    /**
     * @return HasMany<Page, $this>
     */
    public function children(): HasMany
    {
        return $this->hasMany(Page::class, 'parent_id')->orderBy('sort_order');
    }

    public function url(): string
    {
        return '/pages/'.$this->slug;
    }
}

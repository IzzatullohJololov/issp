<?php

namespace App\Models;

use App\Models\Concerns\HasSlug;
use App\Models\Concerns\HasTranslations;
use App\Models\Concerns\LogsActivity;
use App\Models\Concerns\Publishable;
use App\Models\Concerns\TracksAuthors;
use App\Models\Contracts\Translatable;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * @property array<string, string> $title
 * @property array<string, string>|null $excerpt
 * @property array<string, string>|null $body
 * @property CarbonImmutable|null $published_at
 */
#[Fillable([
    'category_id', 'slug', 'title', 'excerpt', 'body', 'cover_path',
    'is_published', 'is_pinned', 'published_at', 'source_url',
])]
class News extends Model implements Translatable
{
    use HasSlug, HasTranslations, LogsActivity, Publishable, SoftDeletes, TracksAuthors;

    protected $table = 'news';

    /** @var array<int, string> */
    protected array $translatable = ['title', 'excerpt', 'body'];

    protected bool $usesPublishedAt = true;

    protected function casts(): array
    {
        return [
            'is_published' => 'boolean',
            'is_pinned' => 'boolean',
            'published_at' => 'datetime',
        ];
    }

    /**
     * @return BelongsTo<Category, $this>
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function url(): string
    {
        return '/news/'.$this->slug;
    }

    public function coverUrl(): ?string
    {
        return $this->cover_path ? '/storage/'.$this->cover_path : null;
    }
}

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
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * @property array<string, string> $title
 * @property array<string, string>|null $description
 * @property array<string, string>|null $location
 * @property CarbonImmutable $starts_at
 * @property CarbonImmutable|null $ends_at
 */
#[Fillable([
    'laboratory_id', 'slug', 'type', 'title', 'description', 'speaker', 'speaker_affiliation',
    'location', 'starts_at', 'ends_at', 'registration_url', 'cover_path', 'is_published',
])]
class Event extends Model implements Translatable
{
    use HasSlug, HasTranslations, LogsActivity, Publishable, SoftDeletes, TracksAuthors;

    /** @var array<int, string> */
    protected array $translatable = ['title', 'description', 'location'];

    public const TYPES = [
        'seminar' => ['ru' => 'Семинар', 'en' => 'Seminar'],
        'conference' => ['ru' => 'Конференция', 'en' => 'Conference'],
        'school' => ['ru' => 'Школа', 'en' => 'School'],
        'defense' => ['ru' => 'Защита диссертации', 'en' => 'Thesis defense'],
        'lecture' => ['ru' => 'Лекция', 'en' => 'Lecture'],
        'other' => ['ru' => 'Другое', 'en' => 'Other'],
    ];

    protected function casts(): array
    {
        return [
            'is_published' => 'boolean',
            'starts_at' => 'datetime',
            'ends_at' => 'datetime',
        ];
    }

    /**
     * @return BelongsTo<Laboratory, $this>
     */
    public function laboratory(): BelongsTo
    {
        return $this->belongsTo(Laboratory::class);
    }

    /**
     * @param  Builder<static>  $query
     * @return Builder<static>
     */
    public function scopeUpcoming(Builder $query): Builder
    {
        return $query->where('starts_at', '>=', now()->startOfDay())->orderBy('starts_at');
    }

    /**
     * @param  Builder<static>  $query
     * @return Builder<static>
     */
    public function scopePast(Builder $query): Builder
    {
        return $query->where('starts_at', '<', now()->startOfDay())->orderByDesc('starts_at');
    }

    public function typeLabel(?string $locale = null): string
    {
        $locale ??= app()->getLocale();

        return self::TYPES[$this->type][$locale] ?? self::TYPES[$this->type]['ru'] ?? $this->type;
    }

    public function url(): string
    {
        return '/events/'.$this->slug;
    }
}

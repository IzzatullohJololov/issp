<?php

namespace App\Models;

use App\Models\Concerns\HasSlug;
use App\Models\Concerns\HasTranslations;
use App\Models\Concerns\LogsActivity;
use App\Models\Contracts\Translatable;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * @property array<string, string> $name
 * @property array<string, string>|null $description
 * @property array<string, string>|null $research_areas
 */
#[Fillable([
    'department_id', 'slug', 'name', 'short_name', 'head_id', 'description', 'research_areas',
    'phone', 'email', 'room', 'website', 'cover_path', 'sort_order', 'is_active',
])]
class Laboratory extends Model implements Translatable
{
    use HasSlug, HasTranslations, LogsActivity, SoftDeletes;

    /** @var array<int, string> */
    protected array $translatable = ['name', 'description', 'research_areas'];

    protected string $slugFrom = 'name';

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    /**
     * @return BelongsTo<Department, $this>
     */
    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    /**
     * @return BelongsTo<Person, $this>
     */
    public function head(): BelongsTo
    {
        return $this->belongsTo(Person::class, 'head_id');
    }

    /**
     * @return HasMany<Person, $this>
     */
    public function people(): HasMany
    {
        return $this->hasMany(Person::class)->orderBy('sort_order');
    }

    /**
     * @return HasMany<Publication, $this>
     */
    public function publications(): HasMany
    {
        return $this->hasMany(Publication::class)->orderByDesc('year');
    }

    /**
     * @return HasMany<Event, $this>
     */
    public function events(): HasMany
    {
        return $this->hasMany(Event::class);
    }

    public function url(): string
    {
        return '/labs/'.$this->slug;
    }
}

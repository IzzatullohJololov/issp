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
 */
#[Fillable(['slug', 'name', 'head_id', 'description', 'sort_order', 'is_active'])]
class Department extends Model implements Translatable
{
    use HasSlug, HasTranslations, LogsActivity, SoftDeletes;

    /** @var array<int, string> */
    protected array $translatable = ['name', 'description'];

    protected string $slugFrom = 'name';

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    /**
     * @return BelongsTo<Person, $this>
     */
    public function head(): BelongsTo
    {
        return $this->belongsTo(Person::class, 'head_id');
    }

    /**
     * @return HasMany<Laboratory, $this>
     */
    public function laboratories(): HasMany
    {
        return $this->hasMany(Laboratory::class)->orderBy('sort_order');
    }
}

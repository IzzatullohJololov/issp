<?php

namespace App\Models;

use App\Models\Concerns\HasSlug;
use App\Models\Concerns\HasTranslations;
use App\Models\Concerns\LogsActivity;
use App\Models\Concerns\Publishable;
use App\Models\Contracts\Translatable;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * @property array<string, string> $title
 * @property array<string, string>|null $description
 * @property array<string, string>|null $requirements
 * @property CarbonImmutable|null $deadline
 */
#[Fillable([
    'laboratory_id', 'slug', 'title', 'description', 'requirements', 'salary', 'contact_email', 'deadline', 'is_published',
])]
class Vacancy extends Model implements Translatable
{
    use HasSlug, HasTranslations, LogsActivity, Publishable, SoftDeletes;

    /** @var array<int, string> */
    protected array $translatable = ['title', 'description', 'requirements'];

    protected function casts(): array
    {
        return [
            'is_published' => 'boolean',
            'deadline' => 'date',
        ];
    }

    /**
     * @return BelongsTo<Laboratory, $this>
     */
    public function laboratory(): BelongsTo
    {
        return $this->belongsTo(Laboratory::class);
    }

    public function url(): string
    {
        return '/vacancies/'.$this->slug;
    }
}

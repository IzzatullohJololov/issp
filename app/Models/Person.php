<?php

namespace App\Models;

use App\Models\Concerns\HasSlug;
use App\Models\Concerns\HasTranslations;
use App\Models\Concerns\LogsActivity;
use App\Models\Contracts\Translatable;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * @property array<string, string> $full_name
 * @property array<string, string>|null $position
 * @property array<string, string>|null $degree
 * @property array<string, string>|null $bio
 * @property array<string, string>|null $management_role
 */
#[Fillable([
    'laboratory_id', 'slug', 'full_name', 'position', 'degree', 'bio', 'email', 'phone', 'room',
    'photo_path', 'orcid', 'is_management', 'management_role', 'is_council_member', 'sort_order', 'is_active',
])]
class Person extends Model implements Translatable
{
    use HasSlug, HasTranslations, LogsActivity, SoftDeletes;

    protected $table = 'people';

    /** @var array<int, string> */
    protected array $translatable = ['full_name', 'position', 'degree', 'bio', 'management_role'];

    protected string $slugFrom = 'full_name';

    protected function casts(): array
    {
        return [
            'is_management' => 'boolean',
            'is_council_member' => 'boolean',
            'is_active' => 'boolean',
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
        return '/people/'.$this->slug;
    }

    public function photoUrl(): ?string
    {
        return $this->photo_path ? '/storage/'.$this->photo_path : null;
    }
}

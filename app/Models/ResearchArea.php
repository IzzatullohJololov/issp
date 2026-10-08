<?php

namespace App\Models;

use App\Models\Concerns\HasTranslations;
use App\Models\Concerns\LogsActivity;
use App\Models\Contracts\Translatable;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

/**
 * @property array<string, string> $title
 * @property array<string, string>|null $description
 */
#[Fillable(['title', 'description', 'icon', 'sort_order', 'is_active'])]
class ResearchArea extends Model implements Translatable
{
    use HasTranslations, LogsActivity;

    /** @var array<int, string> */
    protected array $translatable = ['title', 'description'];

    public const ICONS = [
        'atom', 'magnet', 'thermometer', 'layers', 'microscope', 'cpu', 'zap', 'gem', 'waves', 'flask', 'sun', 'snowflake',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }
}

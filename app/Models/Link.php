<?php

namespace App\Models;

use App\Models\Concerns\HasTranslations;
use App\Models\Concerns\LogsActivity;
use App\Models\Contracts\Translatable;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

/**
 * @property array<string, string> $title
 */
#[Fillable(['title', 'url', 'logo_path', 'group', 'sort_order', 'is_active'])]
class Link extends Model implements Translatable
{
    use HasTranslations, LogsActivity;

    /** @var array<int, string> */
    protected array $translatable = ['title'];

    public const GROUPS = [
        'partners' => 'Партнёры',
        'useful' => 'Полезные ссылки',
        'journals' => 'Журналы',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }
}

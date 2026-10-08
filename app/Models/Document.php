<?php

namespace App\Models;

use App\Models\Concerns\HasTranslations;
use App\Models\Concerns\LogsActivity;
use App\Models\Concerns\Publishable;
use App\Models\Contracts\Translatable;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * @property array<string, string> $title
 * @property CarbonImmutable|null $published_at
 */
#[Fillable([
    'title', 'category', 'file_path', 'file_name', 'file_size', 'mime_type', 'is_published', 'sort_order', 'published_at',
])]
class Document extends Model implements Translatable
{
    use HasTranslations, LogsActivity, Publishable, SoftDeletes;

    /** @var array<int, string> */
    protected array $translatable = ['title'];

    public const CATEGORIES = [
        'general' => ['ru' => 'Общие документы', 'en' => 'General documents'],
        'charter' => ['ru' => 'Уставные документы', 'en' => 'Charter documents'],
        'council' => ['ru' => 'Учёный совет', 'en' => 'Scientific council'],
        'dissertation' => ['ru' => 'Диссертационный совет', 'en' => 'Dissertation council'],
        'postgraduate' => ['ru' => 'Аспирантура', 'en' => 'Postgraduate studies'],
        'procurement' => ['ru' => 'Закупки', 'en' => 'Procurement'],
        'anticorruption' => ['ru' => 'Противодействие коррупции', 'en' => 'Anti-corruption'],
        'reports' => ['ru' => 'Отчёты', 'en' => 'Reports'],
    ];

    protected function casts(): array
    {
        return [
            'is_published' => 'boolean',
            'published_at' => 'date',
            'file_size' => 'integer',
        ];
    }

    public function fileUrl(): string
    {
        return '/storage/'.$this->file_path;
    }

    public function categoryLabel(?string $locale = null): string
    {
        $locale ??= app()->getLocale();

        return self::CATEGORIES[$this->category][$locale] ?? self::CATEGORIES[$this->category]['ru'] ?? $this->category;
    }

    public function humanSize(): string
    {
        $bytes = $this->file_size;

        if ($bytes >= 1048576) {
            return round($bytes / 1048576, 1).' MB';
        }

        if ($bytes >= 1024) {
            return round($bytes / 1024).' KB';
        }

        return $bytes.' B';
    }
}

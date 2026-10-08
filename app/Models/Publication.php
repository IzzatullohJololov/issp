<?php

namespace App\Models;

use App\Models\Concerns\LogsActivity;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable([
    'laboratory_id', 'type', 'title', 'authors', 'journal', 'year', 'volume', 'pages', 'doi', 'url', 'is_featured',
])]
class Publication extends Model
{
    use LogsActivity, SoftDeletes;

    public const TYPES = [
        'article' => ['ru' => 'Статья', 'en' => 'Article'],
        'review' => ['ru' => 'Обзор', 'en' => 'Review'],
        'book' => ['ru' => 'Монография', 'en' => 'Book'],
        'preprint' => ['ru' => 'Препринт', 'en' => 'Preprint'],
        'proceedings' => ['ru' => 'Труды конференции', 'en' => 'Proceedings'],
        'thesis' => ['ru' => 'Диссертация', 'en' => 'Thesis'],
    ];

    protected function casts(): array
    {
        return [
            'is_featured' => 'boolean',
            'year' => 'integer',
        ];
    }

    /**
     * @return BelongsTo<Laboratory, $this>
     */
    public function laboratory(): BelongsTo
    {
        return $this->belongsTo(Laboratory::class);
    }

    public function doiUrl(): ?string
    {
        return $this->doi ? 'https://doi.org/'.ltrim($this->doi, '/') : null;
    }
}

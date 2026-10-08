<?php

namespace App\Models;

use App\Models\Concerns\HasTranslations;
use App\Models\Concerns\LogsActivity;
use App\Models\Contracts\Translatable;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

/**
 * @property array<string, string> $title
 * @property array<string, string>|null $subtitle
 * @property array<string, string>|null $button_text
 */
#[Fillable(['title', 'subtitle', 'image_path', 'link_url', 'button_text', 'sort_order', 'is_active'])]
class Slide extends Model implements Translatable
{
    use HasTranslations, LogsActivity;

    /** @var array<int, string> */
    protected array $translatable = ['title', 'subtitle', 'button_text'];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function imageUrl(): ?string
    {
        return $this->image_path ? '/storage/'.$this->image_path : null;
    }
}

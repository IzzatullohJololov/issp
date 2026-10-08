<?php

namespace App\Models;

use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

/**
 * @property CarbonImmutable|null $replied_at
 */
#[Fillable(['name', 'email', 'phone', 'subject', 'body', 'ip', 'is_read', 'is_archived', 'replied_at'])]
class Message extends Model
{
    protected function casts(): array
    {
        return [
            'is_read' => 'boolean',
            'is_archived' => 'boolean',
            'replied_at' => 'datetime',
        ];
    }
}

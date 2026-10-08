<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

/**
 * @property array<string, mixed>|null $value
 */
#[Fillable(['key', 'value', 'group'])]
class Setting extends Model
{
    public const CACHE_KEY = 'site.settings';

    protected function casts(): array
    {
        return [
            'value' => 'array',
        ];
    }

    protected static function booted(): void
    {
        static::saved(fn () => Cache::forget(self::CACHE_KEY));
        static::deleted(fn () => Cache::forget(self::CACHE_KEY));
    }

    /**
     * @return array<string, mixed>
     */
    public static function values(): array
    {
        return Cache::rememberForever(self::CACHE_KEY, function () {
            return static::query()
                ->get()
                ->mapWithKeys(fn (self $setting) => [$setting->key => $setting->value['v'] ?? null])
                ->all();
        });
    }

    public static function get(string $key, mixed $default = null): mixed
    {
        return static::values()[$key] ?? $default;
    }

    public static function set(string $key, mixed $value, string $group = 'general'): void
    {
        static::query()->updateOrCreate(['key' => $key], ['value' => ['v' => $value], 'group' => $group]);
    }

    /**
     * Resolve a translatable setting (stored as {ru, en}) in the current locale.
     */
    public static function text(string $key, ?string $locale = null, string $default = ''): string
    {
        $value = static::get($key);

        if (is_array($value)) {
            $locale ??= app()->getLocale();

            return (string) ($value[$locale] ?? $value['ru'] ?? $value['en'] ?? $default);
        }

        return (string) ($value ?? $default);
    }
}

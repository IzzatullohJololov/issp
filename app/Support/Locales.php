<?php

namespace App\Support;

final class Locales
{
    public const DEFAULT = 'ru';

    public const SUPPORTED = ['ru', 'en'];

    public const LABELS = [
        'ru' => 'Русский',
        'en' => 'English',
    ];

    public static function isSupported(?string $locale): bool
    {
        return $locale !== null && in_array($locale, self::SUPPORTED, true);
    }
}

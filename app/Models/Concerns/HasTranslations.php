<?php

namespace App\Models\Concerns;

use App\Models\Contracts\Translatable;
use App\Support\Locales;

/**
 * Stores translatable attributes as JSON objects keyed by locale: {"ru": "...", "en": "..."}.
 * Using models must declare `protected array $translatable = [...]` and
 * implement {@see Translatable}.
 */
trait HasTranslations
{
    public function initializeHasTranslations(): void
    {
        $this->mergeCasts(
            array_fill_keys($this->getTranslatableAttributes(), 'array'),
        );
    }

    /**
     * @return array<int, string>
     */
    public function getTranslatableAttributes(): array
    {
        return $this->translatable;
    }

    public function isTranslatable(string $attribute): bool
    {
        return in_array($attribute, $this->getTranslatableAttributes(), true);
    }

    /**
     * Resolve a translatable attribute for a locale, falling back to the default locale.
     */
    public function tr(string $attribute, ?string $locale = null): ?string
    {
        $value = $this->getAttribute($attribute);

        if (! is_array($value)) {
            return is_string($value) ? $value : null;
        }

        $locale ??= app()->getLocale();

        foreach ([$locale, Locales::DEFAULT, ...Locales::SUPPORTED] as $candidate) {
            if (isset($value[$candidate]) && trim((string) $value[$candidate]) !== '') {
                return (string) $value[$candidate];
            }
        }

        return null;
    }
}

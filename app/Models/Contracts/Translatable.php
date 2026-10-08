<?php

namespace App\Models\Contracts;

interface Translatable
{
    /**
     * @return array<int, string>
     */
    public function getTranslatableAttributes(): array;

    public function isTranslatable(string $attribute): bool;

    public function tr(string $attribute, ?string $locale = null): ?string;
}

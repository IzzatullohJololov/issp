<?php

namespace App\Admin\Resources;

use App\Admin\Field;
use App\Admin\Resource;
use App\Models\Category;

class CategoryResource extends Resource
{
    public static string $model = Category::class;

    public static string $slug = 'categories';

    public static string $title = 'Рубрики новостей';

    public static string $singular = 'Рубрика';

    public static string $icon = 'tags';

    public static string $group = 'Контент';

    public static int $order = 11;

    public static bool $sortableRows = true;

    public function fields(): array
    {
        return [
            Field::text('name', 'Название')->translatable()->required()->onIndex(),
            Field::slug('slug')->onIndex(),
            Field::select('color', 'Цвет', [
                'blue' => 'Синий',
                'amber' => 'Янтарный',
                'emerald' => 'Зелёный',
                'rose' => 'Розовый',
                'violet' => 'Фиолетовый',
                'slate' => 'Серый',
            ])->default('blue')->onIndex(false),
            Field::number('sort_order', 'Порядок')->default(0)->onIndex(),
        ];
    }
}

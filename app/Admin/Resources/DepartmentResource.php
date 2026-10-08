<?php

namespace App\Admin\Resources;

use App\Admin\Field;
use App\Admin\Resource;
use App\Models\Department;
use App\Models\Person;

class DepartmentResource extends Resource
{
    public static string $model = Department::class;

    public static string $slug = 'departments';

    public static string $title = 'Отделы';

    public static string $singular = 'Отдел';

    public static string $icon = 'building';

    public static string $group = 'Структура';

    public static int $order = 20;

    public static bool $sortableRows = true;

    public function fields(): array
    {
        return [
            Field::text('name', 'Название')->translatable()->required()->onIndex(),
            Field::slug('slug'),
            Field::richText('description', 'Описание')->translatable(),
            Field::relation('head_id', 'Руководитель', Person::class, 'full_name', 'head')->onIndex(),
            Field::number('sort_order', 'Порядок')->default(0)->onIndex(),
            Field::boolean('is_active', 'Активен')->default(true)->onIndex()->filterable(),
        ];
    }
}

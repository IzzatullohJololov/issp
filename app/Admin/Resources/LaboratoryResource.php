<?php

namespace App\Admin\Resources;

use App\Admin\Field;
use App\Admin\Resource;
use App\Models\Department;
use App\Models\Laboratory;
use App\Models\Person;

class LaboratoryResource extends Resource
{
    public static string $model = Laboratory::class;

    public static string $slug = 'laboratories';

    public static string $title = 'Лаборатории';

    public static string $singular = 'Лаборатория';

    public static string $icon = 'flask-conical';

    public static string $group = 'Структура';

    public static int $order = 21;

    public static bool $sortableRows = true;

    public static array $sections = [
        'main' => 'Основное',
        'contacts' => 'Контакты',
        'media' => 'Изображение',
    ];

    public function fields(): array
    {
        return [
            Field::text('name', 'Название')->translatable()->required()->onIndex(),
            Field::text('short_name', 'Сокращение')->width('third')->placeholder('ЛСДС')->max(30),
            Field::slug('slug'),
            Field::relation('department_id', 'Отдел', Department::class, 'name', 'department')->onIndex()->filterable(),
            Field::relation('head_id', 'Заведующий', Person::class, 'full_name', 'head')->onIndex(),
            Field::richText('description', 'Описание')->translatable(),
            Field::textarea('research_areas', 'Направления исследований')->translatable()->rows(4)
                ->help('Каждое направление с новой строки.'),
            Field::text('phone', 'Телефон')->section('contacts')->width('third'),
            Field::email('email', 'E-mail')->section('contacts')->width('third'),
            Field::text('room', 'Комната / корпус')->section('contacts')->width('third'),
            Field::url('website', 'Сайт лаборатории')->section('contacts'),
            Field::number('sort_order', 'Порядок')->default(0)->onIndex(),
            Field::boolean('is_active', 'Активна')->default(true)->onIndex()->filterable(),
            Field::image('cover_path', 'Изображение')->section('media')->directory('uploads/labs'),
        ];
    }
}

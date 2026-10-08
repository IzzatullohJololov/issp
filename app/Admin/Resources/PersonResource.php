<?php

namespace App\Admin\Resources;

use App\Admin\Field;
use App\Admin\Resource;
use App\Models\Laboratory;
use App\Models\Person;

class PersonResource extends Resource
{
    public static string $model = Person::class;

    public static string $slug = 'people';

    public static string $title = 'Сотрудники';

    public static string $singular = 'Сотрудник';

    public static string $icon = 'users';

    public static string $group = 'Структура';

    public static int $order = 22;

    public static bool $sortableRows = true;

    public static array $sections = [
        'main' => 'Основное',
        'contacts' => 'Контакты',
        'roles' => 'Роли в институте',
        'media' => 'Фото',
    ];

    public function fields(): array
    {
        return [
            Field::text('full_name', 'ФИО')->translatable()->required()->onIndex(),
            Field::slug('slug'),
            Field::text('position', 'Должность')->translatable()->onIndex()->width('half'),
            Field::text('degree', 'Учёная степень / звание')->translatable()->width('half')
                ->placeholder('д.ф.-м.н., член-корреспондент РАН'),
            Field::relation('laboratory_id', 'Лаборатория', Laboratory::class, 'name', 'laboratory')
                ->onIndex()->filterable(),
            Field::richText('bio', 'Биография')->translatable(),
            Field::email('email', 'E-mail')->section('contacts')->width('third'),
            Field::text('phone', 'Телефон')->section('contacts')->width('third'),
            Field::text('room', 'Комната')->section('contacts')->width('third'),
            Field::text('orcid', 'ORCID')->section('contacts')->width('half')->placeholder('0000-0000-0000-0000'),
            Field::boolean('is_management', 'Член дирекции')->section('roles')->onIndex(false)->filterable(),
            Field::text('management_role', 'Должность в дирекции')->translatable()->section('roles')
                ->placeholder('Директор'),
            Field::boolean('is_council_member', 'Член учёного совета')->section('roles')->filterable(),
            Field::number('sort_order', 'Порядок')->default(0)->section('roles')->onIndex(),
            Field::boolean('is_active', 'Активен')->default(true)->section('roles')->onIndex()->filterable(),
            Field::image('photo_path', 'Фотография')->section('media')->directory('uploads/people'),
        ];
    }
}

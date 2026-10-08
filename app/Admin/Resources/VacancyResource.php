<?php

namespace App\Admin\Resources;

use App\Admin\Field;
use App\Admin\Resource;
use App\Models\Laboratory;
use App\Models\Vacancy;

class VacancyResource extends Resource
{
    public static string $model = Vacancy::class;

    public static string $slug = 'vacancies';

    public static string $title = 'Вакансии';

    public static string $singular = 'Вакансия';

    public static string $icon = 'briefcase';

    public static string $group = 'Наука';

    public static int $order = 32;

    public function fields(): array
    {
        return [
            Field::text('title', 'Должность')->translatable()->required()->onIndex(),
            Field::slug('slug'),
            Field::richText('description', 'Описание')->translatable(),
            Field::textarea('requirements', 'Требования')->translatable()->rows(4)
                ->help('Каждое требование с новой строки.'),
            Field::relation('laboratory_id', 'Лаборатория', Laboratory::class, 'name', 'laboratory')
                ->onIndex()->filterable(),
            Field::text('salary', 'Оплата')->width('third')->max(100),
            Field::email('contact_email', 'Контактный e-mail')->width('third'),
            Field::date('deadline', 'Срок подачи')->onIndex(),
            Field::boolean('is_published', 'Опубликована')->default(true)->onIndex()->filterable(),
        ];
    }
}

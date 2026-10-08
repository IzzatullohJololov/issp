<?php

namespace App\Admin\Resources;

use App\Admin\Field;
use App\Admin\Resource;
use App\Models\Slide;

class SlideResource extends Resource
{
    public static string $model = Slide::class;

    public static string $slug = 'slides';

    public static string $title = 'Баннеры главной';

    public static string $singular = 'Баннер';

    public static string $icon = 'image';

    public static string $group = 'Контент';

    public static int $order = 14;

    public static bool $sortableRows = true;

    public function fields(): array
    {
        return [
            Field::text('title', 'Заголовок')->translatable()->required()->onIndex(),
            Field::textarea('subtitle', 'Подзаголовок')->translatable()->rows(2),
            Field::image('image_path', 'Изображение')->onIndex(false)->directory('uploads/slides')
                ->help('Рекомендуемый размер 1920×900 px.'),
            Field::url('link_url', 'Ссылка')->width('half'),
            Field::text('button_text', 'Текст кнопки')->translatable()->width('half'),
            Field::number('sort_order', 'Порядок')->default(0)->onIndex(),
            Field::boolean('is_active', 'Активен')->default(true)->onIndex()->filterable(),
        ];
    }
}

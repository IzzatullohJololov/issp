<?php

namespace App\Admin\Resources;

use App\Admin\Field;
use App\Admin\Resource;
use App\Models\ResearchArea;

class ResearchAreaResource extends Resource
{
    public static string $model = ResearchArea::class;

    public static string $slug = 'research-areas';

    public static string $title = 'Научные направления';

    public static string $singular = 'Направление';

    public static string $icon = 'atom';

    public static string $group = 'Контент';

    public static int $order = 15;

    public static bool $sortableRows = true;

    public function fields(): array
    {
        return [
            Field::text('title', 'Название')->translatable()->required()->onIndex(),
            Field::textarea('description', 'Описание')->translatable()->rows(3),
            Field::select('icon', 'Иконка', array_combine(ResearchArea::ICONS, ResearchArea::ICONS))
                ->default('atom')->onIndex(false),
            Field::number('sort_order', 'Порядок')->default(0)->onIndex(),
            Field::boolean('is_active', 'Активно')->default(true)->onIndex()->filterable(),
        ];
    }
}

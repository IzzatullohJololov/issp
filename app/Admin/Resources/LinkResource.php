<?php

namespace App\Admin\Resources;

use App\Admin\Field;
use App\Admin\Resource;
use App\Models\Link;

class LinkResource extends Resource
{
    public static string $model = Link::class;

    public static string $slug = 'links';

    public static string $title = 'Ссылки и партнёры';

    public static string $singular = 'Ссылка';

    public static string $icon = 'link';

    public static string $group = 'Наука';

    public static int $order = 33;

    public static bool $sortableRows = true;

    public function fields(): array
    {
        return [
            Field::text('title', 'Название')->translatable()->required()->onIndex(),
            Field::url('url', 'Адрес')->required()->onIndex(),
            Field::select('group', 'Группа', Link::GROUPS)->default('partners')->onIndex()->filterable(),
            Field::image('logo_path', 'Логотип')->directory('uploads/links')->onIndex(false),
            Field::number('sort_order', 'Порядок')->default(0)->onIndex(),
            Field::boolean('is_active', 'Активна')->default(true)->onIndex()->filterable(),
        ];
    }
}

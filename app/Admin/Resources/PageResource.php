<?php

namespace App\Admin\Resources;

use App\Admin\Field;
use App\Admin\Resource;
use App\Models\Page;

class PageResource extends Resource
{
    public static string $model = Page::class;

    public static string $slug = 'pages';

    public static string $title = 'Страницы';

    public static string $singular = 'Страница';

    public static string $icon = 'file-text';

    public static string $group = 'Контент';

    public static int $order = 13;

    public static bool $sortableRows = true;

    public static array $sections = [
        'main' => 'Содержание',
        'settings' => 'Настройки',
        'seo' => 'SEO',
    ];

    public function fields(): array
    {
        return [
            Field::text('title', 'Заголовок')->translatable()->required()->onIndex(),
            Field::slug('slug')->onIndex(),
            Field::textarea('excerpt', 'Подзаголовок')->translatable()->rows(2),
            Field::richText('body', 'Содержимое')->translatable(),
            Field::relation('parent_id', 'Родительская страница', Page::class, 'title', 'parent')
                ->onIndex()->filterable()->section('settings'),
            Field::select('template', 'Шаблон', Page::TEMPLATES)->default('default')->section('settings'),
            Field::number('sort_order', 'Порядок')->default(0)->section('settings')->onIndex(),
            Field::boolean('is_published', 'Опубликовано')->default(true)->onIndex()->filterable()->section('settings'),
            Field::boolean('show_in_sidebar', 'Показывать в боковом меню')->default(true)->section('settings'),
            Field::image('cover_path', 'Обложка')->section('settings')->directory('uploads/pages'),
            Field::text('meta_title', 'Meta title')->translatable()->section('seo'),
            Field::textarea('meta_description', 'Meta description')->translatable()->rows(2)->section('seo'),
        ];
    }
}

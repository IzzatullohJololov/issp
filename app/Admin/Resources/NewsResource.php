<?php

namespace App\Admin\Resources;

use App\Admin\Field;
use App\Admin\Resource;
use App\Models\Category;
use App\Models\News;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;

class NewsResource extends Resource
{
    public static string $model = News::class;

    public static string $slug = 'news';

    public static string $title = 'Новости';

    public static string $singular = 'Новость';

    public static string $icon = 'newspaper';

    public static string $group = 'Контент';

    public static int $order = 10;

    public static array $sections = [
        'main' => 'Содержание',
        'publish' => 'Публикация',
        'media' => 'Изображение',
    ];

    public function fields(): array
    {
        return [
            Field::text('title', 'Заголовок')->translatable()->required()->onIndex(),
            Field::slug('slug'),
            Field::textarea('excerpt', 'Краткое описание')->translatable()->rows(3)
                ->help('Показывается в списке новостей и на главной странице.'),
            Field::richText('body', 'Текст новости')->translatable(),
            Field::relation('category_id', 'Рубрика', Category::class, 'name', 'category')
                ->onIndex()->filterable()->section('publish'),
            Field::datetime('published_at', 'Дата публикации')->onIndex()->section('publish')
                ->help('Оставьте пустым, чтобы использовать текущее время.'),
            Field::boolean('is_published', 'Опубликовано')->onIndex()->filterable()->section('publish'),
            Field::boolean('is_pinned', 'Закрепить на главной')->onIndex(false)->section('publish'),
            Field::url('source_url', 'Ссылка на источник')->section('publish'),
            Field::image('cover_path', 'Обложка')->section('media')->directory('uploads/news'),
            Field::number('views', 'Просмотры')->hideFromForm()->onIndex(),
        ];
    }

    public function defaultSort(): array
    {
        return ['published_at', 'desc'];
    }

    protected function beforeSave(Model $model, array $validated, Request $request): Model
    {
        if ($model->getAttribute('is_published') && ! $model->getAttribute('published_at')) {
            $model->setAttribute('published_at', now());
        }

        return $model;
    }
}

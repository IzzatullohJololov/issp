<?php

namespace App\Admin\Resources;

use App\Admin\Field;
use App\Admin\Resource;
use App\Models\Laboratory;
use App\Models\Publication;

class PublicationResource extends Resource
{
    public static string $model = Publication::class;

    public static string $slug = 'publications';

    public static string $title = 'Публикации';

    public static string $singular = 'Публикация';

    public static string $icon = 'book-open';

    public static string $group = 'Наука';

    public static int $order = 30;

    public function fields(): array
    {
        return [
            Field::textarea('title', 'Название')->required()->rows(2)->onIndex(),
            Field::textarea('authors', 'Авторы')->required()->rows(2)->onIndex()
                ->help('Через запятую, как в статье: Иванов И.И., Petrov P.P.'),
            Field::select('type', 'Тип', array_map(fn ($labels) => $labels['ru'], Publication::TYPES))
                ->default('article')->required()->filterable(),
            Field::text('journal', 'Журнал / издательство')->width('half')->onIndex(),
            Field::number('year', 'Год')->required()->default((int) date('Y'))->onIndex()->filterable()
                ->rules(['between:1900,2100']),
            Field::text('volume', 'Том / номер')->width('third')->max(50),
            Field::text('pages', 'Страницы')->width('third')->max(50),
            Field::text('doi', 'DOI')->width('half')->placeholder('10.1103/PhysRevB.100.000000'),
            Field::url('url', 'Ссылка')->width('half'),
            Field::relation('laboratory_id', 'Лаборатория', Laboratory::class, 'name', 'laboratory')->filterable(),
            Field::boolean('is_featured', 'Избранная')->onIndex()->filterable(),
        ];
    }

    public function searchable(): array
    {
        return ['title', 'authors', 'journal', 'doi'];
    }

    public function defaultSort(): array
    {
        return ['year', 'desc'];
    }
}

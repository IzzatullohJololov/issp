<?php

namespace App\Admin\Resources;

use App\Admin\Field;
use App\Admin\Resource;
use App\Models\Event;
use App\Models\Laboratory;

class EventResource extends Resource
{
    public static string $model = Event::class;

    public static string $slug = 'events';

    public static string $title = 'Семинары и события';

    public static string $singular = 'Событие';

    public static string $icon = 'calendar';

    public static string $group = 'Контент';

    public static int $order = 12;

    public static array $sections = [
        'main' => 'Содержание',
        'details' => 'Детали',
        'media' => 'Изображение',
    ];

    public function fields(): array
    {
        return [
            Field::text('title', 'Название')->translatable()->required()->onIndex(),
            Field::slug('slug'),
            Field::select('type', 'Тип', array_map(fn ($labels) => $labels['ru'], Event::TYPES))
                ->default('seminar')->required()->onIndex()->filterable(),
            Field::richText('description', 'Описание / аннотация')->translatable(),
            Field::datetime('starts_at', 'Начало')->required()->onIndex()->section('details'),
            Field::datetime('ends_at', 'Окончание')->section('details'),
            Field::text('location', 'Место проведения')->translatable()->section('details')
                ->placeholder('Конференц-зал ИФТТ РАН'),
            Field::text('speaker', 'Докладчик')->section('details')->width('half')->onIndex(false),
            Field::text('speaker_affiliation', 'Организация докладчика')->section('details')->width('half'),
            Field::relation('laboratory_id', 'Лаборатория', Laboratory::class, 'name', 'laboratory')
                ->section('details')->filterable(),
            Field::url('registration_url', 'Ссылка на регистрацию / трансляцию')->section('details'),
            Field::boolean('is_published', 'Опубликовано')->default(true)->onIndex()->filterable()->section('details'),
            Field::image('cover_path', 'Изображение')->section('media')->directory('uploads/events'),
        ];
    }

    public function defaultSort(): array
    {
        return ['starts_at', 'desc'];
    }
}

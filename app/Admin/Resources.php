<?php

namespace App\Admin;

use App\Admin\Resources\CategoryResource;
use App\Admin\Resources\DepartmentResource;
use App\Admin\Resources\DocumentResource;
use App\Admin\Resources\EventResource;
use App\Admin\Resources\LaboratoryResource;
use App\Admin\Resources\LinkResource;
use App\Admin\Resources\NewsResource;
use App\Admin\Resources\PageResource;
use App\Admin\Resources\PersonResource;
use App\Admin\Resources\PublicationResource;
use App\Admin\Resources\ResearchAreaResource;
use App\Admin\Resources\SlideResource;
use App\Admin\Resources\VacancyResource;
use InvalidArgumentException;

final class Resources
{
    /** @var array<int, class-string<\App\Admin\Resource>> */
    public const CLASSES = [
        NewsResource::class,
        CategoryResource::class,
        EventResource::class,
        PageResource::class,
        SlideResource::class,
        ResearchAreaResource::class,
        DepartmentResource::class,
        LaboratoryResource::class,
        PersonResource::class,
        PublicationResource::class,
        DocumentResource::class,
        VacancyResource::class,
        LinkResource::class,
    ];

    /**
     * @return array<string, class-string<\App\Admin\Resource>>
     */
    public static function map(): array
    {
        $map = [];

        foreach (self::CLASSES as $class) {
            $map[$class::$slug] = $class;
        }

        return $map;
    }

    /**
     * @return array<int, string>
     */
    public static function slugs(): array
    {
        return array_keys(self::map());
    }

    public static function resolve(string $slug): Resource
    {
        $class = self::map()[$slug] ?? null;

        if ($class === null) {
            throw new InvalidArgumentException("Unknown admin resource [{$slug}].");
        }

        return new $class;
    }

    /**
     * Resources whose model uses soft deletes (used by the global trash page).
     *
     * @return array<int, \App\Admin\Resource>
     */
    public static function softDeletable(): array
    {
        $resources = array_map(fn (string $class): Resource => new $class, self::CLASSES);

        return array_values(array_filter($resources, fn (Resource $resource) => $resource->usesSoftDeletes()));
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public static function navigation(): array
    {
        $items = array_map(fn (string $class): array => $class::navItem(), self::CLASSES);

        usort($items, fn (array $a, array $b) => $a['order'] <=> $b['order']);

        return $items;
    }
}

<?php

namespace App\Support;

use App\Models\Document;
use App\Models\Event;
use App\Models\Laboratory;
use App\Models\News;
use App\Models\Page;
use App\Models\Person;
use App\Models\Publication;
use App\Models\Vacancy;

/**
 * Shapes models for the public (localized) Inertia pages.
 */
final class Presenter
{
    /**
     * @return array<string, mixed>
     */
    public static function newsCard(News $news): array
    {
        return [
            'id' => $news->id,
            'slug' => $news->slug,
            'url' => $news->url(),
            'title' => $news->tr('title'),
            'excerpt' => $news->tr('excerpt'),
            'cover' => $news->coverUrl(),
            'is_pinned' => $news->is_pinned,
            'published_at' => $news->published_at?->toIso8601String(),
            'category' => $news->category ? [
                'slug' => $news->category->slug,
                'name' => $news->category->tr('name'),
                'color' => $news->category->color,
            ] : null,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public static function news(News $news): array
    {
        return [
            ...self::newsCard($news),
            'body' => $news->tr('body'),
            'views' => $news->views,
            'source_url' => $news->source_url,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public static function eventCard(Event $event): array
    {
        return [
            'id' => $event->id,
            'slug' => $event->slug,
            'url' => $event->url(),
            'type' => $event->type,
            'type_label' => $event->typeLabel(),
            'title' => $event->tr('title'),
            'speaker' => $event->speaker,
            'speaker_affiliation' => $event->speaker_affiliation,
            'location' => $event->tr('location'),
            'starts_at' => $event->starts_at->toIso8601String(),
            'ends_at' => $event->ends_at?->toIso8601String(),
            'cover' => $event->cover_path ? '/storage/'.$event->cover_path : null,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public static function event(Event $event): array
    {
        return [
            ...self::eventCard($event),
            'description' => $event->tr('description'),
            'registration_url' => $event->registration_url,
            'laboratory' => $event->laboratory ? self::labCard($event->laboratory) : null,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public static function labCard(Laboratory $lab): array
    {
        return [
            'id' => $lab->id,
            'slug' => $lab->slug,
            'url' => $lab->url(),
            'name' => $lab->tr('name'),
            'short_name' => $lab->short_name,
            'head' => $lab->head ? self::personCard($lab->head) : null,
            'cover' => $lab->cover_path ? '/storage/'.$lab->cover_path : null,
            'department' => $lab->relationLoaded('department') && $lab->department ? [
                'slug' => $lab->department->slug,
                'name' => $lab->department->tr('name'),
            ] : null,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public static function lab(Laboratory $lab): array
    {
        return [
            ...self::labCard($lab),
            'description' => $lab->tr('description'),
            'research_areas' => array_values(array_filter(array_map('trim', explode("\n", (string) $lab->tr('research_areas'))))),
            'phone' => $lab->phone,
            'email' => $lab->email,
            'room' => $lab->room,
            'website' => $lab->website,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public static function personCard(Person $person): array
    {
        return [
            'id' => $person->id,
            'slug' => $person->slug,
            'url' => $person->url(),
            'full_name' => $person->tr('full_name'),
            'position' => $person->tr('position'),
            'degree' => $person->tr('degree'),
            'management_role' => $person->tr('management_role'),
            'photo' => $person->photoUrl(),
            'email' => $person->email,
            'phone' => $person->phone,
            'laboratory' => $person->relationLoaded('laboratory') && $person->laboratory ? [
                'slug' => $person->laboratory->slug,
                'url' => $person->laboratory->url(),
                'name' => $person->laboratory->tr('name'),
            ] : null,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public static function person(Person $person): array
    {
        return [
            ...self::personCard($person),
            'bio' => $person->tr('bio'),
            'room' => $person->room,
            'orcid' => $person->orcid,
            'is_management' => $person->is_management,
            'is_council_member' => $person->is_council_member,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public static function publication(Publication $publication): array
    {
        return [
            'id' => $publication->id,
            'type' => $publication->type,
            'type_label' => Publication::TYPES[$publication->type][app()->getLocale()] ?? $publication->type,
            'title' => $publication->title,
            'authors' => $publication->authors,
            'journal' => $publication->journal,
            'year' => $publication->year,
            'volume' => $publication->volume,
            'pages' => $publication->pages,
            'doi' => $publication->doi,
            'doi_url' => $publication->doiUrl(),
            'url' => $publication->url,
            'is_featured' => $publication->is_featured,
            'laboratory' => $publication->relationLoaded('laboratory') && $publication->laboratory ? [
                'slug' => $publication->laboratory->slug,
                'name' => $publication->laboratory->tr('name'),
            ] : null,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public static function document(Document $document): array
    {
        return [
            'id' => $document->id,
            'title' => $document->tr('title'),
            'category' => $document->category,
            'category_label' => $document->categoryLabel(),
            'url' => $document->fileUrl(),
            'file_name' => $document->file_name,
            'size' => $document->humanSize(),
            'mime_type' => $document->mime_type,
            'published_at' => $document->published_at?->toDateString(),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public static function vacancy(Vacancy $vacancy): array
    {
        return [
            'id' => $vacancy->id,
            'slug' => $vacancy->slug,
            'url' => $vacancy->url(),
            'title' => $vacancy->tr('title'),
            'description' => $vacancy->tr('description'),
            'requirements' => array_values(array_filter(array_map('trim', explode("\n", (string) $vacancy->tr('requirements'))))),
            'salary' => $vacancy->salary,
            'contact_email' => $vacancy->contact_email,
            'deadline' => $vacancy->deadline?->toDateString(),
            'laboratory' => $vacancy->relationLoaded('laboratory') && $vacancy->laboratory ? [
                'slug' => $vacancy->laboratory->slug,
                'url' => $vacancy->laboratory->url(),
                'name' => $vacancy->laboratory->tr('name'),
            ] : null,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public static function pageLink(Page $page): array
    {
        return [
            'id' => $page->id,
            'slug' => $page->slug,
            'url' => $page->url(),
            'title' => $page->tr('title'),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public static function page(Page $page): array
    {
        return [
            ...self::pageLink($page),
            'excerpt' => $page->tr('excerpt'),
            'body' => $page->tr('body'),
            'template' => $page->template,
            'cover' => $page->cover_path ? '/storage/'.$page->cover_path : null,
            'meta_title' => $page->tr('meta_title'),
            'meta_description' => $page->tr('meta_description'),
            'updated_at' => $page->updated_at?->toIso8601String(),
        ];
    }
}

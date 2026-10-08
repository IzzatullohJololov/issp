<?php

namespace App\Admin;

use App\Models\Contracts\Translatable;
use App\Support\Locales;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\SoftDeletingScope;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use RuntimeException;

/**
 * Base class for declarative admin CRUD resources. Each concrete resource
 * describes a model with a set of fields; the generic ResourceController
 * and React pages do the rest.
 */
abstract class Resource
{
    /** @var class-string<Model> */
    public static string $model;

    public static string $slug;

    public static string $title;

    public static string $singular;

    public static string $icon = 'file';

    public static string $group = 'Контент';

    public static int $order = 100;

    public static bool $sortableRows = false;

    /** @var array<string, string> */
    public static array $sections = ['main' => 'Основное'];

    /**
     * @return array<int, Field>
     */
    abstract public function fields(): array;

    /**
     * Columns used by the quick search box.
     *
     * @return array<int, string>
     */
    public function searchable(): array
    {
        return collect($this->fields())
            ->filter(fn (Field $field) => in_array($field->type, ['text', 'slug', 'textarea', 'email'], true))
            ->pluck('name')
            ->all();
    }

    /**
     * @return array{0: string, 1: 'asc'|'desc'}
     */
    public function defaultSort(): array
    {
        return static::$sortableRows ? ['sort_order', 'asc'] : ['created_at', 'desc'];
    }

    /**
     * @return array<int, string>
     */
    public function with(): array
    {
        return collect($this->fields())
            ->filter(fn (Field $field) => $field->type === 'relation' && $field->relationName)
            ->pluck('relationName')
            ->all();
    }

    public function newModel(): Model
    {
        return new static::$model;
    }

    public function usesSoftDeletes(): bool
    {
        return in_array(SoftDeletes::class, class_uses_recursive(static::$model), true);
    }

    /**
     * @return Builder<Model>
     */
    public function query(): Builder
    {
        return $this->newModel()->newQuery()->with($this->with());
    }

    /**
     * Include or restrict to soft-deleted rows without relying on the
     * SoftDeletes macros (the base query is typed against the generic Model).
     *
     * @param  Builder<Model>  $query
     * @return Builder<Model>
     */
    public function withTrashedRows(Builder $query, bool $onlyTrashed = false): Builder
    {
        if (! $this->usesSoftDeletes()) {
            return $query;
        }

        $query->withoutGlobalScope(SoftDeletingScope::class);

        if ($onlyTrashed) {
            $query->whereNotNull($query->qualifyColumn('deleted_at'));
        }

        return $query;
    }

    /**
     * @return Builder<Model>
     */
    public function trashedQuery(): Builder
    {
        return $this->withTrashedRows($this->newModel()->newQuery(), onlyTrashed: true);
    }

    public function field(string $name): ?Field
    {
        return collect($this->fields())->first(fn (Field $field) => $field->name === $name);
    }

    /**
     * @return array<int, Field>
     */
    public function indexFields(): array
    {
        return array_values(array_filter($this->fields(), fn (Field $field) => $field->onIndex));
    }

    /**
     * @return array<int, Field>
     */
    public function formFields(): array
    {
        return array_values(array_filter($this->fields(), fn (Field $field) => $field->onForm));
    }

    /**
     * Apply search, filters and sorting from the request.
     *
     * @param  Builder<Model>  $query
     * @return Builder<Model>
     */
    public function applyIndexQuery(Builder $query, Request $request): Builder
    {
        if ($request->boolean('trashed')) {
            $this->withTrashedRows($query, onlyTrashed: true);
        }

        if ($search = trim((string) $request->input('search'))) {
            $query->where(function (Builder $query) use ($search) {
                foreach ($this->searchable() as $column) {
                    $field = $this->field($column);
                    if ($field?->translatable) {
                        foreach (Locales::SUPPORTED as $locale) {
                            $query->orWhere("{$column}->{$locale}", 'like', "%{$search}%");
                        }
                    } else {
                        $query->orWhere($column, 'like', "%{$search}%");
                    }
                }
            });
        }

        foreach ($this->fields() as $field) {
            if (! $field->filterable) {
                continue;
            }

            $value = $request->input("filter.{$field->name}");

            if ($value === null || $value === '') {
                continue;
            }

            if ($field->type === 'boolean') {
                $query->where($field->name, filter_var($value, FILTER_VALIDATE_BOOLEAN));
            } else {
                $query->where($field->name, $value);
            }
        }

        [$sortColumn, $sortDirection] = $this->defaultSort();
        $requestedSort = (string) $request->input('sort', '');

        if ($requestedSort !== '') {
            $direction = str_starts_with($requestedSort, '-') ? 'desc' : 'asc';
            $column = ltrim($requestedSort, '-');
            $field = $this->field($column);

            if ($field?->sortable || in_array($column, ['id', 'created_at', 'updated_at', 'sort_order'], true)) {
                $sortColumn = $field?->translatable ? "{$column}->".Locales::DEFAULT : $column;
                $sortDirection = $direction;
            }
        }

        return $query->orderBy($sortColumn, $sortDirection)->orderBy('id', 'desc');
    }

    /**
     * Transform a model into an index row.
     *
     * @return array<string, mixed>
     */
    public function toIndexRow(Model $model): array
    {
        $row = [
            'id' => $model->getKey(),
            'created_at' => $model->getAttribute('created_at')?->toIso8601String(),
            'updated_at' => $model->getAttribute('updated_at')?->toIso8601String(),
            'deleted_at' => $model->getAttribute('deleted_at')?->toIso8601String(),
        ];

        foreach ($this->indexFields() as $field) {
            $row[$field->name] = $this->indexValue($model, $field);
        }

        $row['_title'] = $this->rowTitle($model);
        $row['_url'] = $this->publicUrl($model);

        return $row;
    }

    protected function indexValue(Model $model, Field $field): mixed
    {
        if ($field->indexUsing) {
            return ($field->indexUsing)($model);
        }

        $value = $model->getAttribute($field->name);

        return match ($field->type) {
            'relation' => $this->relationLabel($model, $field),
            'image', 'file' => $value ? Storage::disk('public')->url($value) : null,
            'select' => collect($field->options)->firstWhere('value', $value)['label'] ?? $value,
            'date' => $value ? $value->format('d.m.Y') : null,
            'datetime' => $value ? $value->format('d.m.Y H:i') : null,
            'richtext' => $value ? Str::limit(strip_tags(is_array($value) ? ($value[Locales::DEFAULT] ?? '') : $value), 80) : null,
            default => $field->translatable && method_exists($model, 'tr') ? $model->tr($field->name, Locales::DEFAULT) : $value,
        };
    }

    protected function relationLabel(Model $model, Field $field): ?string
    {
        $related = $field->relationName ? $model->getRelationValue($field->relationName) : null;

        if (! $related instanceof Model) {
            return null;
        }

        if ($related instanceof Translatable && $field->relationLabel !== null && $related->isTranslatable($field->relationLabel)) {
            return $related->tr($field->relationLabel, Locales::DEFAULT);
        }

        return (string) $related->getAttribute((string) $field->relationLabel);
    }

    public function rowTitle(Model $model): string
    {
        if (method_exists($model, 'activityLabel')) {
            return $model->activityLabel();
        }

        return static::$singular.' #'.$model->getKey();
    }

    public function publicUrl(Model $model): ?string
    {
        return method_exists($model, 'url') ? $model->url() : null;
    }

    /**
     * Transform a model into the shape the admin form expects.
     *
     * @return array<string, mixed>
     */
    public function toFormData(?Model $model): array
    {
        $data = ['id' => $model?->getKey()];

        foreach ($this->formFields() as $field) {
            $value = $model?->getAttribute($field->name);

            if ($model === null) {
                $data[$field->name] = $field->translatable
                    ? array_fill_keys(Locales::SUPPORTED, '')
                    : $field->default;

                continue;
            }

            $data[$field->name] = match (true) {
                $field->translatable => array_merge(array_fill_keys(Locales::SUPPORTED, ''), is_array($value) ? $value : []),
                $field->isUpload() => $value ? ['path' => $value, 'url' => Storage::disk('public')->url($value)] : null,
                $field->type === 'date' => $value?->format('Y-m-d'),
                $field->type === 'datetime' => $value?->format('Y-m-d\TH:i'),
                $field->type === 'tags' => is_array($value) ? $value : [],
                default => $value,
            };
        }

        return $data;
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(?Model $model): array
    {
        $rules = [];

        foreach ($this->formFields() as $field) {
            $rules = [...$rules, ...$field->validationRules($model)];
        }

        return $rules;
    }

    /**
     * @return array<string, string>
     */
    public function attributeNames(): array
    {
        $names = [];

        foreach ($this->formFields() as $field) {
            $names[$field->name] = $field->label;
            foreach (Locales::SUPPORTED as $locale) {
                $names["{$field->name}.{$locale}"] = $field->label.' ('.strtoupper($locale).')';
            }
        }

        return $names;
    }

    /**
     * Fill the model from validated input, handling uploads and translations.
     *
     * @param  array<string, mixed>  $validated
     */
    public function fill(Model $model, array $validated, Request $request): Model
    {
        foreach ($this->formFields() as $field) {
            $name = $field->name;

            if ($field->isUpload()) {
                $file = $request->file($name);

                if ($file instanceof UploadedFile) {
                    $this->deleteStoredFile($model->getAttribute($name));
                    $model->setAttribute($name, $this->storeUpload($file, $field));
                    $this->afterUpload($model, $field, $file);
                } elseif ($request->boolean("{$name}_remove")) {
                    $this->deleteStoredFile($model->getAttribute($name));
                    $model->setAttribute($name, null);
                }

                continue;
            }

            if (! array_key_exists($name, $validated)) {
                if ($field->type === 'boolean') {
                    $model->setAttribute($name, false);
                }

                continue;
            }

            $value = $validated[$name];

            if ($field->translatable) {
                $value = collect(is_array($value) ? $value : [])
                    ->only(Locales::SUPPORTED)
                    ->map(fn ($text) => is_string($text) ? trim($text) : '')
                    ->all();
            } elseif ($field->type === 'boolean') {
                $value = (bool) $value;
            } elseif ($field->type === 'tags') {
                $value = array_values(array_filter(array_map('trim', $value ?? [])));
            } elseif ($value === '') {
                $value = null;
            }

            $model->setAttribute($name, $value);
        }

        return $this->beforeSave($model, $validated, $request);
    }

    /**
     * @param  array<string, mixed>  $validated
     */
    protected function beforeSave(Model $model, array $validated, Request $request): Model
    {
        return $model;
    }

    public function afterSave(Model $model, Request $request): void {}

    protected function afterUpload(Model $model, Field $field, UploadedFile $file): void {}

    protected function storeUpload(UploadedFile $file, Field $field): string
    {
        $directory = $field->directory ?? 'uploads/'.static::$slug;
        $extension = strtolower($file->getClientOriginalExtension() ?: $file->extension());
        $name = Str::slug(pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME)) ?: Str::random(8);

        $path = $file->storeAs($directory, $name.'-'.Str::lower(Str::random(6)).'.'.$extension, 'public');

        if ($path === false) {
            throw new RuntimeException('Не удалось сохранить загруженный файл.');
        }

        return $path;
    }

    protected function deleteStoredFile(?string $path): void
    {
        if ($path && Storage::disk('public')->exists($path)) {
            Storage::disk('public')->delete($path);
        }
    }

    /**
     * Schema consumed by the React admin pages.
     *
     * @return array<string, mixed>
     */
    public function toSchema(): array
    {
        return [
            'slug' => static::$slug,
            'title' => static::$title,
            'singular' => static::$singular,
            'icon' => static::$icon,
            'group' => static::$group,
            'sections' => static::$sections,
            'softDeletes' => $this->usesSoftDeletes(),
            'sortableRows' => static::$sortableRows,
            'fields' => $this->fields(),
            'defaultSort' => $this->defaultSort(),
            'locales' => Locales::SUPPORTED,
            'defaultLocale' => Locales::DEFAULT,
        ];
    }

    /**
     * Navigation entry for the sidebar.
     *
     * @return array<string, mixed>
     */
    public static function navItem(): array
    {
        return [
            'slug' => static::$slug,
            'title' => static::$title,
            'icon' => static::$icon,
            'group' => static::$group,
            'order' => static::$order,
            'href' => '/admin/'.static::$slug,
        ];
    }
}

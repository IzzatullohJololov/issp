<?php

namespace App\Admin;

use App\Models\Contracts\Translatable;
use App\Support\Locales;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Validation\Rule;
use JsonSerializable;

/**
 * Declarative description of a single admin form field. Serialised to the
 * React admin UI, and used on the server to derive validation rules.
 */
class Field implements JsonSerializable
{
    public string $type = 'text';

    public bool $translatable = false;

    public bool $required = false;

    /** @var array<int, mixed> */
    public array $rules = [];

    /** @var array<int, array{value: string|int, label: string}> */
    public array $options = [];

    public ?string $help = null;

    public ?string $placeholder = null;

    public bool $onIndex = false;

    public bool $onForm = true;

    public bool $sortable = false;

    public bool $filterable = false;

    public string $width = 'full';

    public string $section = 'main';

    /** @var class-string<Model>|null */
    public ?string $relationModel = null;

    public ?string $relationLabel = null;

    public ?string $relationName = null;

    public mixed $default = null;

    public ?string $directory = null;

    public ?int $max = null;

    public ?int $rows = null;

    /** @var callable|null */
    public $indexUsing = null;

    final public function __construct(public string $name, public string $label) {}

    public static function make(string $name, string $label): static
    {
        return new static($name, $label);
    }

    public function type(string $type): static
    {
        $this->type = $type;

        return $this;
    }

    public static function text(string $name, string $label): static
    {
        return static::make($name, $label)->type('text');
    }

    public static function slug(string $name, string $label = 'URL (slug)'): static
    {
        return static::make($name, $label)->type('slug')->help('Оставьте пустым — будет создан автоматически из названия.');
    }

    public static function textarea(string $name, string $label): static
    {
        return static::make($name, $label)->type('textarea');
    }

    public static function richText(string $name, string $label): static
    {
        return static::make($name, $label)->type('richtext');
    }

    public static function number(string $name, string $label): static
    {
        return static::make($name, $label)->type('number')->width('third');
    }

    public static function boolean(string $name, string $label): static
    {
        return static::make($name, $label)->type('boolean')->width('third')->default(false);
    }

    public static function date(string $name, string $label): static
    {
        return static::make($name, $label)->type('date')->width('third');
    }

    public static function datetime(string $name, string $label): static
    {
        return static::make($name, $label)->type('datetime')->width('third');
    }

    public static function email(string $name, string $label): static
    {
        return static::make($name, $label)->type('email')->width('half');
    }

    public static function url(string $name, string $label): static
    {
        return static::make($name, $label)->type('url')->width('half');
    }

    public static function image(string $name, string $label): static
    {
        return static::make($name, $label)->type('image');
    }

    public static function file(string $name, string $label): static
    {
        return static::make($name, $label)->type('file');
    }

    public static function tags(string $name, string $label): static
    {
        return static::make($name, $label)->type('tags');
    }

    /**
     * @param  array<string|int, string>  $options  value => label
     */
    public static function select(string $name, string $label, array $options): static
    {
        return static::make($name, $label)->type('select')->options($options)->width('third');
    }

    /**
     * @param  class-string<Model>  $model
     */
    public static function relation(string $name, string $label, string $model, string $labelAttribute = 'name', ?string $relationName = null): static
    {
        $field = static::make($name, $label)->type('relation')->width('half');
        $field->relationModel = $model;
        $field->relationLabel = $labelAttribute;
        $field->relationName = $relationName ?? str($name)->beforeLast('_id')->camel()->toString();

        return $field;
    }

    public function translatable(bool $translatable = true): static
    {
        $this->translatable = $translatable;

        return $this;
    }

    public function required(bool $required = true): static
    {
        $this->required = $required;

        return $this;
    }

    /**
     * @param  array<int, mixed>  $rules
     */
    public function rules(array $rules): static
    {
        $this->rules = $rules;

        return $this;
    }

    /**
     * @param  array<string|int, string>  $options
     */
    public function options(array $options): static
    {
        $this->options = collect($options)
            ->map(fn ($label, $value) => ['value' => $value, 'label' => $label])
            ->values()
            ->all();

        return $this;
    }

    public function help(string $help): static
    {
        $this->help = $help;

        return $this;
    }

    public function placeholder(string $placeholder): static
    {
        $this->placeholder = $placeholder;

        return $this;
    }

    public function onIndex(bool $sortable = true): static
    {
        $this->onIndex = true;
        $this->sortable = $sortable;

        return $this;
    }

    public function hideFromForm(): static
    {
        $this->onForm = false;

        return $this;
    }

    public function filterable(): static
    {
        $this->filterable = true;

        return $this;
    }

    public function width(string $width): static
    {
        $this->width = $width;

        return $this;
    }

    public function section(string $section): static
    {
        $this->section = $section;

        return $this;
    }

    public function default(mixed $default): static
    {
        $this->default = $default;

        return $this;
    }

    public function directory(string $directory): static
    {
        $this->directory = $directory;

        return $this;
    }

    public function max(int $max): static
    {
        $this->max = $max;

        return $this;
    }

    public function rows(int $rows): static
    {
        $this->rows = $rows;

        return $this;
    }

    public function indexUsing(callable $callback): static
    {
        $this->indexUsing = $callback;

        return $this;
    }

    public function isUpload(): bool
    {
        return in_array($this->type, ['image', 'file'], true);
    }

    /**
     * Options for relation fields, resolved from the database.
     *
     * @return array<int, array{value: int|string, label: string}>
     */
    public function resolveOptions(): array
    {
        if ($this->type !== 'relation' || ! $this->relationModel) {
            return $this->options;
        }

        $model = new $this->relationModel;
        $query = $model->newQuery();

        if (in_array('sort_order', $model->getFillable(), true)) {
            $query->orderBy('sort_order');
        }

        return $query->get()
            ->map(function (Model $record) {
                $label = $record instanceof Translatable && $this->relationLabel !== null && $record->isTranslatable($this->relationLabel)
                    ? $record->tr($this->relationLabel)
                    : $record->getAttribute((string) $this->relationLabel);

                return ['value' => $record->getKey(), 'label' => (string) $label];
            })
            ->sortBy('label', SORT_NATURAL | SORT_FLAG_CASE)
            ->values()
            ->all();
    }

    /**
     * Validation rules keyed by request attribute.
     *
     * @return array<string, array<int, mixed>>
     */
    public function validationRules(?Model $model = null): array
    {
        $base = match ($this->type) {
            'text', 'slug', 'email', 'url' => ['string', 'max:'.($this->max ?? 255)],
            'textarea', 'richtext' => ['string', 'max:'.($this->max ?? 200000)],
            'number' => ['integer'],
            'boolean' => ['boolean'],
            'date', 'datetime' => ['date'],
            'select' => [Rule::in(array_column($this->options, 'value'))],
            'relation' => $this->relationModel ? [Rule::exists((new $this->relationModel)->getTable(), 'id')] : [],
            'image' => ['image', 'max:'.($this->max ?? 8192)],
            'file' => ['file', 'max:'.($this->max ?? 40960)],
            'tags' => ['array', 'max:50'],
            default => [],
        };

        if ($this->type === 'email') {
            $base[] = 'email';
        }

        if ($this->type === 'url') {
            $base[] = 'url';
        }

        if ($this->type === 'slug') {
            $base[] = 'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/';
            if ($model !== null) {
                $base[] = Rule::unique($model->getTable(), 'slug')->ignore($model->getKey());
            }
        }

        $base = [...$base, ...$this->rules];

        if ($this->translatable) {
            $rules = [];
            foreach (Locales::SUPPORTED as $locale) {
                $isDefault = $locale === Locales::DEFAULT;
                $rules["{$this->name}.{$locale}"] = [
                    $this->required && $isDefault ? 'required' : 'nullable',
                    ...$base,
                ];
            }
            $rules[$this->name] = ['nullable', 'array'];

            return $rules;
        }

        if ($this->isUpload()) {
            return [
                $this->name => ['nullable', ...$base],
                "{$this->name}_remove" => ['nullable', 'boolean'],
            ];
        }

        if ($this->type === 'tags') {
            return [
                $this->name => ['nullable', ...$base],
                "{$this->name}.*" => ['string', 'max:255'],
            ];
        }

        return [
            $this->name => [$this->required ? 'required' : 'nullable', ...$base],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function jsonSerialize(): array
    {
        return [
            'name' => $this->name,
            'label' => $this->label,
            'type' => $this->type,
            'translatable' => $this->translatable,
            'required' => $this->required,
            'options' => $this->resolveOptions(),
            'help' => $this->help,
            'placeholder' => $this->placeholder,
            'onIndex' => $this->onIndex,
            'onForm' => $this->onForm,
            'sortable' => $this->sortable,
            'filterable' => $this->filterable,
            'width' => $this->width,
            'section' => $this->section,
            'default' => $this->default,
            'rows' => $this->rows,
        ];
    }
}

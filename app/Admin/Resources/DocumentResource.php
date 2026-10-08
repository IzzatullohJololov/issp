<?php

namespace App\Admin\Resources;

use App\Admin\Field;
use App\Admin\Resource;
use App\Models\Document;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\UploadedFile;

class DocumentResource extends Resource
{
    public static string $model = Document::class;

    public static string $slug = 'documents';

    public static string $title = 'Документы';

    public static string $singular = 'Документ';

    public static string $icon = 'folder-open';

    public static string $group = 'Наука';

    public static int $order = 31;

    public static bool $sortableRows = true;

    public function fields(): array
    {
        return [
            Field::text('title', 'Название')->translatable()->required()->onIndex(),
            Field::select('category', 'Раздел', array_map(fn ($labels) => $labels['ru'], Document::CATEGORIES))
                ->default('general')->required()->onIndex()->filterable(),
            Field::file('file_path', 'Файл')->directory('uploads/documents')->onIndex(false)
                ->help('PDF, DOC, DOCX, XLS, XLSX, ZIP до 40 МБ.')
                ->rules(['mimes:pdf,doc,docx,xls,xlsx,ppt,pptx,zip,rtf,odt,txt']),
            Field::date('published_at', 'Дата документа')->onIndex(),
            Field::number('sort_order', 'Порядок')->default(0),
            Field::boolean('is_published', 'Опубликован')->default(true)->onIndex()->filterable(),
            Field::text('file_name', 'Имя файла')->hideFromForm()->onIndex(false),
            Field::number('file_size', 'Размер')->hideFromForm()->onIndex(false)
                ->indexUsing(fn (Document $document) => $document->humanSize()),
        ];
    }

    public function rules(?Model $model): array
    {
        $rules = parent::rules($model);

        if ($model === null || ! $model->exists) {
            $rules['file_path'] = array_map(fn ($rule) => $rule === 'nullable' ? 'required' : $rule, $rules['file_path']);
        }

        return $rules;
    }

    protected function afterUpload(Model $model, Field $field, UploadedFile $file): void
    {
        $model->setAttribute('file_name', $file->getClientOriginalName());
        $model->setAttribute('file_size', $file->getSize());
        $model->setAttribute('mime_type', $file->getClientMimeType());
    }
}

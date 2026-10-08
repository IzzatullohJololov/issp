<?php

namespace App\Http\Controllers\Admin;

use App\Admin\Resource;
use App\Admin\Resources;
use App\Http\Controllers\Controller;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Generic CRUD controller driven by the declarative admin resources.
 */
class ResourceController extends Controller
{
    public function index(Request $request, string $resource): Response
    {
        $resource = Resources::resolve($resource);

        $paginator = $resource
            ->applyIndexQuery($resource->query(), $request)
            ->paginate((int) $request->input('per_page', 20))
            ->withQueryString();

        $trashedCount = $resource->usesSoftDeletes() ? $resource->trashedQuery()->count() : 0;

        return Inertia::render('admin/resources/index', [
            'schema' => $resource->toSchema(),
            'items' => $paginator->through(fn (Model $model) => $resource->toIndexRow($model)),
            'query' => [
                'search' => (string) $request->input('search', ''),
                'filter' => (array) $request->input('filter', []),
                'sort' => (string) $request->input('sort', ''),
                'trashed' => $request->boolean('trashed'),
                'per_page' => (int) $request->input('per_page', 20),
            ],
            'trashedCount' => $trashedCount,
        ]);
    }

    public function create(string $resource): Response
    {
        $resource = Resources::resolve($resource);

        return Inertia::render('admin/resources/form', [
            'schema' => $resource->toSchema(),
            'item' => $resource->toFormData(null),
        ]);
    }

    public function store(Request $request, string $resource): RedirectResponse
    {
        $resource = Resources::resolve($resource);
        $model = $resource->newModel();

        $validated = $request->validate($resource->rules(null), [], $resource->attributeNames());

        DB::transaction(function () use ($resource, $model, $validated, $request) {
            $resource->fill($model, $validated, $request)->save();
            $resource->afterSave($model, $request);
        });

        return $this->redirectAfterSave($request, $resource, $model)
            ->with('success', $resource::$singular.' создана.');
    }

    public function edit(string $resource, int $id): Response
    {
        $resource = Resources::resolve($resource);
        $model = $this->findModel($resource, $id);

        return Inertia::render('admin/resources/form', [
            'schema' => $resource->toSchema(),
            'item' => $resource->toFormData($model),
            'meta' => [
                'created_at' => $model->getAttribute('created_at')?->toIso8601String(),
                'updated_at' => $model->getAttribute('updated_at')?->toIso8601String(),
                'deleted_at' => $model->getAttribute('deleted_at')?->toIso8601String(),
                'url' => $resource->publicUrl($model),
            ],
        ]);
    }

    public function update(Request $request, string $resource, int $id): RedirectResponse
    {
        $resource = Resources::resolve($resource);
        $model = $this->findModel($resource, $id);

        $validated = $request->validate($resource->rules($model), [], $resource->attributeNames());

        DB::transaction(function () use ($resource, $model, $validated, $request) {
            $resource->fill($model, $validated, $request)->save();
            $resource->afterSave($model, $request);
        });

        return $this->redirectAfterSave($request, $resource, $model)
            ->with('success', 'Изменения сохранены.');
    }

    public function destroy(string $resource, int $id): RedirectResponse
    {
        $resource = Resources::resolve($resource);
        $model = $this->findModel($resource, $id);

        $model->delete();

        return redirect('/admin/'.$resource::$slug)
            ->with('success', $resource->usesSoftDeletes() ? 'Перемещено в корзину.' : 'Удалено.');
    }

    public function restore(string $resource, int $id): RedirectResponse
    {
        $resource = Resources::resolve($resource);
        $model = $this->findModel($resource, $id, trashed: true);

        if (method_exists($model, 'restore')) {
            $model->restore();
        }

        return back()->with('success', 'Восстановлено.');
    }

    public function forceDestroy(string $resource, int $id): RedirectResponse
    {
        $resource = Resources::resolve($resource);
        $model = $this->findModel($resource, $id, trashed: true);

        $model->forceDelete();

        return back()->with('success', 'Удалено безвозвратно.');
    }

    public function duplicate(string $resource, int $id): RedirectResponse
    {
        $resource = Resources::resolve($resource);
        $model = $this->findModel($resource, $id);

        $copy = $model->replicate(['slug', 'views', 'created_by', 'updated_by']);

        foreach (['is_published'] as $flag) {
            if (array_key_exists($flag, $copy->getAttributes())) {
                $copy->setAttribute($flag, false);
            }
        }

        $copy->save();

        return redirect('/admin/'.$resource::$slug.'/'.$copy->getKey().'/edit')
            ->with('success', 'Создана копия. Не забудьте опубликовать её после правок.');
    }

    public function toggle(Request $request, string $resource, int $id): RedirectResponse
    {
        $resource = Resources::resolve($resource);
        $model = $this->findModel($resource, $id);

        $field = $resource->field((string) $request->input('field'));

        abort_unless($field && $field->type === 'boolean', 422, 'Поле не является переключателем.');

        $model->setAttribute($field->name, ! $model->getAttribute($field->name));

        if ($field->name === 'is_published' && $model->getAttribute('is_published') && array_key_exists('published_at', $model->getAttributes()) && ! $model->getAttribute('published_at')) {
            $model->setAttribute('published_at', now());
        }

        $model->save();

        return back()->with('success', 'Обновлено.');
    }

    public function bulk(Request $request, string $resource): RedirectResponse
    {
        $resource = Resources::resolve($resource);

        $data = $request->validate([
            'action' => ['required', Rule::in(['publish', 'unpublish', 'activate', 'deactivate', 'delete', 'restore', 'force_delete'])],
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['integer'],
        ]);

        $query = $resource->newModel()->newQuery()->whereKey($data['ids']);

        if (in_array($data['action'], ['restore', 'force_delete'], true)) {
            $resource->withTrashedRows($query, onlyTrashed: true);
        }

        $models = $query->get();
        $count = 0;

        foreach ($models as $model) {
            match ($data['action']) {
                'publish' => $this->setFlag($model, 'is_published', true),
                'unpublish' => $this->setFlag($model, 'is_published', false),
                'activate' => $this->setFlag($model, 'is_active', true),
                'deactivate' => $this->setFlag($model, 'is_active', false),
                'delete' => $model->delete(),
                'restore' => method_exists($model, 'restore') ? $model->restore() : null,
                'force_delete' => $model->forceDelete(),
                default => null,
            };
            $count++;
        }

        return back()->with('success', "Обработано записей: {$count}.");
    }

    public function reorder(Request $request, string $resource): RedirectResponse
    {
        $resource = Resources::resolve($resource);

        abort_unless($resource::$sortableRows, 422, 'Ресурс не поддерживает сортировку.');

        $data = $request->validate([
            'ids' => ['required', 'array'],
            'ids.*' => ['integer'],
        ]);

        DB::transaction(function () use ($resource, $data) {
            foreach ($data['ids'] as $position => $id) {
                $resource->newModel()->newQuery()->whereKey($id)->update(['sort_order' => $position + 1]);
            }
        });

        return back()->with('success', 'Порядок сохранён.');
    }

    protected function setFlag(Model $model, string $attribute, bool $value): void
    {
        if (! array_key_exists($attribute, $model->getAttributes())) {
            return;
        }

        $model->setAttribute($attribute, $value);

        if ($attribute === 'is_published' && $value && array_key_exists('published_at', $model->getAttributes()) && ! $model->getAttribute('published_at')) {
            $model->setAttribute('published_at', now());
        }

        $model->save();
    }

    protected function findModel(Resource $resource, int $id, bool $trashed = false): Model
    {
        return $resource->withTrashedRows($resource->newModel()->newQuery())->findOrFail($id);
    }

    protected function redirectAfterSave(Request $request, Resource $resource, Model $model): RedirectResponse
    {
        return match ($request->input('_after', 'index')) {
            'continue' => redirect('/admin/'.$resource::$slug.'/'.$model->getKey().'/edit'),
            'new' => redirect('/admin/'.$resource::$slug.'/create'),
            default => redirect('/admin/'.$resource::$slug),
        };
    }
}

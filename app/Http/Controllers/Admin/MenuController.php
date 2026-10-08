<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Menu;
use App\Models\MenuItem;
use App\Models\Page;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class MenuController extends Controller
{
    public function index(Request $request): Response
    {
        $menus = Menu::query()->orderBy('id')->get();
        $current = $menus->firstWhere('location', $request->input('menu', 'header')) ?? $menus->first();

        $items = $current
            ? $current->items()->get()->map(fn (MenuItem $item) => [
                'id' => $item->id,
                'parent_id' => $item->parent_id,
                'label' => $item->label,
                'url' => $item->url,
                'target' => $item->target,
                'sort_order' => $item->sort_order,
                'is_active' => $item->is_active,
            ])
            : collect();

        return Inertia::render('admin/menus/index', [
            'menus' => $menus->map(fn (Menu $menu) => ['id' => $menu->id, 'location' => $menu->location, 'name' => $menu->name]),
            'current' => $current ? ['id' => $current->id, 'location' => $current->location, 'name' => $current->name] : null,
            'items' => $items,
            'suggestions' => $this->suggestions(),
        ]);
    }

    public function storeItem(Request $request, Menu $menu): RedirectResponse
    {
        $data = $this->validateItem($request, $menu);

        $data['sort_order'] = (int) $menu->items()->where('parent_id', $data['parent_id'] ?? null)->max('sort_order') + 1;

        $item = $menu->items()->create($data);
        ActivityLog::record('created', $item, description: 'Пункт меню: '.($item->label['ru'] ?? ''));

        return back()->with('success', 'Пункт меню добавлен.');
    }

    public function updateItem(Request $request, Menu $menu, MenuItem $item): RedirectResponse
    {
        abort_unless($item->menu_id === $menu->id, 404);

        $data = $this->validateItem($request, $menu, $item);
        $item->update($data);
        ActivityLog::record('updated', $item, description: 'Пункт меню: '.($item->label['ru'] ?? ''));

        return back()->with('success', 'Пункт меню обновлён.');
    }

    public function destroyItem(Menu $menu, MenuItem $item): RedirectResponse
    {
        abort_unless($item->menu_id === $menu->id, 404);

        ActivityLog::record('deleted', $item, description: 'Пункт меню: '.($item->label['ru'] ?? ''));
        $item->delete();

        return back()->with('success', 'Пункт меню удалён.');
    }

    public function reorder(Request $request, Menu $menu): RedirectResponse
    {
        $data = $request->validate([
            'items' => ['required', 'array'],
            'items.*.id' => ['required', 'integer', Rule::exists('menu_items', 'id')->where('menu_id', $menu->id)],
            'items.*.parent_id' => ['nullable', 'integer'],
            'items.*.sort_order' => ['required', 'integer', 'min:0'],
        ]);

        DB::transaction(function () use ($data) {
            foreach ($data['items'] as $row) {
                MenuItem::query()->whereKey($row['id'])->update([
                    'parent_id' => $row['parent_id'] ?: null,
                    'sort_order' => $row['sort_order'],
                ]);
            }
        });

        return back()->with('success', 'Структура меню сохранена.');
    }

    /**
     * @return array<string, mixed>
     */
    protected function validateItem(Request $request, Menu $menu, ?MenuItem $item = null): array
    {
        return $request->validate([
            'label' => ['required', 'array'],
            'label.ru' => ['required', 'string', 'max:120'],
            'label.en' => ['nullable', 'string', 'max:120'],
            'url' => ['nullable', 'string', 'max:500'],
            'target' => ['required', Rule::in(['_self', '_blank'])],
            'is_active' => ['boolean'],
            'parent_id' => [
                'nullable',
                'integer',
                Rule::exists('menu_items', 'id')->where('menu_id', $menu->id),
                Rule::notIn([$item?->id]),
            ],
        ]);
    }

    /**
     * Built-in site sections and published pages offered as link targets.
     *
     * @return array<int, array{label: string, url: string}>
     */
    protected function suggestions(): array
    {
        $static = [
            ['label' => 'Главная', 'url' => '/'],
            ['label' => 'Новости', 'url' => '/news'],
            ['label' => 'События и семинары', 'url' => '/events'],
            ['label' => 'Структура института', 'url' => '/structure'],
            ['label' => 'Сотрудники', 'url' => '/people'],
            ['label' => 'Дирекция', 'url' => '/people?group=management'],
            ['label' => 'Учёный совет', 'url' => '/people?group=council'],
            ['label' => 'Публикации', 'url' => '/publications'],
            ['label' => 'Документы', 'url' => '/documents'],
            ['label' => 'Вакансии', 'url' => '/vacancies'],
            ['label' => 'Контакты', 'url' => '/contacts'],
        ];

        $pages = Page::query()->where('is_published', true)->orderBy('sort_order')->get()
            ->map(fn (Page $page) => ['label' => 'Страница: '.$page->tr('title', 'ru'), 'url' => $page->url()])
            ->all();

        return [...$static, ...$pages];
    }
}

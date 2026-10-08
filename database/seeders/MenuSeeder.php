<?php

namespace Database\Seeders;

use App\Models\Menu;
use Illuminate\Database\Seeder;

class MenuSeeder extends Seeder
{
    public function run(): void
    {
        $header = Menu::query()->firstOrCreate(['location' => 'header'], ['name' => 'Главное меню']);
        $footer = Menu::query()->firstOrCreate(['location' => 'footer'], ['name' => 'Меню в подвале']);

        if ($header->items()->exists()) {
            return;
        }

        $this->seedItems($header, [
            ['ru' => 'Институт', 'en' => 'Institute', 'url' => '/pages/about', 'children' => [
                ['ru' => 'Об институте', 'en' => 'About', 'url' => '/pages/about'],
                ['ru' => 'История', 'en' => 'History', 'url' => '/pages/history'],
                ['ru' => 'Дирекция', 'en' => 'Administration', 'url' => '/people?group=management'],
                ['ru' => 'Учёный совет', 'en' => 'Scientific Council', 'url' => '/people?group=council'],
                ['ru' => 'Структура', 'en' => 'Structure', 'url' => '/structure'],
                ['ru' => 'Сотрудники', 'en' => 'Staff', 'url' => '/people'],
                ['ru' => 'Документы', 'en' => 'Documents', 'url' => '/documents'],
                ['ru' => 'Противодействие коррупции', 'en' => 'Anti-corruption', 'url' => '/pages/anticorruption'],
            ]],
            ['ru' => 'Наука', 'en' => 'Research', 'url' => '/structure', 'children' => [
                ['ru' => 'Научные направления', 'en' => 'Research areas', 'url' => '/pages/research'],
                ['ru' => 'Лаборатории', 'en' => 'Laboratories', 'url' => '/structure'],
                ['ru' => 'Публикации', 'en' => 'Publications', 'url' => '/publications'],
                ['ru' => 'Семинары и конференции', 'en' => 'Seminars & conferences', 'url' => '/events'],
                ['ru' => 'Диссертационный совет', 'en' => 'Dissertation Council', 'url' => '/pages/dissertation-council'],
                ['ru' => 'Центр коллективного пользования', 'en' => 'Shared Research Facility', 'url' => '/pages/shared-facility'],
                ['ru' => 'Библиотека', 'en' => 'Library', 'url' => '/pages/library'],
            ]],
            ['ru' => 'Образование', 'en' => 'Education', 'url' => '/pages/postgraduate', 'children' => [
                ['ru' => 'Аспирантура', 'en' => 'Postgraduate studies', 'url' => '/pages/postgraduate'],
                ['ru' => 'Базовые кафедры', 'en' => 'University chairs', 'url' => '/pages/chairs'],
                ['ru' => 'Школьникам и студентам', 'en' => 'For students', 'url' => '/pages/students'],
            ]],
            ['ru' => 'Новости', 'en' => 'News', 'url' => '/news'],
            ['ru' => 'События', 'en' => 'Events', 'url' => '/events'],
            ['ru' => 'Вакансии', 'en' => 'Vacancies', 'url' => '/vacancies'],
            ['ru' => 'Контакты', 'en' => 'Contacts', 'url' => '/contacts'],
        ]);

        $this->seedItems($footer, [
            ['ru' => 'Новости', 'en' => 'News', 'url' => '/news'],
            ['ru' => 'События', 'en' => 'Events', 'url' => '/events'],
            ['ru' => 'Структура', 'en' => 'Structure', 'url' => '/structure'],
            ['ru' => 'Публикации', 'en' => 'Publications', 'url' => '/publications'],
            ['ru' => 'Документы', 'en' => 'Documents', 'url' => '/documents'],
            ['ru' => 'Аспирантура', 'en' => 'Postgraduate', 'url' => '/pages/postgraduate'],
            ['ru' => 'Вакансии', 'en' => 'Vacancies', 'url' => '/vacancies'],
            ['ru' => 'Контакты', 'en' => 'Contacts', 'url' => '/contacts'],
        ]);
    }

    /**
     * @param  array<int, array<string, mixed>>  $items
     */
    protected function seedItems(Menu $menu, array $items, ?int $parentId = null): void
    {
        foreach ($items as $index => $item) {
            $created = $menu->items()->create([
                'parent_id' => $parentId,
                'label' => ['ru' => $item['ru'], 'en' => $item['en']],
                'url' => $item['url'],
                'sort_order' => $index + 1,
                'is_active' => true,
            ]);

            if (! empty($item['children'])) {
                $this->seedItems($menu, $item['children'], $created->id);
            }
        }
    }
}

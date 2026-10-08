<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Setting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SettingController extends Controller
{
    /**
     * Declarative description of the settings form, grouped by tab.
     *
     * @return array<string, array{title: string, fields: array<int, array<string, mixed>>}>
     */
    public static function groups(): array
    {
        return [
            'general' => [
                'title' => 'Общие',
                'fields' => [
                    ['key' => 'site_name', 'label' => 'Короткое название', 'type' => 'text', 'translatable' => true],
                    ['key' => 'site_full_name', 'label' => 'Полное название', 'type' => 'text', 'translatable' => true],
                    ['key' => 'site_tagline', 'label' => 'Слоган / подзаголовок', 'type' => 'textarea', 'translatable' => true],
                    ['key' => 'site_founded', 'label' => 'Год основания', 'type' => 'number'],
                    ['key' => 'home_intro', 'label' => 'Текст блока «Об институте» на главной', 'type' => 'textarea', 'translatable' => true],
                    ['key' => 'stats', 'label' => 'Показатели на главной', 'type' => 'stats', 'help' => 'Числа и подписи, показываемые в блоке статистики.'],
                ],
            ],
            'contacts' => [
                'title' => 'Контакты',
                'fields' => [
                    ['key' => 'contact_address', 'label' => 'Адрес', 'type' => 'textarea', 'translatable' => true],
                    ['key' => 'contact_phone', 'label' => 'Телефон', 'type' => 'text'],
                    ['key' => 'contact_fax', 'label' => 'Факс', 'type' => 'text'],
                    ['key' => 'contact_email', 'label' => 'E-mail', 'type' => 'email'],
                    ['key' => 'contact_hours', 'label' => 'Часы работы', 'type' => 'text', 'translatable' => true],
                    ['key' => 'contact_map_url', 'label' => 'Ссылка на карту (embed)', 'type' => 'url', 'help' => 'URL для iframe Яндекс.Карт или Google Maps.'],
                    ['key' => 'contact_form_recipients', 'label' => 'Получатели формы обратной связи', 'type' => 'text', 'help' => 'E-mail адреса через запятую.'],
                ],
            ],
            'social' => [
                'title' => 'Соцсети',
                'fields' => [
                    ['key' => 'social_links', 'label' => 'Ссылки на соцсети', 'type' => 'links'],
                ],
            ],
            'footer' => [
                'title' => 'Подвал и SEO',
                'fields' => [
                    ['key' => 'footer_text', 'label' => 'Текст в подвале', 'type' => 'textarea', 'translatable' => true],
                    ['key' => 'seo_description', 'label' => 'Meta description по умолчанию', 'type' => 'textarea', 'translatable' => true],
                    ['key' => 'seo_keywords', 'label' => 'Ключевые слова', 'type' => 'text'],
                    ['key' => 'analytics_code', 'label' => 'Код счётчика (Яндекс.Метрика и т.п.)', 'type' => 'code'],
                ],
            ],
        ];
    }

    public function edit(): Response
    {
        return Inertia::render('admin/settings/edit', [
            'groups' => self::groups(),
            'values' => Setting::values(),
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'values' => ['required', 'array'],
        ])['values'];

        $allowed = [];
        foreach (self::groups() as $group => $definition) {
            foreach ($definition['fields'] as $field) {
                $allowed[$field['key']] = ['group' => $group, 'type' => $field['type'], 'translatable' => $field['translatable'] ?? false];
            }
        }

        foreach ($data as $key => $value) {
            if (! isset($allowed[$key])) {
                continue;
            }

            $meta = $allowed[$key];

            $value = match ($meta['type']) {
                'number' => is_numeric($value) ? (int) $value : null,
                'stats', 'links' => is_array($value) ? array_values(array_filter($value, fn ($row) => is_array($row) && filled($row['label'] ?? $row['url'] ?? null))) : [],
                default => $meta['translatable'] ? (is_array($value) ? array_map(fn ($v) => is_string($v) ? trim($v) : '', $value) : ['ru' => (string) $value]) : (is_string($value) ? trim($value) : $value),
            };

            Setting::set($key, $value, $meta['group']);
        }

        ActivityLog::record('updated', null, description: 'Настройки сайта');

        return back()->with('success', 'Настройки сохранены.');
    }
}

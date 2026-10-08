<?php

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;

class SettingSeeder extends Seeder
{
    public function run(): void
    {
        $settings = [
            'general' => [
                'site_name' => ['ru' => 'ИФТТ РАН', 'en' => 'ISSP RAS'],
                'site_full_name' => [
                    'ru' => 'Институт физики твёрдого тела имени Ю. А. Осипьяна Российской академии наук',
                    'en' => 'Osipyan Institute of Solid State Physics of the Russian Academy of Sciences',
                ],
                'site_tagline' => [
                    'ru' => 'Фундаментальные исследования конденсированного состояния вещества с 1963 года',
                    'en' => 'Fundamental research in condensed matter physics since 1963',
                ],
                'site_founded' => 1963,
                'home_intro' => [
                    'ru' => 'ИФТТ РАН — один из ведущих научных центров России в области физики твёрдого тела. Институт основан в 1963 году академиком Ю. А. Осипьяном в Научном центре РАН в Черноголовке. Сегодня здесь работают более двадцати лабораторий, ведущих исследования по физике низкоразмерных электронных систем, сверхпроводимости, физике металлов и полупроводников, квантовым кристаллам, высоким давлениям и созданию новых материалов.',
                    'en' => 'ISSP RAS is one of the leading research centres in Russia in the field of solid state physics. The Institute was founded in 1963 by Academician Yu. A. Osipyan at the Chernogolovka Scientific Centre of the Russian Academy of Sciences. Today more than twenty laboratories carry out research in low-dimensional electron systems, superconductivity, physics of metals and semiconductors, quantum crystals, high pressures and new materials.',
                ],
                'stats' => [
                    ['value' => '1963', 'label' => ['ru' => 'год основания', 'en' => 'founded']],
                    ['value' => '20+', 'label' => ['ru' => 'лабораторий', 'en' => 'laboratories']],
                    ['value' => '500+', 'label' => ['ru' => 'сотрудников', 'en' => 'staff members']],
                    ['value' => '3', 'label' => ['ru' => 'базовые кафедры', 'en' => 'university chairs']],
                ],
            ],
            'contacts' => [
                'contact_address' => [
                    'ru' => "142432, Московская область, г. Черноголовка,\nул. Академика Осипьяна, д. 2",
                    'en' => "2 Academician Osipyan str., Chernogolovka,\nMoscow District, 142432, Russia",
                ],
                'contact_phone' => '+7 (496) 522-82-04',
                'contact_fax' => '+7 (496) 524-97-01',
                'contact_email' => 'info@issp.ac.ru',
                'contact_hours' => ['ru' => 'Пн–Пт, 9:00–18:00', 'en' => 'Mon–Fri, 9:00–18:00'],
                'contact_map_url' => 'https://yandex.ru/map-widget/v1/?ll=38.388%2C56.009&z=15&pt=38.388%2C56.009',
                'contact_form_recipients' => '',
            ],
            'social' => [
                'social_links' => [
                    ['label' => 'Telegram', 'url' => 'https://t.me/'],
                    ['label' => 'ВКонтакте', 'url' => 'https://vk.com/'],
                    ['label' => 'YouTube', 'url' => 'https://youtube.com/'],
                ],
            ],
            'footer' => [
                'footer_text' => [
                    'ru' => 'Федеральное государственное бюджетное учреждение науки Институт физики твёрдого тела имени Ю. А. Осипьяна Российской академии наук.',
                    'en' => 'Osipyan Institute of Solid State Physics of the Russian Academy of Sciences, a federal state budgetary institution of science.',
                ],
                'seo_description' => [
                    'ru' => 'Официальный сайт Института физики твёрдого тела РАН: новости, структура, лаборатории, публикации, семинары, аспирантура.',
                    'en' => 'Official website of the Institute of Solid State Physics RAS: news, structure, laboratories, publications, seminars, postgraduate studies.',
                ],
                'seo_keywords' => 'ИФТТ РАН, физика твёрдого тела, Черноголовка, ISSP RAS',
                'analytics_code' => '',
            ],
        ];

        foreach ($settings as $group => $values) {
            foreach ($values as $key => $value) {
                Setting::set($key, $value, $group);
            }
        }
    }
}

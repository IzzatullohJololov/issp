<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Event;
use App\Models\Laboratory;
use App\Models\Link;
use App\Models\News;
use App\Models\Page;
use App\Models\Publication;
use App\Models\Slide;
use App\Models\Vacancy;
use Illuminate\Database\Seeder;

class ContentSeeder extends Seeder
{
    public function run(): void
    {
        if (News::query()->exists()) {
            return;
        }

        $this->seedPages();
        $this->seedNews();
        $this->seedEvents();
        $this->seedPublications();
        $this->seedVacancies();
        $this->seedSlides();
        $this->seedLinks();
    }

    protected function seedPages(): void
    {
        $about = Page::query()->create([
            'slug' => 'about',
            'title' => ['ru' => 'Об институте', 'en' => 'About the Institute'],
            'excerpt' => ['ru' => 'Институт физики твёрдого тела имени Ю. А. Осипьяна РАН', 'en' => 'Osipyan Institute of Solid State Physics RAS'],
            'body' => [
                'ru' => '<p>Институт физики твёрдого тела РАН (ИФТТ РАН) создан в 1963 году в Научном центре РАН в Черноголовке. Основателем и первым директором института был академик Юрий Андреевич Осипьян, имя которого институт носит с 2009 года.</p><p>Основные направления исследований института — физика низкоразмерных электронных систем и квантовый транспорт, сверхпроводимость, физика металлов, полупроводников и дефектов, квантовые кристаллы, физика высоких давлений, рост кристаллов и создание новых функциональных материалов.</p><h2>Институт сегодня</h2><p>В состав института входят более двадцати научных лабораторий, центр коллективного пользования с уникальным экспериментальным оборудованием, аспирантура и диссертационный совет. Институт является базовой организацией для кафедр МФТИ, МГУ и НИУ ВШЭ.</p>',
                'en' => '<p>The Institute of Solid State Physics RAS (ISSP RAS) was founded in 1963 at the Chernogolovka Scientific Centre of the Russian Academy of Sciences. The founder and first director was Academician Yuri A. Osipyan, whose name the Institute has borne since 2009.</p><p>The main research areas are low-dimensional electron systems and quantum transport, superconductivity, physics of metals, semiconductors and defects, quantum crystals, high-pressure physics, crystal growth and new functional materials.</p><h2>The Institute today</h2><p>The Institute comprises more than twenty laboratories, a shared research facility with unique equipment, postgraduate programmes and a dissertation council. ISSP hosts university chairs of MIPT, Moscow State University and HSE University.</p>',
            ],
            'sort_order' => 1,
        ]);

        $children = [
            ['history', 'История', 'History', '<p>Институт физики твёрдого тела был организован постановлением Президиума АН СССР в 1963 году. Первым директором стал Ю. А. Осипьян, который руководил институтом до 2002 года. Под его руководством сформировались научные школы по физике дислокаций, сверхпроводимости, физике полупроводников и квантовых кристаллов.</p><h2>Ключевые даты</h2><ul><li><strong>1963</strong> — основание института в Черноголовке.</li><li><strong>1970-е</strong> — создание лабораторий высоких давлений, квантовых кристаллов, структурных исследований.</li><li><strong>1990-е</strong> — начало исследований высокотемпературной сверхпроводимости и двумерных электронных систем.</li><li><strong>2009</strong> — институту присвоено имя академика Ю. А. Осипьяна.</li><li><strong>2010-е</strong> — модернизация приборной базы, создание центра коллективного пользования.</li></ul>', '<p>The Institute of Solid State Physics was established by a decree of the Presidium of the USSR Academy of Sciences in 1963. Its first director, Yu. A. Osipyan, led the Institute until 2002 and founded scientific schools in dislocation physics, superconductivity, semiconductor physics and quantum crystals.</p>'],
            ['anticorruption', 'Противодействие коррупции', 'Anti-corruption', '<p>В разделе размещаются нормативные документы, локальные акты института, формы отчётов и сведения о доходах, а также контакты для обращений граждан по вопросам противодействия коррупции.</p><p>Документы доступны в разделе <a href="/documents?category=anticorruption">Документы — Противодействие коррупции</a>.</p>', '<p>This section contains regulatory documents, local acts, reporting forms and contacts for anti-corruption enquiries.</p>'],
            ['research', 'Научные направления', 'Research areas', '<p>Научная деятельность института сосредоточена на фундаментальных проблемах физики конденсированного состояния. Основные направления исследований утверждены учёным советом и соответствуют приоритетам Программы фундаментальных научных исследований РАН.</p><ul><li>Физика низкоразмерных электронных систем и квантовый транспорт</li><li>Сверхпроводимость и сверхпроводящие наноструктуры</li><li>Физика реальных кристаллов, дефекты и границы зёрен</li><li>Полупроводники, спектроскопия и оптика твёрдого тела</li><li>Квантовые кристаллы и физика сверхнизких температур</li><li>Высокие давления и экстремальные состояния вещества</li><li>Рост кристаллов и новые функциональные материалы</li></ul>', '<p>Research at the Institute focuses on fundamental problems of condensed matter physics.</p>'],
            ['dissertation-council', 'Диссертационный совет', 'Dissertation Council', '<p>При институте действует диссертационный совет по специальности 1.3.8 — физика конденсированного состояния. Объявления о защитах, авторефераты и диссертации публикуются в разделе документов и в ленте событий.</p>', '<p>The Institute hosts a dissertation council in condensed matter physics. Defence announcements are published in the events feed.</p>'],
            ['shared-facility', 'Центр коллективного пользования', 'Shared Research Facility', '<p>Центр коллективного пользования ИФТТ РАН объединяет уникальное научное оборудование института: электронные микроскопы, рентгеновские дифрактометры, криогенные установки, системы роста кристаллов. Центр предоставляет услуги научным организациям и предприятиям.</p>', '<p>The Shared Research Facility of ISSP RAS provides access to electron microscopes, X-ray diffractometers, cryogenic equipment and crystal growth systems.</p>'],
            ['library', 'Библиотека', 'Library', '<p>Научная библиотека института располагает фондом научной литературы по физике твёрдого тела и обеспечивает доступ к электронным ресурсам: базам данных Scopus, Web of Science, журналам издательств APS, Elsevier, Springer и IOP.</p>', '<p>The scientific library provides access to physics literature and electronic resources.</p>'],
        ];

        foreach ($children as $index => [$slug, $ru, $en, $bodyRu, $bodyEn]) {
            Page::query()->create([
                'parent_id' => $about->id,
                'slug' => $slug,
                'title' => ['ru' => $ru, 'en' => $en],
                'body' => ['ru' => $bodyRu, 'en' => $bodyEn],
                'sort_order' => $index + 1,
            ]);
        }

        $education = Page::query()->create([
            'slug' => 'education',
            'title' => ['ru' => 'Образование', 'en' => 'Education'],
            'body' => ['ru' => '<p>Институт ведёт подготовку научных кадров в аспирантуре и на базовых кафедрах ведущих университетов.</p>', 'en' => '<p>The Institute trains researchers through postgraduate programmes and university chairs.</p>'],
            'sort_order' => 2,
        ]);

        $educationChildren = [
            ['postgraduate', 'Аспирантура', 'Postgraduate studies', '<p>Аспирантура ИФТТ РАН осуществляет подготовку по научной специальности 1.3.8 «Физика конденсированного состояния». Срок обучения — 4 года. Приём документов проводится ежегодно; правила приёма, программы вступительных испытаний и расписание размещаются в разделе <a href="/documents?category=postgraduate">Документы — Аспирантура</a>.</p><h2>Контакты отдела аспирантуры</h2><p>Телефон и e-mail отдела аспирантуры уточняйте на странице контактов.</p>', '<p>The postgraduate programme of ISSP RAS trains researchers in condensed matter physics. Admission rules and schedules are published in the Documents section.</p>'],
            ['chairs', 'Базовые кафедры', 'University chairs', '<h2>Кафедра физики твёрдого тела МФТИ</h2><p>Базовая кафедра Московского физико-технического института. Студенты проходят обучение и выполняют научную работу в лабораториях ИФТТ.</p><h2>Кафедра физики конденсированных сред НИУ ВШЭ</h2><p>Базовая кафедра факультета физики Высшей школы экономики.</p><h2>Филиал кафедры МГУ</h2><p>Совместные образовательные программы с физическим факультетом МГУ имени М. В. Ломоносова.</p>', '<p>ISSP hosts chairs of MIPT, HSE University and Moscow State University.</p>'],
            ['students', 'Школьникам и студентам', 'For students', '<p>Институт проводит экскурсии для школьников, летние школы, олимпиады и дни открытых дверей. Студенты могут пройти практику и выполнить курсовые и дипломные работы в лабораториях института.</p>', '<p>The Institute organises excursions, summer schools and internships for students.</p>'],
        ];

        foreach ($educationChildren as $index => [$slug, $ru, $en, $bodyRu, $bodyEn]) {
            Page::query()->create([
                'parent_id' => $education->id,
                'slug' => $slug,
                'title' => ['ru' => $ru, 'en' => $en],
                'body' => ['ru' => $bodyRu, 'en' => $bodyEn],
                'sort_order' => $index + 1,
            ]);
        }
    }

    protected function seedNews(): void
    {
        $categories = [
            ['science', 'Наука', 'Science', 'blue'],
            ['institute', 'Жизнь института', 'Institute life', 'emerald'],
            ['education', 'Образование', 'Education', 'amber'],
            ['announcements', 'Объявления', 'Announcements', 'rose'],
        ];

        /** @var array<string, Category> $created */
        $created = [];

        foreach ($categories as $index => [$slug, $ru, $en, $color]) {
            $created[$slug] = Category::query()->create([
                'slug' => $slug,
                'name' => ['ru' => $ru, 'en' => $en],
                'color' => $color,
                'sort_order' => $index + 1,
            ]);
        }

        $items = [
            ['science', 'Исследователи института наблюдали новое квантовое состояние в двумерной электронной системе', 'Institute researchers observe a new quantum state in a two-dimensional electron system', 'Результаты работы, выполненной в лаборатории квантового транспорта, опубликованы в журнале Physical Review Letters.', 'The results of work carried out in the Laboratory of Quantum Transport are published in Physical Review Letters.', 2, true],
            ['institute', 'Состоялось заседание учёного совета ИФТТ РАН', 'Meeting of the ISSP RAS Scientific Council', 'На заседании были заслушаны отчёты лабораторий за прошедший год и утверждён план научных мероприятий.', 'The council heard the annual reports of the laboratories and approved the plan of scientific events.', 5, false],
            ['education', 'Открыт приём документов в аспирантуру', 'Admission to postgraduate studies is open', 'Приём документов продлится до конца августа. Подробная информация — в разделе «Аспирантура».', 'Applications are accepted until the end of August. See the Postgraduate section for details.', 9, false],
            ['science', 'Новый метод выращивания профилированных сапфировых кристаллов', 'A new method for growing shaped sapphire crystals', 'Сотрудники лаборатории профилированных кристаллов разработали технологию получения крупногабаритных сапфировых пластин.', 'Researchers of the Laboratory of Shaped Crystals have developed a technology for large sapphire plates.', 14, false],
            ['announcements', 'Школа молодых учёных «Физика конденсированного состояния»', 'Young Scientists School "Condensed Matter Physics"', 'Регистрация участников открыта. Школа пройдёт в Черноголовке в ноябре.', 'Registration is open. The school will take place in Chernogolovka in November.', 20, false],
            ['institute', 'Институт принял участие в фестивале науки', 'The Institute took part in the Science Festival', 'Сотрудники лабораторий провели экскурсии и лекции для школьников Черноголовки и Ногинского района.', 'Laboratory staff gave tours and lectures for school students.', 27, false],
            ['science', 'Сверхпроводимость в новых соединениях на основе железа', 'Superconductivity in new iron-based compounds', 'Лаборатория сверхпроводимости сообщает о синтезе и исследовании новых соединений с критической температурой выше 40 К.', 'The Laboratory of Superconductivity reports the synthesis of new compounds with a critical temperature above 40 K.', 35, false],
            ['announcements', 'Объявление о защите диссертации', 'Thesis defence announcement', 'На заседании диссертационного совета состоится защита кандидатской диссертации по специальности 1.3.8.', 'A PhD thesis defence will take place at the dissertation council meeting.', 41, false],
        ];

        foreach ($items as [$category, $ru, $en, $exRu, $exEn, $daysAgo, $pinned]) {
            News::query()->create([
                'category_id' => $created[$category]->id,
                'title' => ['ru' => $ru, 'en' => $en],
                'excerpt' => ['ru' => $exRu, 'en' => $exEn],
                'body' => [
                    'ru' => "<p>{$exRu}</p><p>Подробная информация будет опубликована дополнительно. Следите за новостями института и анонсами семинаров.</p>",
                    'en' => "<p>{$exEn}</p><p>More details will be published later. Follow the Institute news and seminar announcements.</p>",
                ],
                'is_published' => true,
                'is_pinned' => $pinned,
                'published_at' => now()->subDays($daysAgo)->setTime(11, 0),
                'views' => random_int(40, 900),
            ]);
        }
    }

    protected function seedEvents(): void
    {
        $labs = Laboratory::query()->orderBy('sort_order')->get();

        $events = [
            ['seminar', 'Общеинститутский семинар: топологические сверхпроводники', 'Institute seminar: topological superconductors', 'А. Н. Докладчик', 'ИФТТ РАН', 3, 15],
            ['seminar', 'Семинар по физике низких температур', 'Low temperature physics seminar', 'M. Speaker', 'ИТФ им. Л. Д. Ландау РАН', 8, 11],
            ['defense', 'Защита кандидатской диссертации', 'PhD thesis defence', null, null, 12, 14],
            ['conference', 'Конференция «Фундаментальные проблемы физики твёрдого тела»', 'Conference "Fundamental Problems of Solid State Physics"', null, null, 30, 10],
            ['school', 'Школа молодых учёных по физике конденсированного состояния', 'Young scientists school on condensed matter physics', null, null, 45, 10],
            ['lecture', 'Открытая лекция для школьников: «Как увидеть атом?»', 'Public lecture for school students: "How to see an atom?"', 'Сотрудник ЛЭМ', 'ИФТТ РАН', 18, 16],
            ['seminar', 'Семинар лаборатории спектроскопии дефектных структур', 'Seminar of the Laboratory of Defect Structure Spectroscopy', 'Сотрудник лаборатории', 'ИФТТ РАН', -6, 15],
            ['seminar', 'Семинар: сверхтвёрдые фазы углерода при высоких давлениях', 'Seminar: superhard carbon phases at high pressures', 'Сотрудник ЛФВД', 'ИФТТ РАН', -20, 11],
        ];

        foreach ($events as $index => [$type, $ru, $en, $speaker, $affiliation, $days, $hour]) {
            Event::query()->create([
                'laboratory_id' => $labs->isNotEmpty() ? $labs[$index % $labs->count()]->id : null,
                'type' => $type,
                'title' => ['ru' => $ru, 'en' => $en],
                'description' => [
                    'ru' => '<p>Приглашаются все желающие. Аннотация доклада и материалы будут размещены на странице события.</p>',
                    'en' => '<p>Everyone is welcome. The abstract and materials will be posted on the event page.</p>',
                ],
                'speaker' => $speaker,
                'speaker_affiliation' => $affiliation,
                'location' => ['ru' => 'Конференц-зал ИФТТ РАН, главный корпус', 'en' => 'ISSP RAS conference hall, main building'],
                'starts_at' => now()->addDays($days)->setTime($hour, 0),
                'ends_at' => now()->addDays($days)->setTime($hour + 2, 0),
                'is_published' => true,
            ]);
        }
    }

    protected function seedPublications(): void
    {
        $labs = Laboratory::query()->orderBy('sort_order')->get();

        $publications = [
            ['article', 'Quantum Hall effect in graphene heterostructures with controlled disorder', 'A. Ivanov, B. Petrov, C. Sidorov', 'Physical Review B', 2025, '111', '045401', true],
            ['article', 'Pressure-induced amorphisation of layered chalcogenides', 'D. Smirnov, E. Kuznetsova', 'Journal of Applied Physics', 2025, '137', '025901', false],
            ['article', 'Электроны над поверхностью жидкого гелия в сильных магнитных полях', 'А. А. Иванов, И. И. Петров', 'Журнал экспериментальной и теоретической физики', 2024, '165', '412–425', true],
            ['review', 'Grain boundary phase transitions in metallic alloys: a review', 'O. Volkov, N. Orlova', 'Progress in Materials Science', 2024, '140', '101180', true],
            ['article', 'Дислокационная люминесценция в кремнии, легированном германием', 'С. С. Соколов, В. В. Морозов', 'Физика твёрдого тела', 2024, '66', '1120–1127', false],
            ['proceedings', 'Growth of large-diameter shaped sapphire plates by the Stepanov method', 'P. Nikolaev et al.', 'Journal of Crystal Growth', 2023, '612', '127180', false],
            ['article', 'Josephson effect in hybrid superconductor–topological insulator junctions', 'K. Fedorov, L. Mikhailova', 'Nature Communications', 2023, '14', '5521', true],
            ['book', 'Физика реальных кристаллов', 'Коллектив авторов', 'Наука', 2022, null, '384 с.', false],
        ];

        foreach ($publications as $index => [$type, $title, $authors, $journal, $year, $volume, $pages, $featured]) {
            Publication::query()->create([
                'laboratory_id' => $labs->isNotEmpty() ? $labs[$index % $labs->count()]->id : null,
                'type' => $type,
                'title' => $title,
                'authors' => $authors,
                'journal' => $journal,
                'year' => $year,
                'volume' => $volume,
                'pages' => $pages,
                'is_featured' => $featured,
            ]);
        }
    }

    protected function seedVacancies(): void
    {
        $lab = Laboratory::query()->orderBy('sort_order')->first();

        Vacancy::query()->create([
            'laboratory_id' => $lab?->id,
            'title' => ['ru' => 'Младший научный сотрудник', 'en' => 'Junior Research Fellow'],
            'description' => [
                'ru' => '<p>Приглашаем выпускников физических факультетов для работы над проектами по физике низкоразмерных систем. Возможно совмещение с обучением в аспирантуре.</p>',
                'en' => '<p>We invite physics graduates to work on low-dimensional systems projects. Combination with postgraduate studies is possible.</p>',
            ],
            'requirements' => [
                'ru' => "Высшее образование по физике\nОпыт экспериментальной работы\nАнглийский язык на уровне чтения научной литературы",
                'en' => "MSc in physics\nExperimental experience\nReading knowledge of English",
            ],
            'salary' => 'по результатам собеседования',
            'contact_email' => 'hr@issp.ac.ru',
            'deadline' => now()->addMonths(2)->toDateString(),
            'is_published' => true,
        ]);

        Vacancy::query()->create([
            'title' => ['ru' => 'Инженер-исследователь (криогенные установки)', 'en' => 'Research Engineer (cryogenic equipment)'],
            'description' => [
                'ru' => '<p>Обслуживание и модернизация криогенного оборудования центра коллективного пользования.</p>',
                'en' => '<p>Maintenance and upgrade of the cryogenic equipment of the shared research facility.</p>',
            ],
            'requirements' => ['ru' => "Инженерное образование\nОпыт работы с вакуумной и криогенной техникой", 'en' => "Engineering degree\nExperience with vacuum and cryogenic systems"],
            'contact_email' => 'hr@issp.ac.ru',
            'is_published' => true,
        ]);
    }

    protected function seedSlides(): void
    {
        Slide::query()->create([
            'title' => ['ru' => 'Институт физики твёрдого тела им. Ю. А. Осипьяна РАН', 'en' => 'Osipyan Institute of Solid State Physics RAS'],
            'subtitle' => ['ru' => 'Фундаментальные исследования конденсированного состояния вещества в Черноголовке с 1963 года.', 'en' => 'Fundamental condensed matter research in Chernogolovka since 1963.'],
            'link_url' => '/pages/about',
            'button_text' => ['ru' => 'Об институте', 'en' => 'About the Institute'],
            'sort_order' => 1,
        ]);

        Slide::query()->create([
            'title' => ['ru' => 'Приём в аспирантуру', 'en' => 'Postgraduate admission'],
            'subtitle' => ['ru' => 'Подготовка научных кадров по специальности «Физика конденсированного состояния».', 'en' => 'Training researchers in condensed matter physics.'],
            'link_url' => '/pages/postgraduate',
            'button_text' => ['ru' => 'Подробнее', 'en' => 'Learn more'],
            'sort_order' => 2,
        ]);
    }

    protected function seedLinks(): void
    {
        $links = [
            ['Российская академия наук', 'Russian Academy of Sciences', 'https://www.ras.ru', 'partners'],
            ['Научный центр РАН в Черноголовке', 'Chernogolovka Scientific Centre RAS', 'https://www.chg.ru', 'partners'],
            ['Московский физико-технический институт', 'MIPT', 'https://mipt.ru', 'partners'],
            ['МГУ имени М. В. Ломоносова', 'Lomonosov Moscow State University', 'https://www.msu.ru', 'partners'],
            ['НИУ Высшая школа экономики', 'HSE University', 'https://www.hse.ru', 'partners'],
            ['Российский научный фонд', 'Russian Science Foundation', 'https://rscf.ru', 'useful'],
            ['Минобрнауки России', 'Ministry of Science and Higher Education', 'https://minobrnauki.gov.ru', 'useful'],
            ['Журнал «Физика твёрдого тела»', 'Physics of the Solid State', 'https://journals.ioffe.ru/journals/1', 'journals'],
            ['ЖЭТФ', 'JETP', 'http://www.jetp.ras.ru', 'journals'],
        ];

        foreach ($links as $index => [$ru, $en, $url, $group]) {
            Link::query()->create([
                'title' => ['ru' => $ru, 'en' => $en],
                'url' => $url,
                'group' => $group,
                'sort_order' => $index + 1,
            ]);
        }
    }
}

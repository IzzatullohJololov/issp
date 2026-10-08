<?php

namespace Database\Seeders;

use App\Models\Department;
use App\Models\Laboratory;
use App\Models\Person;
use App\Models\ResearchArea;
use Illuminate\Database\Seeder;

class StructureSeeder extends Seeder
{
    public function run(): void
    {
        if (Laboratory::query()->exists()) {
            return;
        }

        $areas = [
            ['atom', 'Низкоразмерные электронные системы', 'Low-dimensional electron systems', 'Квантовый транспорт, двумерные электронные системы, графен, топологические состояния вещества.', 'Quantum transport, two-dimensional electron systems, graphene, topological states of matter.'],
            ['zap', 'Сверхпроводимость', 'Superconductivity', 'Высокотемпературные и необычные сверхпроводники, джозефсоновские структуры, вихревая материя.', 'High-temperature and unconventional superconductors, Josephson structures, vortex matter.'],
            ['layers', 'Физика металлов и сплавов', 'Physics of metals and alloys', 'Прочность и пластичность, дефекты кристаллической решётки, границы зёрен, фазовые превращения.', 'Strength and plasticity, lattice defects, grain boundaries, phase transformations.'],
            ['cpu', 'Полупроводники и дефекты', 'Semiconductors and defects', 'Электронные и оптические свойства полупроводников, дефектные структуры, спектроскопия.', 'Electronic and optical properties of semiconductors, defect structures, spectroscopy.'],
            ['gem', 'Высокие давления', 'High pressures', 'Фазовые переходы и новые фазы вещества при высоких давлениях, аморфизация, сверхтвёрдые материалы.', 'Phase transitions and new phases of matter at high pressures, amorphisation, superhard materials.'],
            ['snowflake', 'Квантовые кристаллы и жидкости', 'Quantum crystals and liquids', 'Твёрдый и жидкий гелий, квантовые эффекты при сверхнизких температурах, электроны на поверхности гелия.', 'Solid and liquid helium, quantum effects at ultra-low temperatures, electrons on the helium surface.'],
            ['flask', 'Рост кристаллов и новые материалы', 'Crystal growth and new materials', 'Профилированные кристаллы, керамика, твёрдые электролиты, наноматериалы для энергетики.', 'Shaped crystals, ceramics, solid electrolytes, nanomaterials for energy applications.'],
            ['microscope', 'Структурные исследования', 'Structural studies', 'Рентгеноструктурный анализ, электронная микроскопия, нейтронография, синхротронные методы.', 'X-ray diffraction, electron microscopy, neutron scattering, synchrotron techniques.'],
        ];

        foreach ($areas as $index => [$icon, $ru, $en, $descRu, $descEn]) {
            ResearchArea::query()->create([
                'title' => ['ru' => $ru, 'en' => $en],
                'description' => ['ru' => $descRu, 'en' => $descEn],
                'icon' => $icon,
                'sort_order' => $index + 1,
            ]);
        }

        $director = Person::query()->create([
            'full_name' => ['ru' => 'Левченко Александр Алексеевич', 'en' => 'Alexander A. Levchenko'],
            'position' => ['ru' => 'Директор института', 'en' => 'Director'],
            'degree' => ['ru' => 'член-корреспондент РАН, доктор физико-математических наук', 'en' => 'Corresponding Member of RAS, Dr. Sci. (Phys.-Math.)'],
            'is_management' => true,
            'management_role' => ['ru' => 'Директор', 'en' => 'Director'],
            'is_council_member' => true,
            'email' => 'director@issp.ac.ru',
            'sort_order' => 1,
        ]);

        $management = [
            ['Заместитель директора по научной работе', 'Deputy Director for Research', 2],
            ['Заместитель директора по научной работе', 'Deputy Director for Research', 3],
            ['Учёный секретарь', 'Scientific Secretary', 4],
            ['Заместитель директора по общим вопросам', 'Deputy Director for General Affairs', 5],
        ];

        foreach ($management as [$ru, $en, $order]) {
            Person::query()->create([
                'full_name' => ['ru' => 'Фамилия Имя Отчество', 'en' => 'Full Name'],
                'position' => ['ru' => $ru, 'en' => $en],
                'degree' => ['ru' => 'доктор физико-математических наук', 'en' => 'Dr. Sci. (Phys.-Math.)'],
                'is_management' => true,
                'management_role' => ['ru' => $ru, 'en' => $en],
                'is_council_member' => true,
                'sort_order' => $order,
            ]);
        }

        $departments = [
            ['Физика конденсированного состояния', 'Condensed Matter Physics', [
                ['Лаборатория квантового транспорта', 'Laboratory of Quantum Transport', 'ЛКТ', "Квантовый эффект Холла\nДвумерные электронные системы\nТопологические изоляторы\nГрафен и ван-дер-ваальсовы гетероструктуры"],
                ['Лаборатория электронной кинетики', 'Laboratory of Electron Kinetics', 'ЛЭК', "Транспорт в низкоразмерных системах\nМезоскопические структуры\nСпиновые явления"],
                ['Лаборатория сверхпроводимости', 'Laboratory of Superconductivity', 'ЛС', "ВТСП и необычные сверхпроводники\nДжозефсоновские контакты\nВихревая материя\nСверхпроводящие наноструктуры"],
                ['Лаборатория неравновесных электронных процессов', 'Laboratory of Non-Equilibrium Electron Processes', 'ЛНЭП', "Экситоны и поляритоны\nБозе-конденсация в твёрдых телах\nОптическая спектроскопия наноструктур"],
                ['Лаборатория квантовых кристаллов', 'Laboratory of Quantum Crystals', 'ЛКК', "Твёрдый и жидкий гелий\nЭлектроны над поверхностью гелия\nФизика сверхнизких температур"],
                ['Лаборатория спектроскопии поверхности полупроводников', 'Laboratory of Semiconductor Surface Spectroscopy', 'ЛСПП', "Фотоэлектронная спектроскопия\nПоверхности и интерфейсы полупроводников\nТопологические материалы"],
            ]],
            ['Физика реальных кристаллов и материаловедение', 'Real Crystals and Materials Science', [
                ['Лаборатория спектроскопии дефектных структур', 'Laboratory of Defect Structure Spectroscopy', 'ЛСДС', "Дефекты в полупроводниках\nДислокации и примеси в кремнии\nФотолюминесценция и ЭПР-спектроскопия"],
                ['Лаборатория структурных исследований', 'Laboratory of Structural Studies', 'ЛСИ', "Рентгеновская дифракция\nСинхротронные исследования\nСтруктура тонких плёнок и наноматериалов"],
                ['Лаборатория реальной структуры кристаллов', 'Laboratory of Real Crystal Structure', 'ЛРСК', "Границы зёрен\nФазовые переходы на границах\nЗернограничная инженерия"],
                ['Лаборатория материаловедения', 'Laboratory of Materials Science', 'ЛМ', "Металлические сплавы и композиты\nПрочность и пластичность\nИнтенсивная пластическая деформация"],
                ['Лаборатория физико-химических основ кристаллизации', 'Laboratory of Physico-Chemical Fundamentals of Crystallisation', 'ЛФХОК', "Рост кристаллов из расплава\nКристаллизация в экстремальных условиях\nОксидные монокристаллы"],
                ['Лаборатория профилированных кристаллов', 'Laboratory of Shaped Crystals', 'ЛПК', "Выращивание сапфира и профилированных кристаллов\nМетод Степанова\nОптические и конструкционные кристаллы"],
                ['Лаборатория электронной микроскопии', 'Laboratory of Electron Microscopy', 'ЛЭМ', "Просвечивающая и растровая электронная микроскопия\nМикроанализ\nНаноструктуры"],
            ]],
            ['Экстремальные состояния и новые материалы', 'Extreme States and New Materials', [
                ['Лаборатория физики высоких давлений', 'Laboratory of High Pressure Physics', 'ЛФВД', "Фазовые превращения под давлением\nАморфизация под давлением\nСверхтвёрдые и метастабильные фазы"],
                ['Лаборатория ионики твёрдого тела', 'Laboratory of Solid State Ionics', 'ЛИТТ', "Твёрдые электролиты\nТвердооксидные топливные элементы\nМатериалы для водородной энергетики"],
                ['Лаборатория внутреннего трения', 'Laboratory of Internal Friction', 'ЛВТ', "Механическая спектроскопия\nРелаксационные процессы в твёрдых телах\nКомпозитные материалы"],
                ['Лаборатория физики лазерных и оптических материалов', 'Laboratory of Laser and Optical Materials', 'ЛФЛОМ', "Лазерные кристаллы\nНелинейно-оптические материалы\nСпектроскопия редкоземельных ионов"],
            ]],
        ];

        $order = 1;

        foreach ($departments as $index => [$nameRu, $nameEn, $labs]) {
            $department = Department::query()->create([
                'name' => ['ru' => $nameRu, 'en' => $nameEn],
                'sort_order' => $index + 1,
            ]);

            foreach ($labs as [$labRu, $labEn, $short, $areasRu]) {
                $lab = Laboratory::query()->create([
                    'department_id' => $department->id,
                    'name' => ['ru' => $labRu, 'en' => $labEn],
                    'short_name' => $short,
                    'description' => [
                        'ru' => "<p>{$labRu} ведёт фундаментальные и прикладные исследования в рамках основных научных направлений института. Коллектив лаборатории участвует в российских и международных проектах, готовит аспирантов и студентов базовых кафедр.</p>",
                        'en' => "<p>The {$labEn} carries out fundamental and applied research within the main scientific directions of the Institute. The team participates in Russian and international projects and supervises postgraduate and undergraduate students.</p>",
                    ],
                    'research_areas' => ['ru' => $areasRu, 'en' => ''],
                    'sort_order' => $order++,
                ]);

                $head = Person::query()->create([
                    'laboratory_id' => $lab->id,
                    'full_name' => ['ru' => 'Заведующий лабораторией (заполнить)', 'en' => 'Head of laboratory (to be filled)'],
                    'position' => ['ru' => 'Заведующий лабораторией', 'en' => 'Head of Laboratory'],
                    'degree' => ['ru' => 'доктор физико-математических наук', 'en' => 'Dr. Sci. (Phys.-Math.)'],
                    'is_council_member' => true,
                    'sort_order' => 10,
                ]);

                $lab->update(['head_id' => $head->id]);
            }
        }

        $director->update(['laboratory_id' => null]);
    }
}

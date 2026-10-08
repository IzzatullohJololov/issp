<?php

use App\Models\Event;
use App\Models\Laboratory;
use App\Models\News;
use App\Models\Page;
use App\Models\Person;
use Database\Seeders\MenuSeeder;
use Database\Seeders\SettingSeeder;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->seed([SettingSeeder::class, MenuSeeder::class]);
});

it('renders the home page with site data', function () {
    News::query()->create([
        'title' => ['ru' => 'Тестовая новость', 'en' => 'Test news'],
        'is_published' => true,
        'published_at' => now()->subDay(),
    ]);

    $this->get('/')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('site/home')
            ->has('news', 1)
            ->where('news.0.title', 'Тестовая новость')
            ->where('site.name', 'ИФТТ РАН')
            ->has('site.menus.header'));
});

it('shows published news and hides drafts', function () {
    $published = News::query()->create([
        'title' => ['ru' => 'Опубликовано', 'en' => 'Published'],
        'is_published' => true,
        'published_at' => now()->subHour(),
    ]);

    $draft = News::query()->create([
        'title' => ['ru' => 'Черновик', 'en' => 'Draft'],
        'is_published' => false,
    ]);

    $this->get('/news')->assertOk()->assertInertia(fn (Assert $page) => $page->has('items.data', 1));
    $this->get('/news/'.$published->slug)->assertOk();
    $this->get('/news/'.$draft->slug)->assertNotFound();
});

it('switches locale and resolves english translations', function () {
    Page::query()->create([
        'slug' => 'about',
        'title' => ['ru' => 'Об институте', 'en' => 'About the Institute'],
        'body' => ['ru' => '<p>ru</p>', 'en' => '<p>en</p>'],
    ]);

    $this->get('/lang/en')->assertRedirect();

    $this->get('/pages/about')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('locale', 'en')
            ->where('page.title', 'About the Institute'));
});

it('falls back to russian when a translation is missing', function () {
    Page::query()->create([
        'slug' => 'history',
        'title' => ['ru' => 'История', 'en' => ''],
    ]);

    $this->withSession(['locale' => 'en'])
        ->get('/pages/history')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->where('page.title', 'История'));
});

it('lists structure, labs and people', function () {
    $lab = Laboratory::query()->create(['name' => ['ru' => 'Лаборатория X', 'en' => 'Lab X']]);
    $person = Person::query()->create([
        'laboratory_id' => $lab->id,
        'full_name' => ['ru' => 'Иванов Иван', 'en' => 'Ivan Ivanov'],
        'is_management' => true,
    ]);

    $this->get('/structure')->assertOk()->assertInertia(fn (Assert $page) => $page->has('management', 1)->has('otherLabs', 1));
    $this->get('/labs/'.$lab->slug)->assertOk()->assertInertia(fn (Assert $page) => $page->has('people', 1));
    $this->get('/people/'.$person->slug)->assertOk();
    $this->get('/people?group=management')->assertOk()->assertInertia(fn (Assert $page) => $page->has('items.data', 1));
});

it('shows upcoming and past events separately', function () {
    Event::query()->create(['title' => ['ru' => 'Будущее'], 'starts_at' => now()->addDays(3)]);
    Event::query()->create(['title' => ['ru' => 'Прошлое'], 'starts_at' => now()->subDays(3)]);

    $this->get('/events')->assertInertia(fn (Assert $page) => $page->has('items.data', 1)->where('items.data.0.title', 'Будущее'));
    $this->get('/events?period=past')->assertInertia(fn (Assert $page) => $page->has('items.data', 1)->where('items.data.0.title', 'Прошлое'));
});

it('stores contact form messages and blocks the honeypot', function () {
    $this->post('/contacts', [
        'name' => 'Пётр',
        'email' => 'petr@example.com',
        'body' => 'Здравствуйте, у меня вопрос по аспирантуре.',
    ])->assertRedirect()->assertSessionHas('success');

    $this->assertDatabaseHas('messages', ['email' => 'petr@example.com', 'is_read' => false]);

    $this->post('/contacts', [
        'name' => 'Бот',
        'email' => 'bot@example.com',
        'body' => 'Спам спам спам спам',
        'website' => 'http://spam',
    ])->assertSessionHasErrors('website');
});

it('searches across content types', function () {
    News::query()->create(['title' => ['ru' => 'Сверхпроводимость в новых материалах'], 'is_published' => true, 'published_at' => now()]);

    $this->get('/search?q=Сверхпроводимость')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->where('total', 1)->has('results.news', 1));
});

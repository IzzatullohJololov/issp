<?php

use App\Models\ActivityLog;
use App\Models\Document;
use App\Models\Menu;
use App\Models\Message;
use App\Models\News;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

function admin(): User
{
    return User::factory()->admin()->create();
}

function editor(): User
{
    return User::factory()->create();
}

it('redirects guests to the login page', function () {
    $this->get('/admin')->assertRedirect('/login');
    $this->get('/admin/news')->assertRedirect('/login');
});

it('logs users in and records the login', function () {
    $user = admin();

    $this->post('/login', ['email' => $user->email, 'password' => 'password'])
        ->assertRedirect('/admin');

    $this->assertAuthenticatedAs($user);
    $this->assertDatabaseHas('activity_logs', ['user_id' => $user->id, 'action' => 'login']);
});

it('rejects inactive users', function () {
    $user = User::factory()->inactive()->create();

    $this->post('/login', ['email' => $user->email, 'password' => 'password'])
        ->assertSessionHasErrors('email');

    $this->assertGuest();
});

it('renders the dashboard with stats', function () {
    $this->actingAs(admin())
        ->get('/admin')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('admin/dashboard')->has('stats', 6)->has('admin.navigation'));
});

it('creates, updates and trashes a news item through the generic resource controller', function () {
    $user = admin();

    $this->actingAs($user)
        ->post('/admin/news', [
            'title' => ['ru' => 'Новая новость', 'en' => 'New item'],
            'excerpt' => ['ru' => '', 'en' => ''],
            'body' => ['ru' => '<p>Текст</p>', 'en' => ''],
            'is_published' => true,
            'is_pinned' => false,
            '_after' => 'continue',
        ])
        ->assertRedirectContains('/admin/news/')
        ->assertSessionHas('success');

    $news = News::query()->firstOrFail();

    expect($news->slug)->toBe('new-item')
        ->and($news->published_at)->not->toBeNull()
        ->and($news->created_by)->toBe($user->id)
        ->and($news->tr('title', 'en'))->toBe('New item');

    expect(ActivityLog::query()->where('action', 'created')->where('subject_id', $news->id)->exists())->toBeTrue();

    $this->actingAs($user)
        ->put("/admin/news/{$news->id}", [
            'title' => ['ru' => 'Обновлено', 'en' => 'Updated'],
            'slug' => 'custom-slug',
            'is_published' => false,
        ])
        ->assertRedirect('/admin/news');

    $news->refresh();
    expect($news->slug)->toBe('custom-slug')->and($news->is_published)->toBeFalse();

    $this->actingAs($user)->delete("/admin/news/{$news->id}")->assertRedirect('/admin/news');
    $this->assertSoftDeleted('news', ['id' => $news->id]);

    $this->actingAs($user)->post("/admin/news/{$news->id}/restore")->assertRedirect();
    $this->assertDatabaseHas('news', ['id' => $news->id, 'deleted_at' => null]);
});

it('validates required translated fields', function () {
    $this->actingAs(admin())
        ->post('/admin/news', ['title' => ['ru' => '', 'en' => 'Only english']])
        ->assertSessionHasErrors('title.ru');
});

it('filters, searches and paginates resource indexes', function () {
    News::query()->create(['title' => ['ru' => 'Сверхпроводимость'], 'is_published' => true, 'published_at' => now()]);
    News::query()->create(['title' => ['ru' => 'Черновик про давление'], 'is_published' => false]);

    $this->actingAs(editor())
        ->get('/admin/news?search=давление')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('admin/resources/index')->has('items.data', 1));

    $this->actingAs(editor())
        ->get('/admin/news?filter[is_published]=1')
        ->assertInertia(fn (Assert $page) => $page->has('items.data', 1)->where('items.data.0.title', 'Сверхпроводимость'));
});

it('supports bulk actions and quick toggles', function () {
    $a = News::query()->create(['title' => ['ru' => 'A'], 'is_published' => false]);
    $b = News::query()->create(['title' => ['ru' => 'B'], 'is_published' => false]);

    $this->actingAs(admin())
        ->post('/admin/news/bulk', ['action' => 'publish', 'ids' => [$a->id, $b->id]])
        ->assertRedirect();

    expect(News::query()->where('is_published', true)->count())->toBe(2);

    $this->actingAs(admin())->post("/admin/news/{$a->id}/toggle", ['field' => 'is_published'])->assertRedirect();
    expect($a->refresh()->is_published)->toBeFalse();
});

it('uploads documents with files', function () {
    Storage::fake('public');

    $this->actingAs(admin())
        ->post('/admin/documents', [
            'title' => ['ru' => 'Устав', 'en' => 'Charter'],
            'category' => 'charter',
            'file_path' => UploadedFile::fake()->create('ustav.pdf', 120, 'application/pdf'),
            'is_published' => true,
        ])
        ->assertRedirect('/admin/documents');

    $document = Document::query()->firstOrFail();

    expect($document->file_name)->toBe('ustav.pdf')->and($document->file_path)->toStartWith('uploads/documents/');
    Storage::disk('public')->assertExists($document->file_path);
});

it('rejects a document without a file on creation', function () {
    $this->actingAs(admin())
        ->post('/admin/documents', ['title' => ['ru' => 'Без файла'], 'category' => 'general'])
        ->assertSessionHasErrors('file_path');
});

it('manages menu items', function () {
    $menu = Menu::query()->create(['location' => 'header', 'name' => 'Главное']);

    $this->actingAs(admin())
        ->post("/admin/menus/{$menu->id}/items", ['label' => ['ru' => 'Новости', 'en' => 'News'], 'url' => '/news', 'target' => '_self', 'is_active' => true])
        ->assertRedirect();

    $item = $menu->items()->firstOrFail();
    expect(Menu::tree('header')[0]['label'])->toBe('Новости');

    $this->actingAs(admin())->delete("/admin/menus/{$menu->id}/items/{$item->id}")->assertRedirect();
    $this->assertDatabaseMissing('menu_items', ['id' => $item->id]);
});

it('restricts settings and users to administrators', function () {
    $this->actingAs(editor())->get('/admin/settings')->assertForbidden();
    $this->actingAs(editor())->get('/admin/users')->assertForbidden();
    $this->actingAs(admin())->get('/admin/settings')->assertOk();
});

it('saves settings and clears the cache', function () {
    $this->actingAs(admin())
        ->put('/admin/settings', ['values' => ['site_name' => ['ru' => 'Институт', 'en' => 'Institute'], 'contact_phone' => '+7 000']])
        ->assertRedirect();

    expect(Setting::text('site_name', 'en'))->toBe('Institute')
        ->and(Setting::get('contact_phone'))->toBe('+7 000');
});

it('manages users and prevents self-deletion', function () {
    $me = admin();

    $this->actingAs($me)
        ->post('/admin/users', ['name' => 'Редактор', 'email' => 'new@issp.local', 'password' => 'secret-pass-123', 'password_confirmation' => 'secret-pass-123', 'role' => 'editor', 'is_active' => true])
        ->assertRedirect('/admin/users');

    $this->assertDatabaseHas('users', ['email' => 'new@issp.local', 'role' => 'editor']);

    $this->actingAs($me)->delete("/admin/users/{$me->id}")->assertRedirect()->assertSessionHas('error');
    $this->assertDatabaseHas('users', ['id' => $me->id]);
});

it('marks messages as read when opened', function () {
    $message = Message::query()->create(['name' => 'A', 'email' => 'a@a.ru', 'body' => 'Привет, это тест.']);

    $this->actingAs(editor())->get("/admin/messages/{$message->id}")->assertOk();
    expect($message->refresh()->is_read)->toBeTrue();
});

it('uploads files to the media library', function () {
    Storage::fake('public');

    $this->actingAs(editor())
        ->post('/admin/media', ['files' => [UploadedFile::fake()->image('photo.jpg', 800, 600)], 'folder' => 'news'])
        ->assertRedirect();

    $this->assertDatabaseHas('media', ['file_name' => 'photo.jpg', 'folder' => 'news', 'width' => 800]);
});

it('shows trashed items in the global trash', function () {
    $news = News::query()->create(['title' => ['ru' => 'Удалённая']]);
    $news->delete();

    $this->actingAs(admin())
        ->get('/admin/trash')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->has('groups', 1)->where('groups.0.slug', 'news'));
});

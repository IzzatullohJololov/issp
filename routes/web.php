<?php

use App\Admin\Resources;
use App\Http\Controllers\Admin;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Site;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Public site
|--------------------------------------------------------------------------
*/

Route::get('/', Site\HomeController::class)->name('home');

Route::get('/news', [Site\NewsController::class, 'index'])->name('news.index');
Route::get('/news/{news}', [Site\NewsController::class, 'show'])->name('news.show');

Route::get('/events', [Site\EventController::class, 'index'])->name('events.index');
Route::get('/events/{event}', [Site\EventController::class, 'show'])->name('events.show');

Route::get('/structure', [Site\StructureController::class, 'index'])->name('structure');
Route::get('/labs/{laboratory}', [Site\StructureController::class, 'lab'])->name('labs.show');

Route::get('/people', [Site\PeopleController::class, 'index'])->name('people.index');
Route::get('/people/{person}', [Site\PeopleController::class, 'show'])->name('people.show');

Route::get('/publications', [Site\PublicationController::class, 'index'])->name('publications');
Route::get('/documents', [Site\DocumentController::class, 'index'])->name('documents');

Route::get('/vacancies', [Site\VacancyController::class, 'index'])->name('vacancies.index');
Route::get('/vacancies/{vacancy}', [Site\VacancyController::class, 'show'])->name('vacancies.show');

Route::get('/pages/{page}', [Site\PageController::class, 'show'])->name('pages.show');

Route::get('/contacts', [Site\ContactController::class, 'show'])->name('contacts');
Route::post('/contacts', [Site\ContactController::class, 'store'])->middleware('throttle:10,1')->name('contacts.store');

Route::get('/search', Site\SearchController::class)->name('search');
Route::get('/lang/{locale}', Site\LocaleController::class)->name('locale');

/*
|--------------------------------------------------------------------------
| Authentication
|--------------------------------------------------------------------------
*/

Route::middleware('guest')->group(function () {
    Route::get('/login', [LoginController::class, 'create'])->name('login');
    Route::post('/login', [LoginController::class, 'store'])->middleware('throttle:10,1');
});

Route::post('/logout', [LoginController::class, 'destroy'])->middleware('auth')->name('logout');

/*
|--------------------------------------------------------------------------
| Admin panel
|--------------------------------------------------------------------------
*/

Route::prefix('admin')->name('admin.')->middleware(['auth', 'role'])->group(function () {
    Route::get('/', Admin\DashboardController::class)->name('dashboard');

    Route::get('/profile', [Admin\ProfileController::class, 'edit'])->name('profile');
    Route::post('/profile', [Admin\ProfileController::class, 'update']);
    Route::put('/profile/password', [Admin\ProfileController::class, 'updatePassword']);

    Route::get('/media', [Admin\MediaController::class, 'index'])->name('media');
    Route::post('/media', [Admin\MediaController::class, 'store']);
    Route::post('/media/bulk-delete', [Admin\MediaController::class, 'bulkDestroy']);
    Route::put('/media/{media}', [Admin\MediaController::class, 'update']);
    Route::delete('/media/{media}', [Admin\MediaController::class, 'destroy']);

    Route::get('/messages', [Admin\MessageController::class, 'index'])->name('messages');
    Route::post('/messages/bulk', [Admin\MessageController::class, 'bulk']);
    Route::get('/messages/{message}', [Admin\MessageController::class, 'show']);
    Route::put('/messages/{message}', [Admin\MessageController::class, 'update']);
    Route::delete('/messages/{message}', [Admin\MessageController::class, 'destroy']);

    Route::get('/menus', [Admin\MenuController::class, 'index'])->name('menus');
    Route::post('/menus/{menu}/items', [Admin\MenuController::class, 'storeItem']);
    Route::post('/menus/{menu}/reorder', [Admin\MenuController::class, 'reorder']);
    Route::put('/menus/{menu}/items/{item}', [Admin\MenuController::class, 'updateItem']);
    Route::delete('/menus/{menu}/items/{item}', [Admin\MenuController::class, 'destroyItem']);

    Route::get('/trash', [Admin\TrashController::class, 'index'])->name('trash');

    Route::middleware('role:admin')->group(function () {
        Route::get('/settings', [Admin\SettingController::class, 'edit'])->name('settings');
        Route::put('/settings', [Admin\SettingController::class, 'update']);

        Route::get('/activity', [Admin\ActivityLogController::class, 'index'])->name('activity');
        Route::delete('/trash', [Admin\TrashController::class, 'empty']);

        Route::get('/users', [Admin\UserController::class, 'index'])->name('users');
        Route::get('/users/create', [Admin\UserController::class, 'create']);
        Route::post('/users', [Admin\UserController::class, 'store']);
        Route::get('/users/{user}/edit', [Admin\UserController::class, 'edit']);
        Route::put('/users/{user}', [Admin\UserController::class, 'update']);
        Route::delete('/users/{user}', [Admin\UserController::class, 'destroy']);
    });

    // Generic declarative resources (news, events, pages, ...).
    Route::prefix('{resource}')->whereIn('resource', Resources::slugs())->group(function () {
        Route::get('/', [Admin\ResourceController::class, 'index'])->name('resource.index');
        Route::get('/create', [Admin\ResourceController::class, 'create'])->name('resource.create');
        Route::post('/', [Admin\ResourceController::class, 'store'])->name('resource.store');
        Route::post('/bulk', [Admin\ResourceController::class, 'bulk'])->name('resource.bulk');
        Route::post('/reorder', [Admin\ResourceController::class, 'reorder'])->name('resource.reorder');
        Route::get('/{id}/edit', [Admin\ResourceController::class, 'edit'])->whereNumber('id')->name('resource.edit');
        Route::put('/{id}', [Admin\ResourceController::class, 'update'])->whereNumber('id')->name('resource.update');
        Route::delete('/{id}', [Admin\ResourceController::class, 'destroy'])->whereNumber('id')->name('resource.destroy');
        Route::post('/{id}/restore', [Admin\ResourceController::class, 'restore'])->whereNumber('id')->name('resource.restore');
        Route::delete('/{id}/force', [Admin\ResourceController::class, 'forceDestroy'])->whereNumber('id')->name('resource.force');
        Route::post('/{id}/duplicate', [Admin\ResourceController::class, 'duplicate'])->whereNumber('id')->name('resource.duplicate');
        Route::post('/{id}/toggle', [Admin\ResourceController::class, 'toggle'])->whereNumber('id')->name('resource.toggle');
    });
});

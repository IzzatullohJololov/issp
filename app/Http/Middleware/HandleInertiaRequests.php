<?php

namespace App\Http\Middleware;

use App\Admin\Resources;
use App\Models\Menu;
use App\Models\Message;
use App\Models\Setting;
use App\Support\Locales;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();
        $isAdmin = $request->is('admin*');

        return [
            ...parent::share($request),
            'name' => Setting::text('site_name', default: config('app.name')),
            'locale' => app()->getLocale(),
            'locales' => Locales::LABELS,
            'auth' => [
                'user' => $user ? [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'avatar' => $user->avatarUrl(),
                ] : null,
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
            'site' => fn () => $isAdmin ? null : $this->siteData(),
            'admin' => fn () => $isAdmin && $user ? [
                'navigation' => Resources::navigation(),
                'unreadMessages' => Message::query()->where('is_read', false)->where('is_archived', false)->count(),
            ] : null,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    protected function siteData(): array
    {
        return [
            'name' => Setting::text('site_name', default: 'ИФТТ РАН'),
            'fullName' => Setting::text('site_full_name'),
            'tagline' => Setting::text('site_tagline'),
            'address' => Setting::text('contact_address'),
            'phone' => Setting::get('contact_phone', ''),
            'fax' => Setting::get('contact_fax', ''),
            'email' => Setting::get('contact_email', ''),
            'workingHours' => Setting::text('contact_hours'),
            'mapUrl' => Setting::get('contact_map_url', ''),
            'social' => Setting::get('social_links', []),
            'footerText' => Setting::text('footer_text'),
            'founded' => Setting::get('site_founded', 1963),
            'menus' => [
                'header' => Menu::tree('header'),
                'footer' => Menu::tree('footer'),
            ],
        ];
    }
}

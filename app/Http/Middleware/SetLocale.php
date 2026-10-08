<?php

namespace App\Http\Middleware;

use App\Support\Locales;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Resolves the interface language: an explicit choice stored in the session
 * wins, otherwise the site default (Russian) is used. The browser language is
 * intentionally ignored so that the institute's primary audience always sees
 * the Russian version unless they switch manually.
 */
class SetLocale
{
    public function handle(Request $request, Closure $next): Response
    {
        $locale = $request->session()->get('locale');

        if (! Locales::isSupported($locale)) {
            $locale = Locales::DEFAULT;
        }

        app()->setLocale($locale);

        return $next($request);
    }
}

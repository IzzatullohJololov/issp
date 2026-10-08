<?php

namespace App\Http\Controllers\Site;

use App\Http\Controllers\Controller;
use App\Models\Message;
use App\Models\Setting;
use App\Notifications\NewContactMessage;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class ContactController extends Controller
{
    public function show(): Response
    {
        return Inertia::render('site/contacts', [
            'mapUrl' => Setting::get('contact_map_url'),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'subject' => ['nullable', 'string', 'max:200'],
            'body' => ['required', 'string', 'min:10', 'max:5000'],
            'website' => ['nullable', 'size:0'], // honeypot
        ]);

        $key = 'contact:'.$request->ip();

        if (RateLimiter::tooManyAttempts($key, 5)) {
            throw ValidationException::withMessages(['body' => __('site.contact_rate_limited')]);
        }

        RateLimiter::hit($key, 3600);

        $message = Message::query()->create([
            ...Arr::except($data, ['website']),
            'ip' => $request->ip(),
        ]);

        $recipients = array_filter(array_map('trim', explode(',', (string) Setting::get('contact_form_recipients', ''))));

        if ($recipients !== []) {
            Notification::route('mail', $recipients)->notify(new NewContactMessage($message));
        }

        return back()->with('success', __('site.contact_sent'));
    }
}

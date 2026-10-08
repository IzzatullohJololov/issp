<?php

namespace App\Http\Controllers\Site;

use App\Http\Controllers\Controller;
use App\Models\Vacancy;
use App\Support\Presenter;
use Inertia\Inertia;
use Inertia\Response;

class VacancyController extends Controller
{
    public function index(): Response
    {
        $items = Vacancy::query()->published()->with('laboratory')
            ->where(fn ($q) => $q->whereNull('deadline')->orWhereDate('deadline', '>=', now()))
            ->latest()->get();

        return Inertia::render('site/vacancies/index', [
            'items' => $items->map(fn (Vacancy $vacancy) => Presenter::vacancy($vacancy)),
        ]);
    }

    public function show(Vacancy $vacancy): Response
    {
        abort_unless($vacancy->is_published || auth()->check(), 404);

        $vacancy->load('laboratory');

        return Inertia::render('site/vacancies/show', [
            'item' => Presenter::vacancy($vacancy),
        ]);
    }
}

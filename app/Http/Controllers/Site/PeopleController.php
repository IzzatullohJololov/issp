<?php

namespace App\Http\Controllers\Site;

use App\Http\Controllers\Controller;
use App\Models\Laboratory;
use App\Models\Person;
use App\Support\Presenter;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PeopleController extends Controller
{
    public function index(Request $request): Response
    {
        $group = $request->input('group', 'all');
        $query = Person::query()->where('is_active', true)->with('laboratory')->orderBy('sort_order')->orderBy('full_name->ru');

        match ($group) {
            'management' => $query->where('is_management', true),
            'council' => $query->where('is_council_member', true),
            default => null,
        };

        if ($lab = $request->input('lab')) {
            $query->whereHas('laboratory', fn ($q) => $q->where('slug', $lab));
        }

        if ($search = trim((string) $request->input('q'))) {
            $query->where(fn ($q) => $q
                ->where('full_name->ru', 'like', "%{$search}%")
                ->orWhere('full_name->en', 'like', "%{$search}%")
                ->orWhere('position->ru', 'like', "%{$search}%"));
        }

        return Inertia::render('site/people/index', [
            'items' => $query->paginate(24)->withQueryString()->through(fn (Person $person) => Presenter::personCard($person)),
            'labs' => Laboratory::query()->where('is_active', true)->orderBy('sort_order')->get()
                ->map(fn (Laboratory $lab) => ['slug' => $lab->slug, 'name' => $lab->tr('name')]),
            'filters' => ['group' => $group, 'lab' => $lab, 'q' => $search ?: null],
        ]);
    }

    public function show(Person $person): Response
    {
        abort_unless($person->is_active || auth()->check(), 404);

        $person->load('laboratory');

        return Inertia::render('site/people/show', [
            'person' => Presenter::person($person),
        ]);
    }
}

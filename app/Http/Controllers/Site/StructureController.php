<?php

namespace App\Http\Controllers\Site;

use App\Http\Controllers\Controller;
use App\Models\Department;
use App\Models\Laboratory;
use App\Models\Person;
use App\Support\Presenter;
use Inertia\Inertia;
use Inertia\Response;

class StructureController extends Controller
{
    public function index(): Response
    {
        $departments = Department::query()->where('is_active', true)->with(['head', 'laboratories' => fn ($q) => $q->where('is_active', true)->with('head')])
            ->orderBy('sort_order')->get();

        $orphans = Laboratory::query()->where('is_active', true)->whereNull('department_id')->with('head')->orderBy('sort_order')->get();

        return Inertia::render('site/structure/index', [
            'management' => Person::query()->where('is_active', true)->where('is_management', true)->orderBy('sort_order')->get()
                ->map(fn (Person $person) => Presenter::personCard($person)),
            'departments' => $departments->map(fn (Department $department) => [
                'id' => $department->id,
                'slug' => $department->slug,
                'name' => $department->tr('name'),
                'description' => $department->tr('description'),
                'head' => $department->head ? Presenter::personCard($department->head) : null,
                'laboratories' => $department->laboratories->map(fn (Laboratory $lab) => Presenter::labCard($lab)),
            ]),
            'otherLabs' => $orphans->map(fn (Laboratory $lab) => Presenter::labCard($lab)),
        ]);
    }

    public function lab(Laboratory $laboratory): Response
    {
        abort_unless($laboratory->is_active || auth()->check(), 404);

        $laboratory->load(['head', 'department', 'people' => fn ($q) => $q->where('is_active', true)]);

        return Inertia::render('site/structure/lab', [
            'lab' => Presenter::lab($laboratory),
            'people' => $laboratory->people->map(fn (Person $person) => Presenter::personCard($person)),
            'publications' => $laboratory->publications()->limit(10)->get()->map(fn ($p) => Presenter::publication($p)),
            'events' => $laboratory->events()->published()->upcoming()->limit(3)->get()->map(fn ($e) => Presenter::eventCard($e)),
        ]);
    }
}

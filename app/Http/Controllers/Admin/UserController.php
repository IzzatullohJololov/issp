<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function index(Request $request): Response
    {
        $query = User::query()->latest();

        if ($search = trim((string) $request->input('search'))) {
            $query->where(fn ($q) => $q->where('name', 'like', "%{$search}%")->orWhere('email', 'like', "%{$search}%"));
        }

        return Inertia::render('admin/users/index', [
            'items' => $query->paginate(20)->withQueryString()->through(fn (User $user) => $this->transform($user)),
            'query' => ['search' => $search ?: ''],
            'roles' => User::ROLES,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/users/form', [
            'item' => null,
            'roles' => User::ROLES,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')],
            'password' => ['required', 'confirmed', Password::min(8)],
            'role' => ['required', Rule::in(array_keys(User::ROLES))],
            'position' => ['nullable', 'string', 'max:255'],
            'is_active' => ['boolean'],
        ]);

        $user = User::query()->create($data);
        ActivityLog::record('created', $user, description: 'Пользователь '.$user->email);

        return redirect('/admin/users')->with('success', 'Пользователь создан.');
    }

    public function edit(User $user): Response
    {
        return Inertia::render('admin/users/form', [
            'item' => $this->transform($user),
            'roles' => User::ROLES,
        ]);
    }

    public function update(Request $request, User $user): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'password' => ['nullable', 'confirmed', Password::min(8)],
            'role' => ['required', Rule::in(array_keys(User::ROLES))],
            'position' => ['nullable', 'string', 'max:255'],
            'is_active' => ['boolean'],
        ]);

        if ($user->is($request->user())) {
            $data['role'] = $user->role;
            $data['is_active'] = true;
        }

        if (empty($data['password'])) {
            unset($data['password']);
        }

        $user->update($data);
        ActivityLog::record('updated', $user, description: 'Пользователь '.$user->email);

        return redirect('/admin/users')->with('success', 'Пользователь обновлён.');
    }

    public function destroy(Request $request, User $user): RedirectResponse
    {
        if ($user->is($request->user())) {
            return back()->with('error', 'Нельзя удалить собственную учётную запись.');
        }

        ActivityLog::record('deleted', $user, description: 'Пользователь '.$user->email);
        $user->delete();

        return redirect('/admin/users')->with('success', 'Пользователь удалён.');
    }

    /**
     * @return array<string, mixed>
     */
    protected function transform(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
            'position' => $user->position,
            'is_active' => $user->is_active,
            'last_login_at' => $user->last_login_at?->toIso8601String(),
            'created_at' => $user->created_at?->toIso8601String(),
        ];
    }
}

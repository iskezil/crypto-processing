<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RoleController extends Controller
{
    public function __construct()
    {
        $this->middleware('permission:ROLES_VIEW')->only('index');
        $this->middleware('permission:ROLES_CREATE')->only('store');
        $this->middleware('permission:ROLES_EDIT')->only('update');
        $this->middleware('permission:ROLES_DELETE')->only('destroy');
    }

    public function index(): Response
    {
        $roles = Role::with('permissions:id,name')
            ->select('id', 'name', 'created_at')
            ->get()
            ->map(fn ($role) => [
                'id' => $role->id,
                'name' => $role->name,
                'created_at' => $role->created_at->toDateString(),
                'permissions' => $role->permissions->map(fn ($p) => [
                    'id' => $p->id,
                    'name' => $p->name,
                ]),
            ]);

        $permissions = Permission::select('id', 'name')
            ->get()
            ->map(fn ($p) => [
                'id' => $p->id,
                'name' => $p->name,
            ]);

        return Inertia::render('dashboard/roles/list', [
            'roles' => $roles,
            'permissions' => $permissions,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', Rule::unique('roles', 'name')],
        ]);

        Role::create(['name' => $validated['name']]);

        return back();
    }

    public function destroy(Role $role): RedirectResponse
    {
        $role->delete();
        return back();
    }

    public function update(Request $request, Role $role): RedirectResponse
    {
        $validated = $request->validate([
            'permissions' => ['sometimes', 'array'],
            'permissions.*' => ['integer', 'exists:permissions,id'],
        ]);

        $permissionNames = [];
        if (isset($validated['permissions'])) {
            $permissionNames = Permission::whereIn('id', $validated['permissions'])->pluck('name')->toArray();
        }

        $role->syncPermissions($permissionNames);

        return back();
    }
}

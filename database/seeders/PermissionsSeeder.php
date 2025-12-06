<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class PermissionsSeeder extends Seeder
{
    public function run(): void
    {
        app()['cache']->forget('spatie.permission.cache');

        $roles = [ 'ADMIN', 'MANAGER', 'USER'];

        foreach ($roles as $roleName) {
            Role::firstOrCreate(['name' => $roleName, 'guard_name' => 'web']);
        }

        $modules = ['USERS', 'ROLES','PERMISSIONS', 'PROJECTS', 'PROJECTS_MODERATION'];

        $actions = ['VIEW', 'CREATE', 'EDIT', 'DELETE'];

        $createdPermissions = [];

        foreach ($modules as $module) {
            foreach ($actions as $action) {
                $permissionName = $module . '_' . $action;
                $permission = Permission::firstOrCreate(
                    ['name' => $permissionName, 'guard_name' => 'web'],
                    ['module' => $module]
                );

                if (empty($permission->module)) {
                    $permission->module = $module;
                    $permission->save();
                }
                $createdPermissions[] = $permissionName;
            }
        }

        $admin = Role::where('name', 'ADMIN')->first();
        $manager = Role::where('name', 'MANAGER')->first();
        $user = Role::where('name', 'USER')->first();

        $createUser = User::factory()->create([
            'name' => 'Mrs Freemans',
            'email' => 'vinogradov.a.v@bk.ru',
            'password' => Hash::make('Exit-541124'),
        ]);
        $createUser->assignRole($admin);
        $admin?->givePermissionTo($createdPermissions);

        $managerPerms = [];
        foreach ($modules as $module) {
            foreach (['VIEW', 'EDIT'] as $action) {
                $managerPerms[] = $module . '_' . $action;
            }
        }

        if (!empty($managerPerms)) {
            $manager?->givePermissionTo($managerPerms);
        }

        $userPerms = [];
        foreach ($modules as $module) {
            $userPerms[] = $module . '_VIEW';
        }

        if (!empty($userPerms)) {
            $user?->givePermissionTo($userPerms);
        }
    }
}



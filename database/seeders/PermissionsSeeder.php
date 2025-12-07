<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class PermissionsSeeder extends Seeder
{
    public function run(): void
    {
        app()['cache']->forget('spatie.permission.cache');

        [$roles, $permissions, $modules] = $this->extractRightsFromTypescript();

        foreach ($roles as $roleName) {
            Role::firstOrCreate(['name' => $roleName, 'guard_name' => 'web']);
        }

        $createdPermissions = [];

        foreach ($permissions as $permissionName) {
            $module = Str::beforeLast($permissionName, '_');
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
        foreach ($modules as $module => $modulePermissions) {
            foreach ($modulePermissions as $permissionName) {
                if (Str::endsWith($permissionName, ['_VIEW', '_EDIT'])) {
                    $managerPerms[] = $permissionName;
                }
            }
        }

        if (!empty($managerPerms)) {
            $manager?->givePermissionTo($managerPerms);
        }

        $userPerms = [];
        foreach ($modules as $modulePermissions) {
            foreach ($modulePermissions as $permissionName) {
                if (Str::endsWith($permissionName, '_VIEW')) {
                    $userPerms[] = $permissionName;
                }
            }
        }

        if (!empty($userPerms)) {
            $user?->givePermissionTo($userPerms);
        }
    }

    private function extractRightsFromTypescript(): array
    {
        $rightsPath = resource_path('js/src/enums/rights.ts');
        $contents = file_get_contents($rightsPath);

        $enumExtractor = static function (string $enumName) use ($contents) {
            $pattern = sprintf('/export enum %s\s*\{([^}]*)\}/m', $enumName);
            if (!preg_match($pattern, $contents, $matches)) {
                return [];
            }

            return collect(explode("\n", $matches[1]))
                ->map(static fn ($line) => trim($line))
                ->filter()
                ->map(static fn ($line) => Str::before($line, ' '))
                ->map(static fn ($line) => trim($line, "\t ,"))
                ->filter()
                ->values()
                ->all();
        };

        $roles = $enumExtractor('ROLE_NAMES');
        $permissions = $enumExtractor('PERMISSION_NAMES');

        $modules = collect($permissions)
            ->groupBy(fn ($permission) => Str::beforeLast($permission, '_'))
            ->all();

        return [$roles, $permissions, $modules];
    }
}



<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Spatie\Permission\Models\Role;

class UserService
{
    /**
     * Update the user's attributes, roles and avatar.
     */
    public function update(User $user, array $data, ?UploadedFile $avatar = null): bool
    {
        if (isset($data['roles']) && auth()->id() === $user->id) {
            throw ValidationException::withMessages([
                'roles' => __('pages/users.self_role_error'),
            ]);
        }

        if ($avatar) {
            if ($user->avatar) {
                Storage::disk('public')->delete($user->avatar);
            }
            $user->avatar = $avatar->store('avatars', 'public');
        }

        foreach (['name', 'email', 'status', 'email_verified_at'] as $field) {
            if (array_key_exists($field, $data)) {
                $user->{$field} = $data[$field];
            }
        }

        if (isset($data['password'])) {
            $user->password = $data['password'];
        }

        if ($user->isDirty()) {
            $user->save();
        }

        if (isset($data['roles'])) {
            $roleNames = Role::whereIn('id', $data['roles'])->pluck('name')->toArray();
            $user->syncRoles($roleNames);
        }

        return true;
    }
}

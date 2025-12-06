<?php

namespace App\Http\Controllers;

use App\Http\Requests\UserStoreRequest;
use App\Http\Requests\UserUpdateRequest;
use App\Models\User;
use App\Services\UserService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    public function __construct(private UserService $userService)
    {
        $this->middleware('permission:USERS_VIEW')->only('index');
        $this->middleware('permission:USERS_CREATE')->only(['create', 'store']);
        $this->middleware('permission:USERS_EDIT')->only(['edit', 'update']);
        $this->middleware('permission:USERS_DELETE')->only('destroy');
    }

    public function index(): Response
    {
        $users = User::with('roles:id,name')
            ->select('id', 'name', 'email', 'status', 'created_at')
            ->get()
            ->map(fn($user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'status' => $user->status,
                'created_at' => $user->created_at->toDateTimeString(),
                'roles' => $user->roles->pluck('id')->toArray(),
            ]);

        $roles = Role::select('id', 'name')->get();

            return Inertia::render('dashboard/users/list', [
            'users' => $users,
            'roles' => $roles,
        ]);
    }

    public function create(): Response
    {
        $roles = Role::select('id', 'name')->get();

        return Inertia::render('dashboard/users/create', [
            'roles' => $roles,
        ]);
    }

    public function store(UserStoreRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        $avatarPath = $request->file('avatar')?->store('avatars', 'public')
            ?? config('app.default_avatar');

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => $validated['password'],
            'avatar' => $avatarPath,
            'status' => $validated['status'],
            'email_verified_at' => $validated['email_verified_at'] ?? null,
        ]);

        if (isset($validated['roles'])) {
            $roleNames = Role::whereIn('id', $validated['roles'])->pluck('name')->toArray();
            $user->syncRoles($roleNames);
        }

        return redirect()->route('users.index');
    }

    public function edit(User $user): Response
    {
        $user->load('roles:id,name');

        return Inertia::render('dashboard/users/edit', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'avatar' => $user->avatar
                    ? (Storage::disk('public')->exists($user->avatar)
                        ? asset(Storage::url($user->avatar))
                        : asset($user->avatar))
                    : null,
                'status' => $user->status,
                'roles' => $user->roles->pluck('id')->toArray(),
                'email_verified_at' => $user->email_verified_at,
            ],
            'roles' => Role::select('id', 'name')->get(),
        ]);
    }

    public function update(UserUpdateRequest $request, User $user): RedirectResponse
    {
        $validated = $request->validated();

        try {
            $this->userService->update($user, $validated, $request->file('avatar'));
        } catch (ValidationException $e) {
            return back()->withErrors($e->errors());
        }

        return back();
    }

    public function destroy(User $user): RedirectResponse
    {
        if (auth()->id() === $user->id) {
            return back()->withErrors([
                'user' => __('pages/users.self_delete_error'),
            ]);
        }
        
        $user->delete();
        return redirect()->route('users.index');
    }
}

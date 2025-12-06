<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use App\Models\Project;
use Inertia\Middleware;

class   HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): string|null
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {

      return array_merge(parent::share($request), [
        'auth' => [
          'user' => $request->user() ? [
            'name' => $request->user()->name,
            'email' => $request->user()->email,
            'avatar' => $request->user()->avatar,
            'roles' => $request->user()->getRoleNames(),
            'permissions' => $request->user()->getAllPermissions()->pluck('name'),
          ] : null,
        ],
        'locale' => fn () =>  App::currentLocale(),
        'projectsMenu' => function () use ($request) {
          if (!$request->user() || !$request->user()->can('PROJECTS_VIEW')) {
            return [];
          }

          return Project::query()
            ->where('user_id', $request->user()->id)
            ->where('is_archived', false)
            ->orderBy('name')
            ->get(['id', 'ulid', 'name', 'status']);
        },
        'csrf_token' => csrf_token(),
      ]);

//        return [
//            ...parent::share($request),
//            'auth' => [
//                'user' => $request->user(),
//            ],
//            'locale' => App::currentLocale(),
//        ];
    }
}

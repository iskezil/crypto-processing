<?php

namespace App\Http\Controllers\Project;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\ProjectModerationLog;
use App\Models\ProjectTokenNetwork;
use App\Models\TokenNetwork;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class ProjectUserController extends Controller
{
    public function __construct(){
      $this->middleware('permission:PROJECTS_VIEW')->only(['index', 'show']);
      $this->middleware('permission:PROJECTS_CREATE')->only(['create', 'store']);
      $this->middleware('permission:PROJECTS_EDIT')->only('update');
      $this->middleware('permission:PROJECTS_DELETE')->only('destroy');
    }

    public function index(): Response
    {
      $projects = Project::query()
        ->where('user_id', Auth::id())
        ->where('is_archived', false)
        ->latest()
        ->get([
          'id',
          'ulid',
          'name',
          'status',
          'platform',
          'created_at',
        ]);

      return Inertia::render('dashboard/projects/list', [
        'projects' => $projects,
      ]);
    }

    public function create(): Response
    {
      $tokenNetworks = TokenNetwork::query()
        ->with(['token:id,name,code,icon_path', 'network:id,name,code,icon_path'])
        ->where('active', true)
        ->orderBy('order')
        ->get([
          'id',
          'token_id',
          'network_id',
          'full_code',
          'stable_coin',
        ]);

      return Inertia::render('dashboard/projects/create', [
        'tokenNetworks' => $tokenNetworks,
      ]);
    }

    public function store(Request $request): RedirectResponse
    {
      $user = $request->user();

      $validated = $request->validate([
        'name' => ['required', 'string', 'max:255'],
        'activity_type' => ['required', 'string', 'max:255'],
        'description' => ['nullable', 'string'],
        'platform' => ['required', 'in:website,telegram_bot,vk_bot,other'],
        'project_url' => ['nullable', 'string', 'max:255'],
        'success_url' => ['nullable', 'string', 'max:255'],
        'fail_url' => ['nullable', 'string', 'max:255'],
        'notify_url' => ['nullable', 'string', 'max:255'],
        'logo' => ['nullable', 'string', 'max:255'],
        'test_mode' => ['boolean'],
        'token_network_ids' => ['required', 'array', 'min:1'],
        'token_network_ids.*' => ['integer', 'exists:token_networks,id'],
      ]);

      $project = Project::create([
        'user_id' => $user->id,
        'name' => $validated['name'],
        'activity_type' => $validated['activity_type'],
        'description' => Arr::get($validated, 'description'),
        'platform' => $validated['platform'],
        'project_url' => Arr::get($validated, 'project_url'),
        'success_url' => Arr::get($validated, 'success_url'),
        'fail_url' => Arr::get($validated, 'fail_url'),
        'notify_url' => Arr::get($validated, 'notify_url'),
        'logo' => Arr::get($validated, 'logo'),
        'test_mode' => Arr::get($validated, 'test_mode', false),
        'status' => 'pending',
        'is_archived' => false,
      ]);

      $tokenNetworkIds = $validated['token_network_ids'];
      foreach ($tokenNetworkIds as $index => $tokenNetworkId) {
        ProjectTokenNetwork::create([
          'project_id' => $project->id,
          'token_network_id' => $tokenNetworkId,
          'enabled' => true,
          'is_default' => $index === 0,
          'order' => $index,
        ]);
      }

      ProjectModerationLog::create([
        'project_id' => $project->id,
        'moderation_type' => 'general',
        'moderator_id' => $user->id,
        'status' => 'pending',
        'comment' => null,
      ]);

      return redirect()
        ->route('projects.show', $project)
        ->with('flash.banner', __('pages/projects.notifications.sent_to_moderation'));
    }

    public function show(Project $project): Response
    {
      $user = Auth::user();

      abort_unless(
        $user && ($project->user_id === $user->id || $user->can('PROJECTS_MODERATION_VIEW')),
        403
      );

      $project->load(['moderationLogs.moderator:id,name,email']);

      return Inertia::render('dashboard/projects/show', [
        'project' => $project,
      ]);
    }

    public function update(){
      return 'null';
    }

    public function destroy(){
      return 'null';
    }
}

<?php

namespace App\Http\Controllers\Project;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\ProjectApiKey;
use App\Models\ProjectModerationLog;
use App\Models\ProjectTokenNetwork;
use App\Models\TokenNetwork;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Laravel\Sanctum\PersonalAccessToken;
use Inertia\Inertia;
use Inertia\Response;

class ProjectUserController extends Controller
{
    public function __construct(){
      $this->middleware('permission:PROJECTS_VIEW')->only(['index', 'show']);
      $this->middleware('permission:PROJECTS_CREATE')->only(['create', 'store']);
      $this->middleware('permission:PROJECTS_EDIT')->only(['update', 'regenerateApiKey']);
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
        'description' => ['required', 'string'],
        'platform' => ['required', 'in:website,telegram_bot,vk_bot,other'],
        'project_url' => ['required', 'string', 'max:255'],
        'success_url' => ['nullable', 'string', 'max:255'],
        'fail_url' => ['nullable', 'string', 'max:255'],
        'notify_url' => ['nullable', 'string', 'max:255'],
        'logo' => ['nullable', 'string', 'max:255'],
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
        'status' => 'pending',
        'is_archived' => false,
      ]);

      $this->issueProjectApiKey($project, 'moderation');

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

      $project->load([
        'moderationLogs' => function ($query) {
          $query->orderBy('created_at')->with('moderator:id,name,email');
        },
        'tokenNetworks.token',
        'tokenNetworks.network',
        'apiKeys' => function ($query) {
          $query->orderByDesc('created_at');
        },
      ]);

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

      return Inertia::render('dashboard/projects/show', [
        'project' => $project,
        'tokenNetworks' => $tokenNetworks,
        'viewMode' => 'user',
      ]);
    }

  public function update(Request $request, Project $project): RedirectResponse
    {
      $user = $request->user();

      abort_unless(
        $user && ($project->user_id === $user->id || $user->can('PROJECTS_MODERATION_VIEW')),
        403
      );

      $validated = $request->validate([
        'name' => ['required', 'string', 'max:255'],
        'activity_type' => ['required', 'string', 'max:255'],
        'description' => ['required', 'string'],
        'platform' => ['required', 'in:website,telegram_bot,vk_bot,other'],
        'project_url' => ['required', 'string', 'max:255'],
        'success_url' => ['nullable', 'string', 'max:255'],
        'fail_url' => ['nullable', 'string', 'max:255'],
        'notify_url' => ['nullable', 'string', 'max:255'],
        'logo' => ['nullable', 'string', 'max:255'],
        'token_network_ids' => ['required', 'array', 'min:1'],
        'token_network_ids.*' => ['integer', 'exists:token_networks,id'],
      ]);

      DB::transaction(function () use ($project, $validated, $user) {
        $originalStatus = $project->status;

        $project->update([
          'name' => $validated['name'],
          'activity_type' => $validated['activity_type'],
          'description' => Arr::get($validated, 'description'),
          'platform' => $validated['platform'],
          'project_url' => Arr::get($validated, 'project_url'),
          'success_url' => Arr::get($validated, 'success_url'),
          'fail_url' => Arr::get($validated, 'fail_url'),
          'notify_url' => Arr::get($validated, 'notify_url'),
          'logo' => Arr::get($validated, 'logo'),
          'status' => $originalStatus === 'approved' ? 'pending' : $originalStatus,
        ]);

        $existingTokenNetworks = ProjectTokenNetwork::where('project_id', $project->id)
          ->get()
          ->keyBy('token_network_id');

        foreach ($validated['token_network_ids'] as $index => $tokenNetworkId) {
          $isDefault = $index === 0;

          if ($existingTokenNetworks->has($tokenNetworkId)) {
            $existingTokenNetworks[$tokenNetworkId]->update([
              'enabled' => true,
              'is_default' => $isDefault,
              'order' => $index,
            ]);

            $existingTokenNetworks->forget($tokenNetworkId);
            continue;
          }

          ProjectTokenNetwork::create([
            'project_id' => $project->id,
            'token_network_id' => $tokenNetworkId,
            'enabled' => true,
            'is_default' => $isDefault,
            'order' => $index,
          ]);
        }

        $existingTokenNetworks->each(function (ProjectTokenNetwork $projectTokenNetwork) {
          $projectTokenNetwork->update([
            'enabled' => false,
            'is_default' => false,
          ]);
        });

        if ($originalStatus === 'approved') {
          $project->apiKeys()
            ->where('status', '!=', 'revoked')
            ->update(['status' => 'moderation']);

          ProjectModerationLog::create([
            'project_id' => $project->id,
            'moderation_type' => 'general',
            'moderator_id' => $user->id,
            'status' => 'pending',
            'comment' => null,
          ]);
        }
      });

      return redirect()
        ->route('projects.show', $project)
        ->with('flash.banner', __('pages/projects.notifications.sent_to_moderation'));
    }

    public function destroy(){
      return 'null';
    }

    public function regenerateApiKey(Request $request, Project $project): RedirectResponse
    {
      $user = $request->user();
      $canModerate = $user?->can('PROJECTS_MODERATION_EDIT') || $user?->can('PROJECTS_REJECTED_EDIT') || $user?->can('PROJECTS_ACTIVE_EDIT');

      abort_unless(
        $user && ($project->user_id === $user->id || $canModerate),
        403
      );

      DB::transaction(function () use ($project) {
        $activeKey = $project->apiKeys()
          ->where('status', '!=', 'revoked')
          ->latest()
          ->first();

        if ($activeKey) {
          $this->revokeApiKey($activeKey);
        }

        $this->issueProjectApiKey($project, $this->resolveApiKeyStatus($project->status));
      });

      return redirect()
        ->back()
        ->with('flash.banner', __('pages/projects.notifications.api_keys_regenerated'));
    }

    public function generateSecret(Request $request, Project $project): JsonResponse
    {
      $user = $request->user();
      $canModerate = $user?->can('PROJECTS_MODERATION_EDIT') || $user?->can('PROJECTS_REJECTED_EDIT') || $user?->can('PROJECTS_ACTIVE_EDIT');

      abort_unless(
        $user && ($project->user_id === $user->id || $canModerate),
        403
      );

      $newKey = DB::transaction(function () use ($project) {
        $activeKey = $project->apiKeys()
          ->where('status', '!=', 'revoked')
          ->latest()
          ->first();

        if (!$activeKey) {
          return $this->issueProjectApiKey($project, $this->resolveApiKeyStatus($project->status));
        }

        $newKey = $project->apiKeys()->create([
          'plain_text_token' => $activeKey->getAttribute('plain_text_token'),
          'personal_access_token_id' => $activeKey->getAttribute('personal_access_token_id'),
          'secret' => Str::random(64),
          'status' => $activeKey->getAttribute('status'),
        ]);

        $activeKey->update([
          'status' => 'revoked',
          'revoked_at' => now(),
          'plain_text_token' => null,
          'personal_access_token_id' => null,
        ]);

        return $newKey;
      });

      $project->load([
        'apiKeys' => function ($query) {
          $query->orderByDesc('created_at');
        },
      ]);

      return response()->json([
        'secret' => $newKey->getAttribute('secret'),
        'api_key' => $newKey->plain_text_token,
        'api_keys' => $project->apiKeys,
      ]);
    }

    private function issueProjectApiKey(Project $project, string $status): ProjectApiKey
    {
      $token = $project->createToken('project-api-key');
      $plainTextToken = $token->plainTextToken;
      $tokenId = (int) explode('|', $plainTextToken)[0];

      return $project->apiKeys()->create([
        'plain_text_token' => $plainTextToken,
        'personal_access_token_id' => $tokenId,
        'secret' => Str::random(64),
        'status' => $status,
      ]);
    }

    private function resolveApiKeyStatus(string $projectStatus): string
    {
      return match ($projectStatus) {
        'approved' => 'active',
        'rejected' => 'rejected',
        default => 'moderation',
      };
    }

    private function revokeApiKey(ProjectApiKey $apiKey): void
    {
      if ($apiKey->personal_access_token_id) {
        PersonalAccessToken::where('id', $apiKey->personal_access_token_id)->delete();
      }

      $apiKey->update([
        'status' => 'revoked',
        'revoked_at' => now(),
      ]);
    }
}

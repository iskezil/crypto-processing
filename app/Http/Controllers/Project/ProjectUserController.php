<?php

namespace App\Http\Controllers\Project;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\ProjectApiKey;
use App\Models\ProjectModerationLog;
use App\Models\ProjectTokenNetwork;
use App\Models\TokenNetwork;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
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

      $logoRule = Rule::when(
        $request->hasFile('logo'),
        ['image', 'mimes:jpeg,png', 'max:2048', 'dimensions:ratio=3/1'],
        ['string', 'max:255']
      );

      $serviceFeeRules = ['nullable', 'numeric', 'min:0', 'max:10'];

      $validated = $request->validate([
        'name' => ['required', 'string', 'max:255'],
        'activity_type' => ['required', 'string', 'max:255'],
        'description' => ['required', 'string'],
        'platform' => ['required', 'in:website,telegram_bot,vk_bot,other'],
        'project_url' => ['required', 'string', 'max:255'],
        'success_url' => ['nullable', 'string', 'max:255'],
        'fail_url' => ['nullable', 'string', 'max:255'],
        'notify_url' => ['nullable', 'string', 'max:255'],
        'logo' => ['nullable', $logoRule],
        'side_commission' => ['required', 'in:client,merchant'],
        'side_commission_cc' => ['required', 'in:client,merchant'],
        'auto_confirm_partial_by_amount' => ['nullable', 'numeric'],
        'auto_confirm_partial_by_percent' => ['nullable', 'numeric'],
        'token_network_ids' => ['required', 'array', 'min:1'],
        'token_network_ids.*' => ['integer', 'exists:token_networks,id'],
        'service_fee' => $serviceFeeRules,
      ]);

      $logoPath = $this->storeLogo($request);

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
        'logo' => $logoPath,
        'side_commission' => Arr::get($validated, 'side_commission'),
        'side_commission_cc' => Arr::get($validated, 'side_commission_cc'),
        'auto_confirm_partial_by_amount' => filled($validated['auto_confirm_partial_by_amount'] ?? null)
          ? (float) $validated['auto_confirm_partial_by_amount']
          : null,
        'auto_confirm_partial_by_percent' => filled($validated['auto_confirm_partial_by_percent'] ?? null)
          ? (float) $validated['auto_confirm_partial_by_percent']
          : null,
        'service_fee' => $this->resolveServiceFee($request, null, $this->canModerate($user)),
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
      $isModerator = $user ? $this->canModerate($user) : false;

      abort_unless(
        $user && ($project->user_id === $user->id || $user->can('PROJECTS_MODERATION_VIEW')),
        403
      );

      $logoRule = Rule::when(
        $request->hasFile('logo'),
        ['image', 'mimes:jpeg,png', 'max:2048', 'dimensions:ratio=3/1'],
        ['string', 'max:255']
      );

      $serviceFeeRules = ['nullable', 'numeric', 'min:0', 'max:10'];

      if ($isModerator) {
        array_unshift($serviceFeeRules, 'required');
      }

      $validated = $request->validate([
        'name' => ['required', 'string', 'max:255'],
        'activity_type' => ['required', 'string', 'max:255'],
        'description' => ['required', 'string'],
        'platform' => ['required', 'in:website,telegram_bot,vk_bot,other'],
        'project_url' => ['required', 'string', 'max:255'],
        'success_url' => ['nullable', 'string', 'max:255'],
        'fail_url' => ['nullable', 'string', 'max:255'],
        'notify_url' => ['nullable', 'string', 'max:255'],
        'logo' => ['nullable', $logoRule],
        'side_commission' => ['required', 'in:client,merchant'],
        'side_commission_cc' => ['required', 'in:client,merchant'],
        'auto_confirm_partial_by_amount' => ['nullable', 'numeric'],
        'auto_confirm_partial_by_percent' => ['nullable', 'numeric'],
        'token_network_ids' => ['required', 'array', 'min:1'],
        'token_network_ids.*' => ['integer', 'exists:token_networks,id'],
        'service_fee' => $serviceFeeRules,
      ]);

      $logoPath = $this->storeLogo($request, $project->logo);

      $shouldSendToModeration = false;

      DB::transaction(function () use (
        &$shouldSendToModeration,
        $project,
        $validated,
        $user,
        $logoPath,
        $isModerator,
        $request
      ) {
        $originalStatus = $project->status;

        $projectData = [
          'name' => $validated['name'],
          'activity_type' => $validated['activity_type'],
          'description' => Arr::get($validated, 'description'),
          'platform' => $validated['platform'],
          'project_url' => Arr::get($validated, 'project_url'),
          'success_url' => Arr::get($validated, 'success_url'),
          'fail_url' => Arr::get($validated, 'fail_url'),
          'notify_url' => Arr::get($validated, 'notify_url'),
          'logo' => $logoPath,
          'side_commission' => Arr::get($validated, 'side_commission'),
          'side_commission_cc' => Arr::get($validated, 'side_commission_cc'),
          'auto_confirm_partial_by_amount' => filled($validated['auto_confirm_partial_by_amount'] ?? null)
            ? (float) $validated['auto_confirm_partial_by_amount']
            : null,
          'auto_confirm_partial_by_percent' => filled($validated['auto_confirm_partial_by_percent'] ?? null)
            ? (float) $validated['auto_confirm_partial_by_percent']
            : null,
          'service_fee' => $this->resolveServiceFee($request, $project->service_fee, $isModerator),
        ];

        $shouldSendToModeration =
          $project->user_id === $user->id &&
          $originalStatus === 'approved' &&
          $this->hasNonTokenChanges($project, $projectData);

        $projectData['status'] = $shouldSendToModeration ? 'pending' : $originalStatus;

        $project->update($projectData);

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

        if ($shouldSendToModeration) {
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

      $redirectRoute = $request->string('context')->toString() === 'admin'
        ? route('projects_admin.show', [$this->resolveStatusSlug($project->status), $project->ulid])
        : route('projects.show', $project);

      $flashMessage = $shouldSendToModeration
        ? __('pages/projects.notifications.sent_to_moderation')
        : __('pages/projects.notifications.saved');

      return redirect()
        ->to($redirectRoute)
        ->with('flash.banner', $flashMessage);
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

    private function storeLogo(Request $request, ?string $existingPath = null): ?string
    {
      if (!$request->hasFile('logo')) {
        return $existingPath;
      }

      $path = $request->file('logo')->store('projects/logos', 'public');

      return Storage::disk('public')->url($path);
    }

    private function resolveServiceFee(Request $request, ?float $currentFee, bool $isModerator): ?float
    {
      $serviceFee = $request->input('service_fee');

      if ($serviceFee === null || $serviceFee === '') {
        return $currentFee ?? ($isModerator ? 1.5 : $currentFee);
      }

      return (float) $serviceFee;
    }

    private function hasNonTokenChanges(Project $project, array $payload): bool
    {
      $fields = [
        'name',
        'activity_type',
        'description',
        'platform',
        'project_url',
        'success_url',
        'fail_url',
        'notify_url',
        'logo',
        'side_commission',
        'side_commission_cc',
        'auto_confirm_partial_by_amount',
        'auto_confirm_partial_by_percent',
        'service_fee',
      ];

      foreach ($fields as $field) {
        if ($project->getAttribute($field) != Arr::get($payload, $field)) {
          return true;
        }
      }

      return false;
    }

    private function canModerate(User $user): bool
    {
      return $user->can('PROJECTS_MODERATION_EDIT') ||
        $user->can('PROJECTS_REJECTED_EDIT') ||
        $user->can('PROJECTS_ACTIVE_EDIT');
    }

    private function resolveStatusSlug(string $projectStatus): string
    {
      return match ($projectStatus) {
        'approved' => 'active',
        'rejected' => 'rejected',
        default => 'moderation',
      };
    }
}

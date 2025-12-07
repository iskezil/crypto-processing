<?php

namespace App\Http\Controllers\Project;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\ProjectModerationLog;
use App\Models\TokenNetwork;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ProjectAdminController extends Controller
{

    public function __construct(){
      $this->middleware('permission:PROJECTS_MODERATION_VIEW')->only('index');
      $this->middleware('permission:PROJECTS_REJECTED_VIEW')->only('rejected');
      $this->middleware('permission:PROJECTS_ACTIVE_VIEW')->only('active');
      $this->middleware('permission:PROJECTS_MODERATION_EDIT|PROJECTS_REJECTED_EDIT|PROJECTS_ACTIVE_EDIT')->only('moderate');
    }

    public function index(): Response
    {
      $projects = $this->getProjectsByStatus('pending');

      return Inertia::render('dashboard/projects/moderation', [
        'projects' => $projects,
        'status' => 'pending',
      ]);
    }

    public function rejected(): Response
    {
      $projects = $this->getProjectsByStatus('rejected');

      return Inertia::render('dashboard/projects/moderation', [
        'projects' => $projects,
        'status' => 'rejected',
      ]);
    }

    public function active(): Response
    {
      $projects = $this->getProjectsByStatus('approved');

      return Inertia::render('dashboard/projects/moderation', [
        'projects' => $projects,
        'status' => 'approved',
      ]);
    }

    public function moderate(Request $request, Project $project): RedirectResponse
    {
      $validated = $request->validate([
        'action' => ['required', 'in:approve,reject,to_pending'],
        'comment' => ['nullable', 'string', 'max:1000'],
        'service_fee' => [
          Rule::requiredIf(fn () => $request->input('action') === 'approve'),
          'numeric',
          'between:0,10',
        ],
      ]);

      $this->authorizeEditByStatus($project);

      DB::transaction(function () use ($project, $validated, $request) {
        $action = Arr::get($validated, 'action');
        $comment = Arr::get($validated, 'comment');
        $serviceFee = Arr::get($validated, 'service_fee');
        $status = match ($action) {
          'approve' => 'approved',
          'reject' => 'rejected',
          default => 'pending',
        };

        $project->update([
          'status' => $status,
          'service_fee' => $serviceFee === null || $serviceFee === ''
            ? $project->service_fee
            : (float) $serviceFee,
        ]);

        $project->apiKeys()
          ->where('status', '!=', 'revoked')
          ->update([
            'status' => $this->resolveApiKeyStatus($status),
          ]);

        ProjectModerationLog::create([
          'project_id' => $project->id,
          'moderation_type' => 'general',
          'moderator_id' => $request->user()->id,
          'status' => $status,
          'comment' => $comment,
        ]);
      });

      return redirect()->route('projects_admin.show', [$this->resolveStatusSlug($project->status), $project->ulid]);
    }

    public function show(string $status, Project $project): Response
    {
      $expectedStatus = $this->resolveStatusSlug($project->status);

      if ($status !== $expectedStatus) {
        return redirect()->route('projects_admin.show', [$expectedStatus, $project->ulid]);
      }

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

      $this->authorizeViewByStatus($project);

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

      return Inertia::render('dashboard/projects/moderation/show', [
        'project' => $project,
        'tokenNetworks' => $tokenNetworks,
        'viewMode' => 'admin',
      ]);
    }

    private function getProjectsByStatus(string $status)
    {
      return Project::query()
        ->with('user:id,email')
        ->where('status', $status)
        ->latest()
        ->get(['id', 'ulid', 'name', 'status', 'platform', 'user_id', 'created_at']);
    }

    private function authorizeViewByStatus(Project $project): void
    {
      $permission = match ($project->status) {
        'pending' => 'PROJECTS_MODERATION_VIEW',
        'rejected' => 'PROJECTS_REJECTED_VIEW',
        default => 'PROJECTS_ACTIVE_VIEW',
      };

      Gate::authorize($permission);
    }

    private function authorizeEditByStatus(Project $project): void
    {
      $permission = match ($project->status) {
        'pending' => 'PROJECTS_MODERATION_EDIT',
        'rejected' => 'PROJECTS_REJECTED_EDIT',
        default => 'PROJECTS_ACTIVE_EDIT',
      };

      Gate::authorize($permission);
    }

    private function resolveApiKeyStatus(string $projectStatus): string
    {
      return match ($projectStatus) {
        'approved' => 'active',
        'rejected' => 'rejected',
        default => 'moderation',
      };
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

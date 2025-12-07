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
      ]);

      DB::transaction(function () use ($project, $validated, $request) {
        $action = Arr::get($validated, 'action');
        $comment = Arr::get($validated, 'comment');
        $status = match ($action) {
          'approve' => 'approved',
          'reject' => 'rejected',
          default => 'pending',
        };

        $project->update(['status' => $status]);

        ProjectModerationLog::create([
          'project_id' => $project->id,
          'moderation_type' => 'general',
          'moderator_id' => $request->user()->id,
          'status' => $status,
          'comment' => $comment,
        ]);
      });

      return redirect()->back();
    }

    public function show(Project $project): Response
    {
      $project->load([
        'moderationLogs.moderator:id,name,email',
        'tokenNetworks.token',
        'tokenNetworks.network',
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

      return Inertia::render('dashboard/projects/moderation/show', [
        'project' => $project,
        'tokenNetworks' => $tokenNetworks,
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
}

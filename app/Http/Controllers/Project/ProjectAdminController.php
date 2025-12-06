<?php

namespace App\Http\Controllers\Project;

use App\Http\Controllers\Controller;
use App\Models\Project;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProjectAdminController extends Controller
{

    public function __construct(){
      $this->middleware('permission:PROJECTS_MODERATION_VIEW')->only('index');
      $this->middleware('permission:PROJECTS_MODERATION_EDIT')->only('store');
      $this->middleware('permission:PROJECTS_MODERATION_EDIT')->only('update');
      $this->middleware('permission:PROJECTS_MODERATION_DELETE')->only('destroy');
    }

    public function index(): Response
    {
      $projects = Project::query()
        ->with('user:id,email')
        ->where('status', 'pending')
        ->latest()
        ->get(['id', 'ulid', 'name', 'status', 'platform', 'user_id', 'created_at']);

      return Inertia::render('dashboard/projects/moderation', [
        'projects' => $projects,
      ]);
    }

    public function store(){
      return 'null';
    }

    public function update(){
      return 'null';
    }

    public function destroy(){
      return 'null';
    }
}

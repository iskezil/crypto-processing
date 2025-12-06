<?php

namespace App\Http\Controllers\Project;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class ProjectUserController extends Controller
{
    public function __construct(){
      $this->middleware('permission:PROJECTS_MODERATION_VIEW')->only('index');
      $this->middleware('permission:PROJECTS_MODERATION_CREATE')->only('store');
      $this->middleware('permission:PROJECTS_MODERATION_EDIT')->only('update');
      $this->middleware('permission:PROJECTS_MODERATION_DELETE')->only('destroy');
    }

    public function index(){
      return 'null';
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

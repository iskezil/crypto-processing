<?php

use App\Http\Controllers\Core\LocalisationsController;
use App\Http\Controllers\PermissionController;
use App\Http\Controllers\Project\ProjectAdminController;
use App\Http\Controllers\Project\ProjectUserController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\Invoice\InvoiceController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::patch('/locale', [LocalisationsController::class, 'update'])->name('locale.update');

Route::middleware('auth')->group(function () {
  Route::get('/', function () {
    return Inertia::render('index');
  })->name('home');

  Route::get('/dashboard', function () {
    return Inertia::render('dashboard/home');
  })
    ->name('dashboard')
    ->middleware('sync.lang:auth,navbar,navigation,pages/home,pages/projects');

  Route::get('/users', [UserController::class, 'index'])
    ->middleware(['permission:USERS_VIEW', 'sync.lang:auth,navbar,navigation,validation,pages/users'])
    ->name('users.index');
  Route::get('/users/create', [UserController::class, 'create'])
    ->middleware(['permission:USERS_CREATE', 'sync.lang:auth,navbar,navigation,validation,pages/users'])
    ->name('users.create');
  Route::post('/users', [UserController::class, 'store'])
    ->middleware('permission:USERS_CREATE')
    ->name('users.store');
  Route::get('/users/{user}/edit', [UserController::class, 'edit'])
    ->middleware(['permission:USERS_EDIT', 'sync.lang:auth,navbar,navigation,validation,pages/users'])
    ->name('users.edit');
  Route::get('/users/{user}/edit/change-password', [UserController::class, 'edit'])
    ->middleware(['permission:USERS_EDIT', 'sync.lang:auth,navbar,navigation,validation,pages/users'])
    ->name('users.edit.password');
  Route::patch('/users/{user}', [UserController::class, 'update'])
    ->middleware('permission:USERS_EDIT')
    ->name('users.update');
  Route::delete('/users/{user}', [UserController::class, 'destroy'])
    ->middleware('permission:USERS_DELETE')
    ->name('users.destroy');

  Route::get('/roles', [RoleController::class, 'index'])
    ->middleware(['permission:ROLES_VIEW', 'sync.lang:auth,navbar,navigation,pages/roles,pages/permissions'])
    ->name('roles.index');
  Route::post('/roles', [RoleController::class, 'store'])
    ->middleware('permission:ROLES_CREATE')
    ->name('roles.store');
  Route::patch('/roles/{role}', [RoleController::class, 'update'])
    ->middleware('permission:ROLES_EDIT')
    ->name('roles.update');
  Route::delete('/roles/{role}', [RoleController::class, 'destroy'])
    ->middleware('permission:ROLES_DELETE')
    ->name('roles.destroy');

  Route::get('/permissions', [PermissionController::class, 'index'])
    ->middleware(['permission:PERMISSIONS_VIEW', 'sync.lang:auth,navbar,navigation,pages/permissions,pages/roles'])
    ->name('permissions.index');
  Route::post('/permissions', [PermissionController::class, 'store'])
    ->middleware('permission:PERMISSIONS_CREATE')
    ->name('permissions.store');
  Route::patch('/permissions/{permission}', [PermissionController::class, 'update'])
    ->middleware('permission:PERMISSIONS_EDIT')
    ->name('permissions.update');
  Route::delete('/permissions/{permission}', [PermissionController::class, 'destroy'])
    ->middleware('permission:PERMISSIONS_DELETE')
    ->name('permissions.destroy');

  Route::get('/projects', [ProjectUserController::class, 'index'])
    ->middleware(['permission:PROJECTS_VIEW', 'sync.lang:auth,navbar,navigation,pages/projects'])
    ->name('projects.index');

  Route::get('/projects/create', [ProjectUserController::class, 'create'])
    ->middleware(['permission:PROJECTS_CREATE', 'sync.lang:auth,navbar,navigation,pages/projects'])
    ->name('projects.create');

  Route::post('/projects', [ProjectUserController::class, 'store'])
    ->middleware('permission:PROJECTS_CREATE')
    ->name('projects.store');

  Route::patch('/projects/{project:ulid}', [ProjectUserController::class, 'update'])
    ->middleware(['permission:PROJECTS_EDIT', 'sync.lang:auth,navbar,navigation,pages/projects'])
    ->name('projects.update');

  Route::get('/projects/{project:ulid}', [ProjectUserController::class, 'show'])
    ->middleware(['permission:PROJECTS_VIEW', 'sync.lang:auth,navbar,navigation,pages/projects'])
    ->name('projects.show');

  Route::post('/projects/{project:ulid}/api-keys/regenerate', [ProjectUserController::class, 'regenerateApiKey'])
    ->middleware(['permission:PROJECTS_EDIT|PROJECTS_MODERATION_EDIT|PROJECTS_REJECTED_EDIT|PROJECTS_ACTIVE_EDIT', 'sync.lang:auth,navbar,navigation,pages/projects'])
    ->name('projects.api_keys.regenerate');

  Route::post('/projects/{project:ulid}/api-keys/secret', [ProjectUserController::class, 'generateSecret'])
    ->middleware(['permission:PROJECTS_EDIT|PROJECTS_MODERATION_EDIT|PROJECTS_REJECTED_EDIT|PROJECTS_ACTIVE_EDIT', 'sync.lang:auth,navbar,navigation,pages/projects'])
    ->name('projects.api_keys.secret');

  Route::get('/payments', [InvoiceController::class, 'index'])
    ->middleware(['permission:PAYMENTS_VIEW', 'sync.lang:auth,navbar,navigation,pages/payments'])
    ->name('payments.index');
  Route::get('/payments/export', [InvoiceController::class, 'export'])
    ->middleware('permission:PAYMENTS_VIEW')
    ->name('payments.export');
  Route::post('/payments/{invoice}/cancel', [InvoiceController::class, 'cancel'])
    ->middleware(['permission:PAYMENTS_VIEW|PAYMENTS_ADMIN_VIEW'])
    ->name('payments.cancel');

  Route::get('/admin/payments', [InvoiceController::class, 'adminIndex'])
    ->middleware(['permission:PAYMENTS_ADMIN_VIEW', 'sync.lang:auth,navbar,navigation,pages/payments'])
    ->name('payments.admin');
  Route::get('/admin/payments/export', [InvoiceController::class, 'adminExport'])
    ->middleware('permission:PAYMENTS_ADMIN_VIEW')
    ->name('payments.admin.export');

  Route::get('/admin/projects/moderation', [ProjectAdminController::class, 'index'])
    ->middleware(['permission:PROJECTS_MODERATION_VIEW', 'sync.lang:auth,navbar,navigation,pages/projects'])
    ->name('projects_moderation.index');

  Route::get('/admin/projects/rejected', [ProjectAdminController::class, 'rejected'])
    ->middleware(['permission:PROJECTS_REJECTED_VIEW', 'sync.lang:auth,navbar,navigation,pages/projects'])
    ->name('projects_rejected.index');

  Route::get('/admin/projects/active', [ProjectAdminController::class, 'active'])
    ->middleware(['permission:PROJECTS_ACTIVE_VIEW', 'sync.lang:auth,navbar,navigation,pages/projects'])
    ->name('projects_active.index');

  Route::get('/admin/projects/{status}/{project:ulid}', [ProjectAdminController::class, 'show'])
    ->whereIn('status', ['moderation', 'rejected', 'active'])
    ->middleware(['permission:PROJECTS_MODERATION_VIEW|PROJECTS_REJECTED_VIEW|PROJECTS_ACTIVE_VIEW', 'sync.lang:auth,navbar,navigation,pages/projects'])
    ->name('projects_admin.show');

  Route::post('/admin/projects/{project:ulid}/moderate', [ProjectAdminController::class, 'moderate'])
    ->middleware(['permission:PROJECTS_MODERATION_EDIT|PROJECTS_REJECTED_EDIT|PROJECTS_ACTIVE_EDIT'])
    ->name('projects.moderate');
});



require __DIR__.'/auth.php';

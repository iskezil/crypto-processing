<?php

namespace App\Http\Controllers\Core;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Inertia\Inertia;

class LocalisationsController extends Controller
{
  public function update(Request $request){
    session()->put('locale', $request->get('language'));
    App::setLocale($request->get('language'));
    Inertia::share('locale', App::currentLocale());
    return redirect()->back()->with('toastr', [
      'type' => 'success',
      'title' => __('navbar.alerts.language.success.title'),
      'messages' => __('navbar.alerts.language.success.message'),
      'props' => [
        'isClose' => true,
      ]
    ]);
  }
}

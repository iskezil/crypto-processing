<?php

use App\Http\Controllers\Api\V1\InvoiceController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::prefix('v1')
    ->middleware(['validate.api.token', 'auth:sanctum'])
    ->group(function () {
        Route::prefix('invoice/merchant')->group(function () {
            Route::post('create', [InvoiceController::class, 'store']);
            Route::post('canceled', [InvoiceController::class, 'cancel']);
            Route::post('list', [InvoiceController::class, 'list']);
            Route::post('info', [InvoiceController::class, 'info']);
        });
    });

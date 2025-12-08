<?php

namespace App\Exceptions;

use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Illuminate\Http\Request;
use Illuminate\Session\TokenMismatchException;
use Inertia\Inertia;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;
use Throwable;

class Handler extends ExceptionHandler
{
    /**
     * The list of the inputs that are never flashed to the session on validation exceptions.
     *
     * @var array<int, string>
     */
    protected $dontFlash = [
        'current_password',
        'password',
        'password_confirmation',
    ];

    /**
     * Register the exception handling callbacks for the application.
     */
    public function register(): void
    {
        $this->reportable(function (Throwable $e) {
            //
        });
    }

    public function render($request, Throwable $e)
    {
        // В режиме отладки и для JSON-запросов используем стандартный вывод Laravel
        if ($request->expectsJson() || $request->wantsJson() || config('app.debug')) {
            return parent::render($request, $e);
        }

        $this->syncErrorTranslations();

        // 419 (CSRF/session) как отдельный кейс
        if ($e instanceof TokenMismatchException) {
            return Inertia::render('errors/419')
                ->toResponse($request)
                ->setStatusCode(419);
        }

        // HTTP-исключения: 403, 404 и т.п.
        if ($e instanceof HttpExceptionInterface) {
            $status = $e->getStatusCode();

            $pageMap = [
                403 => 'errors/403',
                404 => 'errors/404',
                419 => 'errors/419',
                500 => 'errors/500',
            ];

            if (isset($pageMap[$status])) {
                return $this->renderErrorPage($request, $pageMap[$status], $status);
            }

            return parent::render($request, $e);
        }

        // Любая иная непойманная ошибка -> 500 как HTML
        return $this->renderErrorPage($request, 'errors/500', 500);
    }

    private function syncErrorTranslations(): void
    {
        if (function_exists('syncLangFiles')) {
            syncLangFiles(['errors']);
        }
    }

    private function renderErrorPage(Request $request, string $page, int $statusCode)
    {
        return Inertia::render($page)
            ->toResponse($request)
            ->setStatusCode($statusCode);
    }
}

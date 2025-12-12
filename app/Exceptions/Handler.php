<?php

namespace App\Exceptions;

use Illuminate\Auth\AuthenticationException;
use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Http\Request;
use Illuminate\Session\TokenMismatchException;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;
use Symfony\Component\HttpKernel\Exception\UnauthorizedHttpException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
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
        if ($request->is('api/*')) {
            return $this->renderApiException($request, $e);
        }

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

    private function renderApiException($request, Throwable $e)
    {
        if ($e instanceof HttpResponseException) {
            return $e->getResponse();
        }

        if ($e instanceof AuthenticationException || $e instanceof UnauthorizedHttpException) {
            return $this->apiErrorResponse('Unauthenticated', Response::HTTP_UNAUTHORIZED);
        }

        if ($e instanceof ValidationException) {
            $first = collect($e->errors())->flatten()->first() ?: 'Validation error';

            return $this->apiErrorResponse($first, Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        if ($e instanceof ModelNotFoundException) {
            return $this->apiErrorResponse('Not found', Response::HTTP_NOT_FOUND);
        }

        if ($e instanceof HttpExceptionInterface) {
            $message = $e->getMessage() ?: Response::$statusTexts[$e->getStatusCode()] ?? 'Http error';

            return $this->apiErrorResponse($message, $e->getStatusCode());
        }

        return $this->apiErrorResponse('Server error', Response::HTTP_INTERNAL_SERVER_ERROR);
    }

    private function apiErrorResponse(string $message, int $status)
    {
        return response()->json([
            'status' => 'error',
            'result' => [
                'validate_error' => $message,
            ],
        ], $status);
    }
}

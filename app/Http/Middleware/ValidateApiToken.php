<?php

namespace App\Http\Middleware;

use App\Models\Project;
use App\Models\ProjectApiKey;
use Closure;
use Illuminate\Http\Request;
use Laravel\Sanctum\PersonalAccessToken;

class ValidateApiToken
{
    public function handle(Request $request, Closure $next)
    {
        if ($request->is('api/*')) {
            $request->headers->set('Accept', 'application/json');
        }

        $tokenString = $this->resolveTokenFromRequest($request);

        if (! $tokenString) {
            return $this->unauthorizedResponse();
        }

        $accessToken = PersonalAccessToken::findToken($tokenString);

        if (! $accessToken || ($accessToken->expires_at && $accessToken->expires_at->isPast())) {
            return $this->unauthorizedResponse();
        }

        $tokenable = $accessToken->tokenable;

        if (! $tokenable) {
            return $this->unauthorizedResponse();
        }

        if ($tokenable instanceof Project) {
            $apiKey = ProjectApiKey::query()
                ->where('personal_access_token_id', $accessToken->id)
                ->first();

            if (! $apiKey || $apiKey->status === 'revoked' || $apiKey->revoked_at) {
                return $this->unauthorizedResponse();
            }

            if (! $tokenable->user) {
                return $this->unauthorizedResponse();
            }

            $request->attributes->set('authenticated_user', $tokenable->user);
        } else {
            $request->attributes->set('authenticated_user', $tokenable);
        }

        $request->attributes->set('access_token', $accessToken);

        return $next($request);
    }

    private function resolveTokenFromRequest(Request $request): ?string
    {
        $authorization = $request->header('Authorization');

        if ($authorization && str_starts_with($authorization, 'Token ')) {
            $token = substr($authorization, 6);
            $request->headers->set('Authorization', 'Bearer '.$token);

            return $token;
        }

        return $request->bearerToken();
    }

    private function unauthorizedResponse()
    {
        return response()->json([
            'status' => 'error',
            'result' => [
                'validate_error' => 'Unauthenticated',
            ],
        ], 401);
    }
}

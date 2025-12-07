<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProjectApiKey extends Model
{
    use HasFactory;

    protected $table = 'project_api_keys';

    protected $fillable = [
      'project_id',
      'plain_text_token',
      'personal_access_token_id',
      'secret',
      'last_used_at',
      'status',
      'revoked_at',
    ];

    protected $casts = [
      'last_used_at' => 'datetime',
      'revoked_at'   => 'datetime',
    ];

    protected $hidden = [
      'secret',
      'personal_access_token_id',
    ];

    public function project(): BelongsTo
    {
      return $this->belongsTo(Project::class);
    }

    public function accessToken(): BelongsTo
    {
      return $this->belongsTo(\Laravel\Sanctum\PersonalAccessToken::class, 'personal_access_token_id');
    }

}

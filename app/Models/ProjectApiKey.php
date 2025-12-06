<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProjectApiKey extends Model
{
    use HasFactory;

    protected $table = 'project_api_keys';

    protected $fillable = [
      'project_id',
      'api_key',
      'secret',
      'last_used_at',
      'status',
      'revoked_at',
    ];

    protected $casts = [
      'last_used_at' => 'datetime',
      'revoked_at'   => 'datetime',
    ];

    public function project()
    {
      return $this->belongsTo(Project::class);
    }

}

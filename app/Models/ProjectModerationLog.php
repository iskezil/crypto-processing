<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProjectModerationLog extends Model
{
    use HasFactory;

    protected $table = 'project_moderation_logs';

    public $timestamps = true;

    protected $fillable = [
      'project_id',
      'moderator_id',
      'moderation_type',
      'status',
      'comment',
    ];

    protected $casts = [
      'created_at' => 'datetime',
      'updated_at' => 'datetime',
    ];

    public function project()
    {
      return $this->belongsTo(Project::class);
    }

    public function moderator()
    {
      return $this->belongsTo(User::class, 'moderator_id');
    }
}

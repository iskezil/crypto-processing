<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProjectTokenNetwork extends Model
{
    use HasFactory;

    protected $fillable = [
      'project_id',
      'token_network_id',
      'enabled',
      'is_default',
      'order',
    ];

    protected $casts = [
      'enabled'    => 'boolean',
      'is_default' => 'boolean',
      'order'      => 'integer',
    ];

    public $timestamps = true;

    public function project()
    {
      return $this->belongsTo(Project::class);
    }

    public function tokenNetwork()
    {
      return $this->belongsTo(TokenNetwork::class);
    }

}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

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

    public function project(): BelongsTo
    {
      return $this->belongsTo(Project::class);
    }

    public function tokenNetwork(): BelongsTo
    {
      return $this->belongsTo(TokenNetwork::class);
    }

    public function token(): BelongsTo
    {
      return $this->belongsTo(Token::class);
    }

    public function network(): BelongsTo
    {
      return $this->belongsTo(Network::class);
    }

}

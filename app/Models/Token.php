<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Token extends Model
{
    use HasFactory;

    protected $table = 'tokens';

    protected $fillable = [
      'code',
      'name',
      'decimals',
      'icon_path',
      'is_archived',
    ];

    protected $casts = [
      'decimals'    => 'integer',
      'is_archived' => 'boolean',
    ];

    protected $appends = [
      'icon_url',
    ];

    public function getIconUrlAttribute(): ?string
    {
      if (! $this->icon_path) {
        return null;
      }
      return asset($this->icon_path);
    }

    public function tokenNetworks()
    {
      return $this->hasMany(TokenNetwork::class);
    }
}

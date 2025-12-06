<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Network extends Model
{
    use HasFactory;

    protected $table = 'networks';

    protected $fillable = [
      'code',
      'name',
      'rpc_url',
      'explorer_tx_url',
      'explorer_addr_url',
      'native_token',
      'active',
      'is_public',
    ];

    protected $casts = [
      'active'    => 'boolean',
      'is_public' => 'boolean',
    ];

    public function tokenNetworks()
    {
      return $this->hasMany(TokenNetwork::class);
    }
}

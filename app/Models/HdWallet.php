<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HdWallet extends Model
{
    use HasFactory;

    use HasFactory;

    protected $table = 'hd_wallets';

    protected $fillable = [
      'project_id',
      'token_network_id',
      'address',
      'derivation_path',
      'type',
      'status',
      'last_checked_at',
    ];

    protected $casts = [
      'last_checked_at' => 'datetime',
    ];

    public function project()
    {
      return $this->belongsTo(Project::class);
    }

    public function tokenNetwork()
    {
      return $this->belongsTo(TokenNetwork::class);
    }

    public function depositEvents()
    {
      return $this->hasMany(DepositEvent::class);
    }
}

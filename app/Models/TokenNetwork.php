<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TokenNetwork extends Model
{
    use HasFactory;

    protected $table = 'token_networks';

    protected $fillable = [
      'token_id',
      'network_id',
      'contract_address',
      'stable_coin',
      'full_code',
      'explorer_tx_url',
      'explorer_addr_url',
      'active',
      'order',
      'hot_wallet_address',
      'encrypted_hot_wallet_key',
      'min_deposit_amount',
      'max_deposit_amount',
      'sweep_fee_percent',
      'notes',
    ];

    protected $casts = [
      'stable_coin'         => 'boolean',
      'active'             => 'boolean',
      'order'              => 'integer',
      'min_deposit_amount' => 'decimal:8',
      'max_deposit_amount' => 'decimal:8',
      'sweep_fee_percent'  => 'decimal:2',
    ];

    public function token(): BelongsTo
    {
      return $this->belongsTo(Token::class);
    }

    public function network(): BelongsTo
    {
      return $this->belongsTo(Network::class);
    }

    public function projects(): BelongsToMany
    {
      return $this->belongsToMany(Project::class, 'project_token_networks')
        ->using(ProjectTokenNetwork::class)
        ->withPivot(['enabled', 'is_default', 'order', 'created_at', 'updated_at']);
    }

    public function invoices(): HasMany
    {
      return $this->hasMany(Invoice::class);
    }

    public function hdWallets(): HasMany
    {
      return $this->hasMany(HdWallet::class);
    }

    public function depositEvents(): HasMany
    {
      return $this->hasMany(DepositEvent::class);
    }
}

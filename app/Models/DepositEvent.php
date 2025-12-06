<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DepositEvent extends Model
{
    use HasFactory;


    protected $table = 'deposit_events';

    protected $fillable = [
      'project_id',
      'invoice_id',
      'hd_wallet_id',
      'token_network_id',
      'tx_hash',
      'from_address',
      'to_address',
      'value',
      'status',
      'confirmations',
      'block_number',
      'log_index',
      'network_fee',
      'event_type',
      'processed',
      'listener_version',
      'raw_event',
    ];

    protected $casts = [
      'value'         => 'decimal:8',
      'network_fee'   => 'decimal:8',
      'confirmations' => 'integer',
      'processed'     => 'boolean',
      'raw_event'     => 'array',
      'created_at'    => 'datetime',
      'updated_at'    => 'datetime',
    ];

    public function project()
    {
      return $this->belongsTo(Project::class);
    }

    public function invoice()
    {
      return $this->belongsTo(Invoice::class);
    }

    public function hdWallet()
    {
      return $this->belongsTo(HdWallet::class);
    }

    public function tokenNetwork()
    {
      return $this->belongsTo(TokenNetwork::class);
    }
}

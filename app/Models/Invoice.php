<?php

namespace App\Models;

use App\Models\Concerns\HasUlid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Invoice extends Model
{
    use HasFactory, HasUlid;

    protected $table = 'invoices';

    protected $fillable = [
      'ulid',
      'project_id',
      'amount',
      'amount_usd',
      'paid_amount',
      'service_fee',
      'service_fee_usd',
      'fiat_currency',
      'token_network_id',
      'status',
      'side_commission',
      'side_commission_cc',
      'is_email_required',
      'test_mode',
      'expiry_date',
      'external_order_id',
      'metadata',
    ];

    protected $casts = [
      'ulid'             => 'string',
      'amount'           => 'decimal:8',
      'amount_usd'       => 'decimal:8',
      'paid_amount'      => 'decimal:8',
      'service_fee'      => 'decimal:6',
      'service_fee_usd'  => 'decimal:6',
      'is_email_required'=> 'boolean',
      'test_mode'        => 'boolean',
      'expiry_date'      => 'datetime',
      'metadata'         => 'array',
      'created_at'       => 'datetime',
      'updated_at'       => 'datetime',
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

    public function webhookLogs()
    {
      return $this->hasMany(InvoiceWebhookLog::class);
    }

}

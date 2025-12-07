<?php

namespace App\Models;

use App\Models\Concerns\HasUlid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Laravel\Sanctum\HasApiTokens;

class Project extends Model
{
    use HasApiTokens, HasFactory, HasUlid;

  protected $table = 'projects';

  protected $fillable = [
    'ulid',
    'user_id',
    'name',
    'activity_type',
    'auto_confirm_partial_by_amount',
    'auto_confirm_partial_by_percent',
    'description',
    'platform',
    'project_url',
    'side_commission',
    'side_commission_cc',
    'success_url',
    'fail_url',
    'notify_url',
    'logo',
    'test_mode',
    'service_fee',
    'status',
    'is_archived',
  ];

  protected $casts = [
    'ulid'        => 'string',
    'test_mode'   => 'boolean',
    'is_archived' => 'boolean',
    'service_fee' => 'decimal:6',
    'created_at'  => 'datetime',
    'updated_at'  => 'datetime',
  ];

  // Связи

  public function user(): BelongsTo
  {
    return $this->belongsTo(User::class);
  }

  public function moderationLogs(): HasMany
  {
    return $this->hasMany(ProjectModerationLog::class);
  }

  public function apiKeys(): HasMany
  {
    return $this->hasMany(ProjectApiKey::class);
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

  public function invoiceWebhookLogs(): HasMany
  {
    return $this->hasMany(InvoiceWebhookLog::class);
  }

  public function tokenNetworks(): BelongsToMany
  {
    return $this->belongsToMany(TokenNetwork::class, 'project_token_networks')
      ->using(ProjectTokenNetwork::class)
      ->withPivot(['enabled', 'is_default', 'order', 'created_at', 'updated_at']);
  }

}

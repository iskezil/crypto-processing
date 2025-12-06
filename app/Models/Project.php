<?php

namespace App\Models;

use App\Models\Concerns\HasUlid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Project extends Model
{
    use HasFactory, HasUlid;

  protected $table = 'projects';

  protected $fillable = [
    'ulid',
    'user_id',
    'name',
    'activity_type',
    'description',
    'platform',
    'project_url',
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

  public function user()
  {
    return $this->belongsTo(User::class);
  }

  public function moderationLogs()
  {
    return $this->hasMany(ProjectModerationLog::class);
  }

  public function apiKeys()
  {
    return $this->hasMany(ProjectApiKey::class);
  }

  public function invoices()
  {
    return $this->hasMany(Invoice::class);
  }

  public function hdWallets()
  {
    return $this->hasMany(HdWallet::class);
  }

  public function depositEvents()
  {
    return $this->hasMany(DepositEvent::class);
  }

  public function invoiceWebhookLogs()
  {
    return $this->hasMany(InvoiceWebhookLog::class);
  }

  public function tokenNetworks()
  {
    return $this->belongsToMany(TokenNetwork::class, 'project_token_networks')
      ->using(ProjectTokenNetwork::class)
      ->withPivot(['enabled', 'is_default', 'order', 'created_at', 'updated_at']);
  }

}

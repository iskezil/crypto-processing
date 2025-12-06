<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InvoiceWebhookLog extends Model
{
    use HasFactory;

    protected $table = 'invoice_webhook_logs';

    protected $fillable = [
      'invoice_id',
      'project_id',
      'url',
      'payload',
      'status',
      'response_code',
      'response_headers',
      'response_body',
      'attempt_count',
      'next_attempt_at',
    ];

    protected $casts = [
      'payload'          => 'array',
      'response_headers' => 'array',
      'attempt_count'    => 'integer',
      'next_attempt_at'  => 'datetime',
      'created_at'       => 'datetime',
      'updated_at'       => 'datetime',
    ];

    public function invoice()
    {
      return $this->belongsTo(Invoice::class);
    }

    public function project()
    {
      return $this->belongsTo(Project::class);
    }
}

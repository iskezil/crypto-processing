<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
  /**
   * Run the migrations.
   */
  public function up(): void
  {
    Schema::create('invoice_webhook_logs', function (Blueprint $table) {
      $table->id()->comment('ID записи истории отправки webhook по инвойсу');
      $table->unsignedBigInteger('invoice_id')->comment('ID инвойса (invoices.id)');
      $table->unsignedBigInteger('project_id')->comment('ID проекта (projects.id)');
      $table->string('url', 1024)->comment('URL, на который отправлен webhook');
      $table->json('payload')->nullable()->comment('Тело отправленного webhook-запроса');
      $table->string('status', 50)->default('pending')->comment('Статус отправки: pending, success, failed');
      $table->integer('response_code')->nullable()->comment('HTTP-код ответа на webhook');
      $table->json('response_headers')->nullable()->comment('Заголовки ответа на webhook');
      $table->text('response_body')->nullable()->comment('Тело ответа на webhook');
      $table->integer('attempt_count')->default(0)->comment('Количество попыток отправки');
      $table->boolean('signature_valid')->default(true)->comment('Была ли подпись запроса валидной при отправке');
      $table->timestamp('next_attempt_at')->nullable()->comment('Время следующей попытки (для ретраев)');
      $table->timestamps();

      $table->foreign('invoice_id')->references('id')->on('invoices');
      $table->foreign('project_id')->references('id')->on('projects');

      $table->index('invoice_id', 'invoice_webhook_logs_invoice_id_idx');
      $table->index('project_id', 'invoice_webhook_logs_project_id_idx');
      $table->index(
        ['status', 'next_attempt_at'],
        'invoice_webhook_logs_status_next_attempt_idx'
      );
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::dropIfExists('invoice_webhook_logs');
  }
};

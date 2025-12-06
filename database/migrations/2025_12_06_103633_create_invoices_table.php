<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
  /**
   * Run the migrations.
   */
  public function up(): void
  {
    Schema::create('invoices', function (Blueprint $table) {
      $table->id()->comment('ID инвойса');
      $table->ulid()->unique()->comment('Публичный ULID счета для API/URL');
      $table->unsignedBigInteger('project_id')->comment('ID проекта, которому принадлежит инвойс');
      $table->decimal('amount', 18, 8)->comment('Сумма счета в валюте создания (fiat_currency)');
      $table->decimal('amount_usd', 18, 8)->comment('Сумма счета, пересчитанная в USD на момент создания');
      $table->decimal('paid_amount', 18, 8)->default(0)->comment('Фактически оплаченная сумма (агрегация из deposit_events)');
      $table->decimal('service_fee', 18, 6)->nullable()->comment('Комиссия сервиса по этому счету');
      $table->decimal('service_fee_usd', 18, 6)->nullable()->comment('Комиссия сервиса в USD по этому счету');
      $table->string('fiat_currency', 10)->default('USD')->comment('Код фиатной валюты создания счета: USD, EUR, RUB и т.д.');
      $table->unsignedBigInteger('token_network_id')->nullable()->comment('Конкретная пара токен+сеть, выбранная для оплаты (token_networks.id)');
      $table->string('status', 50)->default('created')->comment('Статус инвойса: created, pending, paid, partial, overpaid, canceled');
      $table->string('side_commission', 10)->default('client')->comment('Кто оплачивает трансферную комиссию: client или merchant');
      $table->string('side_commission_cc', 10)->default('client')->comment('Кто оплачивает сервисную комиссию: client или merchant');
      $table->boolean('is_email_required')->default(false)->comment('Обязателен ли email плательщика для этого счета');
      $table->boolean('test_mode')->default(false)->comment('Тестовый ли это счет');
      $table->timestamp('expiry_date')->comment('Дата и время истечения срока действия счета');
      $table->string('external_order_id', 255)->nullable()->comment('Идентификатор заказа во внешней системе мерчанта');
      $table->json('metadata')->nullable()->comment('Дополнительные произвольные поля (add_fields)');
      $table->timestamps();

      $table->foreign('project_id')->references('id')->on('projects')->onDelete('cascade');
      $table->foreign('token_network_id')->references('id')->on('token_networks');

      $table->index(['project_id', 'status'], 'invoices_project_status_idx');
      $table->index('external_order_id', 'invoices_external_order_id_idx');
      $table->index('token_network_id', 'invoices_token_network_id_idx');
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::dropIfExists('invoices');
  }
};

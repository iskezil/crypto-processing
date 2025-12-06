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
    Schema::create('deposit_events', function (Blueprint $table) {
      $table->id()->comment('ID события депозита/свипа/возврата');
      $table->unsignedBigInteger('project_id')->nullable()->comment('ID проекта, которому принадлежит депозит (может быть NULL до маппинга)');
      $table->unsignedBigInteger('invoice_id')->nullable()->comment('ID инвойса, к которому относится депозит (если маппинг выполнен)');
      $table->unsignedBigInteger('hd_wallet_id')->nullable()->comment('ID кошелька, на который пришли средства');
      $table->unsignedBigInteger('token_network_id')->comment('ID пары токен+сеть, в которой пришли средства');

      $table->string('tx_hash', 255)->comment('Хеш транзакции в сети');
      $table->string('from_address', 255)->nullable()->comment('Адрес отправителя (если доступен)');
      $table->string('to_address', 255)->nullable()->comment('Адрес получателя (обычно HD-адрес)');
      $table->decimal('value', 18, 8)->comment('Сумма поступления в единицах токена');

      $table->string('status', 50)->default('pending')->comment('Статус события: pending, confirmed, failed, processed');
      $table->integer('confirmations')->default(0)->comment('Количество подтверждений на момент записи/обновления');
      $table->bigInteger('block_number')->nullable()->comment('Высота блока, в котором зафиксировано событие');
      $table->integer('log_index')->nullable()->comment('Индекс лога для EVM-подобных сетей');
      $table->decimal('network_fee', 18, 8)->nullable()->comment('Фактическая комиссия сети за транзакцию (если доступна)');

      $table->string('event_type', 50)->default('deposit')->comment('Тип события: deposit, sweep, refund, internal_transfer');
      $table->boolean('processed')->default(false)->comment('Обработано ли событие воркерами (для идемпотентности)');
      $table->integer('retry_count')->default(0)->comment('Количество попыток обработки события');
      $table->string('listener_version', 50)->nullable()->comment('Версия листенера/сервиса, который зафиксировал событие');
      $table->json('raw_event')->nullable()->comment('Полный сырой объект события из ноды/провайдера');
      $table->timestamps();

      $table->foreign('project_id')->references('id')->on('projects');
      $table->foreign('invoice_id')->references('id')->on('invoices');
      $table->foreign('hd_wallet_id')->references('id')->on('hd_wallets');
      $table->foreign('token_network_id')->references('id')->on('token_networks');

      $table->unique(['tx_hash'], 'deposit_events_unique_tx_hash');

      $table->index('hd_wallet_id', 'deposit_events_hd_wallet_id_idx');
      $table->index('project_id', 'deposit_events_project_id_idx');
      $table->index('invoice_id', 'deposit_events_invoice_id_idx');
      $table->index('token_network_id', 'deposit_events_token_network_id_idx');
      $table->index(['status', 'processed'], 'deposit_events_status_processed_idx');
      $table->index(['token_network_id', 'block_number'], 'deposit_events_token_block_idx');
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::dropIfExists('deposit_events');
  }
};

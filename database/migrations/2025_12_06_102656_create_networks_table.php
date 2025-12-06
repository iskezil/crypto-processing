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
    Schema::create('networks', function (Blueprint $table) {
      $table->id()->comment('ID блокчейн-сети');
      $table->string('code', 50)->unique()->comment("Код сети: TRC20, ERC20, BSC, TON, SOL и т.п.");
      $table->string('name', 255)->comment('Человекочитаемое название сети: Tron, Ethereum, BNB Chain');
      $table->string('rpc_url', 1024)->nullable()->comment('RPC-эндпоинт для доступа к ноде');
      $table->string('explorer_tx_url', 1024)->nullable()->comment('Шаблон URL для просмотра транзакции, например https://tronscan.org/#/transaction/{tx}');
      $table->string('explorer_addr_url', 1024)->nullable()->comment('Шаблон URL для просмотра адреса кошелька, например https://tronscan.org/#/address/{addr}');
      $table->string('icon_path', 255)->nullable()->comment('Путь до иконки сети');
      $table->string('native_token', 50)->nullable()->comment('Тикер нативного токена сети: TRX, ETH, BNB и т.п.');
      $table->integer('chain_id')->nullable()->comment('chainId для EVM-совместимых сетей');

      $table->integer('confirmations_required')->default(5)->comment('Количество подтверждений блока для финального статуса депозита');
      $table->boolean('active')->default(true)->comment('Флаг активной сети');
      $table->boolean('is_public')->default(true)->comment('Отображать ли сеть в интерфейсе админки/проекта');
      $table->timestamps();

      $table->index('active', 'networks_active_idx');
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::dropIfExists('networks');
  }
};

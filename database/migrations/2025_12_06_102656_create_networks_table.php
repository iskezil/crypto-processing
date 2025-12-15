<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
  public function up(): void
  {
    Schema::create('networks', function (Blueprint $table) {
      $table->id()->comment('ID блокчейн-сети');
      $table->string('code', 50)->unique()->comment("Код сети: TRON, ETHEREUM, BSC, TON, SOLANA и т.п.");
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

      // ------------------------------------------------------------------
      // HD derivation params (не секреты!)
      // ------------------------------------------------------------------
      $table->unsignedSmallInteger('hd_purpose')
        ->default(44)
        ->comment("BIP purpose (обычно 44). Итоговый путь: m/purpose'/coin_type'/account'/change/index");

      $table->unsignedInteger('hd_coin_type')->nullable()
        ->comment("SLIP-0044 coin_type (TRON=195, EVM=60, BTC=0, LTC=2, SOL=501, TON=607 и т.п.).");

      $table->unsignedInteger('hd_account')
        ->default(0)
        ->comment("BIP44 account (обычно 0).");

      $table->unsignedInteger('hd_change')
        ->default(0)
        ->comment("BIP44 change: 0=external(депозиты), 1=internal(change).");

      $table->string('hd_address_format', 32)->nullable()
        ->comment("Формат адреса сети: tron_base58 | evm_hex | btc_p2wpkh | btc_p2pkh | sol_base58 | ton ...");

      // Глобальный счётчик индекса по сети (общий для всех проектов)
      $table->unsignedBigInteger('hd_next_index')
        ->default(0)
        ->comment("Следующий derivation index для сети. Выдаётся атомарно (FOR UPDATE). Общий для всех проектов.");

      $table->json('meta')->nullable()->comment('Произвольные параметры сети (memo/tag, tron resources и т.п.)');

      $table->timestamps();

      $table->index('active', 'networks_active_idx');
      $table->index(['active', 'is_public'], 'networks_active_public_idx');
      $table->index('code', 'networks_code_idx');
    });
  }

  public function down(): void
  {
    Schema::dropIfExists('networks');
  }
};

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
    Schema::create('token_networks', function (Blueprint $table) {
      $table->id()->comment('ID пары токен + сеть');
      $table->unsignedBigInteger('token_id')->comment('Ссылка на базовый токен (tokens.id)');
      $table->unsignedBigInteger('network_id')->comment('Ссылка на сеть (networks.id)');
      $table->string('contract_address', 255)->nullable()->comment('Адрес контракта токена в сети (для ERC20/TRC20). NULL для нативных токенов');
      $table->boolean('stable_coin')->default(false)->comment('Является ли токен стейблкоином в данной сети');
      $table->string('full_code', 50)->unique()->comment('Уникальный код токен+сеть, например USDT_TRC20');
      $table->string('explorer_tx_url', 1024)->nullable()->comment('Переопределение шаблона просмотра транзакции для конкретного токена');
      $table->string('explorer_addr_url', 1024)->nullable()->comment('Переопределение шаблона просмотра адреса для конкретного токена');
      $table->boolean('active')->default(true)->comment('Доступна ли пара токен+сеть для использования');
      $table->integer('order')->default(1)->comment('Порядок сортировки токен+сеть в списках');

      $table->string('hot_wallet_address', 255)->nullable()->comment('Горячий кошелек для свипов по данной паре токен+сеть');
      $table->text('encrypted_hot_wallet_key')->nullable()->comment('Зашифрованный приватный ключ горячего кошелька (через KMS/Vault)');
      $table->decimal('min_deposit_amount', 18, 8)->nullable()->comment('Минимальный размер депозита, учитываемый как валидный');
      $table->decimal('max_deposit_amount', 18, 8)->nullable()->comment('Максимальный лимит депозита (для защиты)');
      $table->decimal('sweep_fee_percent', 5, 2)->nullable()->comment('Оценка процента комиссии сети при свипе');
      $table->text('notes')->nullable()->comment('Админские заметки по данному токену/сети');

      $table->timestamps();

      $table->foreign('token_id')->references('id')->on('tokens')->onDelete('cascade');
      $table->foreign('network_id')->references('id')->on('networks')->onDelete('cascade');

      $table->index('token_id', 'token_networks_token_id_idx');
      $table->index('network_id', 'token_networks_network_id_idx');
      $table->index('active', 'token_networks_active_idx');
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::dropIfExists('token_networks');
  }
};

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
    Schema::create('tokens', function (Blueprint $table) {
      $table->id()->comment('ID базового токена без привязки к сети');
      $table->string('code', 10)->unique()->comment('Код токена: USDT, USDC, ETH, BTC и т.п.');
      $table->string('name', 255)->comment('Название токена: Tether, USD Coin, Ethereum');
      $table->integer('decimals')->default(18)->comment('Количество знаков после запятой для токена');
      $table->string('icon_path', 1024)->nullable()->comment('Иконка базового токена (без сети)');
      $table->boolean('is_archived')->default(false)->comment('Флаг архивирования токена (больше не используется)');
      $table->timestamps();
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::dropIfExists('tokens');
  }
};

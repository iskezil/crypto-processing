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
    Schema::create('hd_wallets', function (Blueprint $table) {
      $table->id()->comment('ID кошелька (HD/горячий/холодный)');
      $table->unsignedBigInteger('project_id')->comment('ID проекта, которому принадлежит кошелек');
      $table->unsignedBigInteger('token_network_id')->comment('ID пары токен+сеть (token_networks.id)');
      $table->string('address', 255)->unique()->comment('Адрес кошелька в сети');
      $table->string('derivation_path', 255)->nullable()->comment('Путь derivation для HD-кошельков (m/44"/...)');
      $table->string('status', 50)->default('active')->comment('Статус кошелька: active, archived, disabled');
      $table->timestamp('last_checked_at')->nullable()->comment('Когда листенер последний раз проверял этот адрес');
      $table->decimal('last_balance', 18, 8)->nullable()->comment('Последнее известное значение баланса для данного адреса');
      $table->bigInteger('watcher_cursor')->nullable()->comment('Технический курсор/позиция в логах/блоках для этого адреса');
      $table->timestamps();

      $table->foreign('project_id')->references('id')->on('projects')->onDelete('cascade');
      $table->foreign('token_network_id')->references('id')->on('token_networks');

      $table->index(
        ['project_id', 'token_network_id', 'status'],
        'hd_wallets_project_token_network_status_idx'
      );
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::dropIfExists('hd_wallets');
  }
};

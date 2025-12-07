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
    Schema::create('project_api_keys', function (Blueprint $table) {
      $table->id()->comment('ID API-ключа проекта');
      $table->unsignedBigInteger('project_id')->comment('ID проекта (projects.id)');
      $table->unsignedBigInteger('personal_access_token_id')->nullable();
      $table->string('plain_text_token', 512)->nullable();
      $table->string('secret', 255)->comment('Секрет API-ключа (хранить в зашифрованном виде)');
      $table->json('ip_allow_list')->nullable()->comment('Список разрешённых IP (JSON/CSV), если используется ограничение по IP');
      $table->integer('rate_limit')->nullable()->comment('Лимит запросов в минуту для этого ключа (NULL = по умолчанию)');
      $table->string('status', 50)->default('moderation')->comment('Статус API-ключа: moderation, active, rejected, revoked');
      $table->timestamp('last_used_at')->nullable()->comment('Время последнего использования ключа');
      $table->timestamp('revoked_at')->nullable()->comment('Время отзыва ключа (если статус revoked)');
      $table->timestamps();

      $table->foreign('project_id')->references('id')->on('projects')->onDelete('cascade');

      $table->index('project_id', 'project_api_keys_project_id_idx');
      $table->index('status', 'project_api_keys_status_idx');
      $table->index('last_used_at', 'project_api_keys_last_used_at_idx');
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::dropIfExists('project_api_keys');
  }
};

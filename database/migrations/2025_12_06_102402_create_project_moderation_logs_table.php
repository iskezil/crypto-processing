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
    Schema::create('project_moderation_logs', function (Blueprint $table) {
      $table->id()->comment('ID записи истории модерации проекта');
      $table->unsignedBigInteger('project_id')->comment('ID проекта (projects.id)');
      $table->unsignedBigInteger('moderator_id')->comment('ID модератора (users.id)');
      $table->string('moderation_type', 50)->default('general')->comment('Тип модерации: general, content, financial, kyc и т.д.');
      $table->string('status', 50)->comment('Статус результата: approved, rejected, pending');
      $table->text('comment')->nullable()->comment('Комментарий модератора');
      $table->timestamps();

      $table->foreign('project_id')->references('id')->on('projects')->onDelete('cascade');
      $table->foreign('moderator_id')->references('id')->on('users');

      $table->index('project_id', 'project_moderation_logs_project_id_idx');
      $table->index(['project_id', 'created_at'], 'project_moderation_logs_project_created_idx');
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::dropIfExists('project_moderation_logs');
  }
};

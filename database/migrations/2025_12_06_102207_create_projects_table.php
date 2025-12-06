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
    Schema::create('projects', function (Blueprint $table) {
      $table->id()->comment('ID проекта');
      $table->ulid()->unique()->comment('Публичный ULID проекта');
      $table->unsignedBigInteger('user_id')->comment('ID владельца проекта (users.id)');
      $table->string('name', 255)->comment('Название проекта / магазина');
      $table->string('activity_type', 255)->nullable()->comment('Вид деятельности (описание бизнеса)');
      $table->text('description')->nullable()->comment('Описание проекта');
      $table->string('platform', 50)->nullable()->comment("Тип платформы: web, telegram_bot, vk_bot и т.п.");
      $table->string('project_url', 1024)->nullable()->comment('Ссылка на сайт/бот/продукт проекта');
      $table->string('success_url', 1024)->nullable()->comment('URL успешной оплаты (редирект клиента)');
      $table->string('fail_url', 1024)->nullable()->comment('URL неуспешной оплаты (редирект клиента)');
      $table->string('notify_url', 1024)->nullable()->comment('Webhook URL для уведомлений о статусах платежей');
      $table->string('logo', 1024)->nullable()->comment('URL логотипа для платежной страницы');
      $table->boolean('test_mode')->default(false)->comment('Флаг тестового режима проекта');
      $table->decimal('service_fee', 18, 6)->nullable()->comment('Комиссия сервиса для проекта (в процентах или фиксированная логика)');
      $table->string('status', 50)->default('pending')->comment('Статус модерации проекта: pending, approved, rejected');
      $table->boolean('is_archived')->default(false)->comment('Флаг архивирования проекта (мягкое удаление)');
      $table->timestamps();

      $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');

      $table->index('user_id', 'projects_user_id_idx');
      $table->index('status', 'projects_status_idx');
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::dropIfExists('projects');
  }
};

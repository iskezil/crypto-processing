<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('project_token_networks', function (Blueprint $table) {
            $table->id()->comment('ID связи проекта и токен+сеть');
          $table->unsignedBigInteger('project_id')->comment('ID проекта (projects.id)');
          $table->unsignedBigInteger('token_network_id')->comment('ID token_networks.id (конкретный токен в сети)');
          $table->boolean('enabled')->default(true)->comment('Включена ли данная валюта в проекте');
          $table->boolean('is_default')->default(false)->comment('Используется ли по умолчанию на форме оплаты');
          $table->integer('order')->default(1)->comment('Порядок сортировки на форме оплаты');
          $table->timestamps();

          $table->foreign('project_id')->references('id')->on('projects')->onDelete('cascade');
          $table->foreign('token_network_id')->references('id')->on('token_networks')->onDelete('cascade');

          $table->unique(['project_id', 'token_network_id'], 'project_token_networks_unique_project_token_network');
          $table->index(['project_id', 'enabled'], 'project_token_networks_project_enabled_idx');
          $table->index(['project_id', 'is_default'], 'project_token_networks_project_default_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('project_token_networks');
    }
};

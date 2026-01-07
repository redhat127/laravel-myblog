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
        Schema::create('posts', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('excerpt')->nullable();
            $table->text('body')->nullable();
            $table->enum('status', ['draft', 'published', 'scheduled']);
            $table->date('publish_date')->nullable();
            $table->string('featured_image_path')->nullable();
            $table->foreignUlid('user_id')
                ->constrained()
                ->cascadeOnDelete();
            $table->softDeletes();
            $table->timestamps();
            $table->index(['user_id', 'status', 'publish_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('posts');
    }
};

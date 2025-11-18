<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('options', function (Blueprint $table) {
            $table->id();
            $table->foreignId('question_id')->constrained()->cascadeOnDelete();
            $table->text('text');                 // option label
            $table->boolean('is_correct')->default(false);
            $table->unsignedInteger('position')->default(0); // order within the question
            $table->text('explanation')->nullable(); // shown after answering / review
            $table->timestamps();

            $table->index(['question_id', 'position']);
        });
    }

    public function down(): void {
        Schema::dropIfExists('options');
    }
};

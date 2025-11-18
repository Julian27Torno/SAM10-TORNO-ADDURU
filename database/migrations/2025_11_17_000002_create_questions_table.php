<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('quiz_id')->constrained()->cascadeOnDelete();
            $table->text('prompt'); // the question text

            // type: single (one correct), multiple (many correct), true_false (use two options)
            $table->enum('type', ['single','multiple','true_false'])->default('single');

            // points for the question (used for scoring)
            $table->unsignedInteger('points')->default(1);

            // ordering within a quiz (still useful even if shuffle is on)
            $table->unsignedInteger('position')->default(0);

            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('questions');
    }
};

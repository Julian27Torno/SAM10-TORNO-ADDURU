<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('question_answers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('quiz_attempt_id')->constrained()->cascadeOnDelete();
            $table->foreignId('question_id')->constrained()->cascadeOnDelete();

            // auto-grading snapshot
            $table->boolean('is_correct')->default(false);
            $table->unsignedInteger('points_awarded')->default(0);

            $table->timestamps();

            $table->unique(['quiz_attempt_id', 'question_id']); // one record per question per attempt
        });
    }

    public function down(): void {
        Schema::dropIfExists('question_answers');
    }
};

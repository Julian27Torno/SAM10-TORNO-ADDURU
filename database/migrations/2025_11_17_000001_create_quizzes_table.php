<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('quizzes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete(); // author
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('description')->nullable();

            // visibility: public (default), unlisted, private
            $table->enum('visibility', ['public','unlisted','private'])->default('public');

            // basic settings
            $table->unsignedInteger('time_limit_seconds')->nullable(); // null = no limit
            $table->boolean('shuffle_questions')->default(true);
            $table->boolean('shuffle_options')->default(true);
            $table->unsignedTinyInteger('max_attempts')->nullable(); // null = unlimited

            $table->unsignedInteger('total_points')->default(0); // cached sum of question points

            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('quizzes');
    }
};

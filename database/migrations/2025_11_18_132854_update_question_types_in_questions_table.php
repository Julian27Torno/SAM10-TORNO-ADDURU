<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // We use raw SQL because changing Enums in Laravel/Doctrine can be tricky
        DB::statement("ALTER TABLE questions MODIFY COLUMN type ENUM('multiple', 'true_false', 'identification') NOT NULL DEFAULT 'multiple'");
    }

    public function down(): void
    {
        // Revert logic if needed (careful with data loss)
        DB::statement("ALTER TABLE questions MODIFY COLUMN type ENUM('single', 'multiple', 'true_false') NOT NULL DEFAULT 'single'");
    }
};
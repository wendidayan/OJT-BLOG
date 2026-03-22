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
        Schema::table('blogs', function (Blueprint $table) {
            // Rename tag to task
            if (Schema::hasColumn('blogs', 'tag')) {
                $table->renameColumn('tag', 'task');
            }
            
            // Remove tag_color and excerpt if they exist
            $columnsToDrop = [];
            if (Schema::hasColumn('blogs', 'tag_color')) {
                $columnsToDrop[] = 'tag_color';
            }
            if (Schema::hasColumn('blogs', 'excerpt')) {
                $columnsToDrop[] = 'excerpt';
            }
            if (!empty($columnsToDrop)) {
                $table->dropColumn($columnsToDrop);
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('blogs', function (Blueprint $table) {
            // Rename task back to tag
            $table->renameColumn('task', 'tag');
            
            // Add back tag_color and excerpt
            $table->string('tag_color')->nullable();
            $table->text('excerpt')->nullable();
        });
    }
};

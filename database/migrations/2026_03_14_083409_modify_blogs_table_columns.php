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
            $table->renameColumn('tag', 'task');
            
            // Remove tag_color and excerpt
            $table->dropColumn(['tag_color', 'excerpt']);
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

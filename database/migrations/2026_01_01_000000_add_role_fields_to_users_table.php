<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('role', 20)->default('editor')->after('password');
            $table->boolean('is_active')->default(true)->after('role');
            $table->string('position')->nullable()->after('is_active');
            $table->string('avatar_path')->nullable()->after('position');
            $table->timestamp('last_login_at')->nullable()->after('avatar_path');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['role', 'is_active', 'position', 'avatar_path', 'last_login_at']);
        });
    }
};

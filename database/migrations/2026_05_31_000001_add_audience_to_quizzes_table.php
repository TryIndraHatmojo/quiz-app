<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('quizzes', function (Blueprint $table) {
            if (! Schema::hasColumn('quizzes', 'audience')) {
                $table->string('audience', 20)->default('regular')->after('status')->index();
            }
        });

        if (Schema::hasTable('role_user') && Schema::hasTable('roles')) {
            $guestCreatorIds = DB::table('role_user')
                ->join('roles', 'roles.id', '=', 'role_user.role_id')
                ->whereIn('roles.slug', ['guru-tamu', 'siswa-tamu'])
                ->pluck('role_user.user_id')
                ->unique();

            if ($guestCreatorIds->isNotEmpty()) {
                DB::table('quizzes')
                    ->whereIn('user_id', $guestCreatorIds)
                    ->update(['audience' => 'guest']);
            }
        }
    }

    public function down(): void
    {
        Schema::table('quizzes', function (Blueprint $table) {
            if (Schema::hasColumn('quizzes', 'audience')) {
                $table->dropIndex(['audience']);
                $table->dropColumn('audience');
            }
        });
    }
};

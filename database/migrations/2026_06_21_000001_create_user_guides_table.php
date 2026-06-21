<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_guides', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('file_path');
            $table->string('original_name');
            $table->string('mime_type', 100);
            $table->unsignedBigInteger('size');
            $table->foreignId('uploaded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        $masterDataParentId = DB::table('menus')
            ->where('title', 'Master Data')
            ->value('id');

        if (! $masterDataParentId) {
            $masterDataParentId = DB::table('menus')->insertGetId([
                'group_name' => 'Data Master',
                'title' => 'Master Data',
                'url' => null,
                'route_name' => null,
                'icon' => 'Database',
                'parent_id' => null,
                'order' => 5,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        DB::table('menus')->updateOrInsert(
            ['route_name' => 'master.user-guide.index'],
            [
            'group_name' => 'Data Master',
            'title' => 'Kelola Buku Panduan',
            'url' => '/master/user-guide',
            'icon' => 'BookMarked',
            'parent_id' => $masterDataParentId,
            'order' => 12,
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
            ]
        );

        $manageMenuId = DB::table('menus')
            ->where('route_name', 'master.user-guide.index')
            ->value('id');

        DB::table('menus')->updateOrInsert(
            ['route_name' => 'user-guide.index'],
            [
            'group_name' => 'Panduan',
            'title' => 'Buku Panduan',
            'url' => '/user-guide',
            'icon' => 'BookOpenCheck',
            'parent_id' => null,
            'order' => 13,
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
            ]
        );

        $downloadMenuId = DB::table('menus')
            ->where('route_name', 'user-guide.index')
            ->value('id');

        $roleIds = DB::table('roles')->pluck('id');
        foreach ($roleIds as $roleId) {
            $this->attachMenuToRole($downloadMenuId, $roleId);
        }

        $adminRoleId = DB::table('roles')
            ->where('slug', 'admin')
            ->value('id');

        if ($adminRoleId) {
            $this->attachMenuToRole($masterDataParentId, $adminRoleId);
            $this->attachMenuToRole($manageMenuId, $adminRoleId);
        }
    }

    public function down(): void
    {
        $menuIds = DB::table('menus')
            ->whereIn('route_name', [
                'master.user-guide.index',
                'user-guide.index',
            ])
            ->pluck('id');

        DB::table('menu_role')->whereIn('menu_id', $menuIds)->delete();
        DB::table('menus')->whereIn('id', $menuIds)->delete();

        Schema::dropIfExists('user_guides');
    }

    private function attachMenuToRole(int $menuId, int $roleId): void
    {
        $exists = DB::table('menu_role')
            ->where('menu_id', $menuId)
            ->where('role_id', $roleId)
            ->exists();

        if (! $exists) {
            DB::table('menu_role')->insert([
                'menu_id' => $menuId,
                'role_id' => $roleId,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
};

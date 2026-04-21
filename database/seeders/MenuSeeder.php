<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Menu;
use App\Models\Role;

class MenuSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $menus = [
            [
                'group_name' => 'Platform',
                'title' => 'Dashboard',
                'url' => '/dashboard',
                'route_name' => 'dashboard',
                'icon' => 'LayoutGrid',
                'order' => 1,
            ],
            [
                'group_name' => 'Platform',
                'title' => 'Nilai',
                'url' => '/nilai',
                'route_name' => 'nilai.index',
                'icon' => 'ClipboardCheck',
                'order' => 2,
            ],
            [
                'group_name' => 'Koleksi',
                'title' => 'Buat Baru',
                'url' => '/library/quizzes/create',
                'route_name' => 'library.quizzes.create',
                'icon' => 'Plus',
                'order' => 3,
            ],
            [
                'group_name' => 'Koleksi',
                'title' => 'Semua Kuis',
                'url' => '/library/quizzes',
                'route_name' => 'library.quizzes.index',
                'icon' => 'BookOpen',
                'order' => 4,
            ],
            [
                'group_name' => 'Data Master',
                'title' => 'Pengguna',
                'url' => '/master/users',
                'route_name' => 'master.users.index',
                'icon' => 'Users',
                'parent_title' => 'Master Data',
                'order' => 5,
            ],
            [
                'group_name' => 'Data Master',
                'title' => 'Peran',
                'url' => '/master/roles',
                'route_name' => 'master.roles.index',
                'icon' => 'Shield',
                'parent_title' => 'Master Data',
                'order' => 6,
            ],
            [
                'group_name' => 'Data Master',
                'title' => 'Mata Pelajaran',
                'url' => '/master/categories',
                'route_name' => 'master.categories.index',
                'icon' => 'BookOpen',
                'parent_title' => 'Master Data',
                'order' => 7,
            ],
            [
                'group_name' => 'Data Master',
                'title' => 'Jenjang',
                'url' => '/master/jenjang',
                'route_name' => 'master.jenjang.index',
                'icon' => 'GraduationCap',
                'parent_title' => 'Master Data',
                'order' => 8,
            ],
            [
                'group_name' => 'Data Master',
                'title' => 'Kelas',
                'url' => '/master/kelas',
                'route_name' => 'master.kelas.index',
                'icon' => 'Users',
                'parent_title' => 'Master Data',
                'order' => 9,
            ],
            [
                'group_name' => 'Data Master',
                'title' => 'Backgrounds',
                'url' => '/master/backgrounds',
                'route_name' => 'master.backgrounds.index',
                'icon' => 'LayoutGrid',
                'parent_title' => 'Master Data',
                'order' => 10,
            ],
            [
                'group_name' => 'Data Master',
                'title' => 'Galeri',
                'url' => '/master/galleries',
                'route_name' => 'master.galleries.index',
                'icon' => 'FileImage',
                'parent_title' => 'Master Data',
                'order' => 11,
            ],
        ];

        // Create Master Data Parent
        $masterDataParent = Menu::firstOrCreate([
            'title' => 'Master Data',
            'group_name' => 'Data Master',
            'icon' => 'Database',
            'order' => 5, // Just to place it
        ]);

        foreach ($menus as $menuData) {
            $parentTitle = $menuData['parent_title'] ?? null;
            unset($menuData['parent_title']);

            if ($parentTitle === 'Master Data') {
                $menuData['parent_id'] = $masterDataParent->id;
            }

            Menu::firstOrCreate(
                ['route_name' => $menuData['route_name']],
                $menuData
            );
        }

        // Define menu assignments for each role
        $roleMenus = [
            'Admin' => [
                'Master Data', 'Dashboard', 'Nilai', 'Buat Baru', 'Semua Kuis', 
                'Pengguna', 'Peran', 'Mata Pelajaran', 'Jenjang', 'Kelas', 
                'Backgrounds', 'Galeri'
            ],
            'Guru Telaah Soal' => [
                'Dashboard', 'Nilai', 'Buat Baru', 'Semua Kuis'
            ],
            'Guru Mata Pelajaran' => [
                'Dashboard', 'Nilai', 'Buat Baru', 'Semua Kuis'
            ],
            'Siswa' => [
                'Dashboard', 'Nilai'
            ],
            'Orang Tua' => [
                'Dashboard', 'Nilai'
            ],
        ];

        // Assign menus to roles
        foreach ($roleMenus as $roleName => $menuTitles) {
            $role = Role::where('name', $roleName)->first();
            if ($role) {
                $menuIds = Menu::whereIn('title', $menuTitles)->pluck('id')->toArray();
                $role->menus()->sync($menuIds);
            }
        }
    }
}

<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Models\Menu;
use App\Models\Role;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RoleMenuController extends Controller
{
    public function index(Role $role)
    {
        // Get all menus ordered by group and order
        $menus = Menu::orderBy('group_name')
            ->orderBy('order')
            ->get();

        // Get currently assigned menu IDs
        $assignedMenuIds = $role->menus()->pluck('menus.id')->toArray();

        return Inertia::render('master/roles/access', [
            'role' => $role,
            'menus' => $menus,
            'assignedMenuIds' => $assignedMenuIds,
        ]);
    }

    public function update(Request $request, Role $role)
    {
        $validated = $request->validate([
            'menu_ids' => ['array'],
            'menu_ids.*' => ['exists:menus,id'],
        ]);

        $role->menus()->sync($validated['menu_ids'] ?? []);

        return redirect()->route('master.roles.index')
            ->with('success', 'Hak akses menu berhasil diperbarui.');
    }
}

<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Models\Role;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RoleController extends Controller
{
    public function index(Request $request)
    {
        $roles = Role::with(['menus:id,title'])->withCount('menus')
            ->when($request->name, function ($query, $name) {
                $query->where('name', 'like', "%{$name}%");
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();

        $totalMenus = \App\Models\Menu::count();

        return Inertia::render('master/roles/index', [
            'roles' => $roles,
            'filters' => $request->only(['name']),
            'totalMenus' => $totalMenus,
        ]);
    }

    public function create()
    {
        return Inertia::render('master/roles/create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:roles,name'],
        ]);

        Role::create($validated);

        return redirect()->route('master.roles.index')
            ->with('success', 'Peran berhasil dibuat.');
    }

    public function edit(Role $role)
    {
        return Inertia::render('master/roles/edit', [
            'role' => $role,
        ]);
    }

    public function update(Request $request, Role $role)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:roles,name,' . $role->id],
        ]);

        $role->update($validated);

        return redirect()->route('master.roles.index')
            ->with('success', 'Peran berhasil diperbarui.');
    }

    public function destroy(Role $role)
    {
        if ($role->name === 'Admin') {
            return back()->with('error', 'Tidak dapat menghapus peran Admin.');
        }

        $cek = $role->users;

        if ($cek->count() > 0) {
            return back()->with('error', 'Tidak dapat menghapus peran yang memiliki pengguna.');
        }

        $role->delete();

        return redirect()->route('master.roles.index')
            ->with('success', 'Peran berhasil dihapus.');
    }
}

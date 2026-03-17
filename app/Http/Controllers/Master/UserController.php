<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $users = User::with('roles', 'jenjang')
            ->when($request->name, function ($query, $name) {
                $query->where('name', 'like', "%{$name}%");
            })
            ->when($request->email, function ($query, $email) {
                $query->where('email', 'like', "%{$email}%");
            })
            ->when($request->role, function ($query, $role) {
                $query->whereHas('roles', function ($q) use ($role) {
                    $q->where('name', 'like', "%{$role}%");
                });
            })
            ->when($request->jenjang, function ($query, $jenjang) {
                $query->whereHas('jenjang', function ($q) use ($jenjang) {
                    $q->where('jenjang', 'like', "%{$jenjang}%")
                      ->orWhere('nama_sekolah', 'like', "%{$jenjang}%");
                });
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('master/users/index', [
            'users' => $users,
            'filters' => $request->only(['name', 'email', 'role', 'jenjang']),
        ]);
    }

    public function create()
    {
        $roles = \App\Models\Role::all();
        $jenjangs = \App\Models\Jenjang::all();

        return Inertia::render('master/users/create', [
            'roles' => $roles,
            'jenjangs' => $jenjangs,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'role_id' => ['required', 'exists:roles,id'],
            'jenjang_id' => ['nullable', 'exists:jenjangs,id'],
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => \Illuminate\Support\Facades\Hash::make($validated['password']),
            'jenjang_id' => $validated['jenjang_id'] ?? null,
        ]);

        $user->roles()->attach($validated['role_id']);

        return redirect()->route('master.users.index')
            ->with('success', 'Pengguna berhasil dibuat.');
    }

    public function edit(User $user)
    {
        $user->load('roles', 'jenjang');
        $roles = \App\Models\Role::all();
        $jenjangs = \App\Models\Jenjang::all();

        return Inertia::render('master/users/edit', [
            'user' => $user,
            'roles' => $roles,
            'jenjangs' => $jenjangs,
        ]);
    }

    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', \Illuminate\Validation\Rule::unique('users')->ignore($user->id)],
            'password' => ['nullable', 'string', 'min:8', 'confirmed'],
            'role_id' => ['required', 'exists:roles,id'],
            'jenjang_id' => ['nullable', 'exists:jenjangs,id'],
        ]);

        $user->update([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'jenjang_id' => $validated['jenjang_id'] ?? null,
        ]);

        if (!empty($validated['password'])) {
            $user->update(['password' => \Illuminate\Support\Facades\Hash::make($validated['password'])]);
        }

        $user->roles()->sync([$validated['role_id']]);

        return redirect()->route('master.users.index')
            ->with('success', 'Pengguna berhasil diperbarui.');
    }

    public function destroy(User $user)
    {
        if ($user->id === auth()->id()) {
            return back()->with('error', 'Tidak dapat menghapus diri sendiri.');
        }

        $user->delete();

        return redirect()->route('master.users.index')
            ->with('success', 'Pengguna berhasil dihapus.');
    }
}

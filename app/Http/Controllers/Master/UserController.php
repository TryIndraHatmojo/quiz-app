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
        $users = User::with('roles', 'jenjang', 'kelas', 'orangTua')
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
            ->when($request->kelas, function ($query, $kelas) {
                $query->whereHas('kelas', function ($q) use ($kelas) {
                    $q->where('nama_kelas', 'like', "%{$kelas}%");
                });
            })
            ->when($request->orangTua, function ($query, $orangTua) {
                $query->whereHas('orangTua', function ($q) use ($orangTua) {
                    $q->where('name', 'like', "%{$orangTua}%");
                });
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('master/users/index', [
            'users' => $users,
            'filters' => $request->only(['name', 'email', 'role', 'jenjang', 'kelas', 'orangTua']),
        ]);
    }

    public function create()
    {
        $roles = \App\Models\Role::all();
        $jenjangs = \App\Models\Jenjang::all();
        $kelases = \App\Models\Kelas::all();
        $orangTuas = User::whereHas('roles', function($q) {
            $q->where('name', 'Orang Tua');
        })->get();

        return Inertia::render('master/users/create', [
            'roles' => $roles,
            'jenjangs' => $jenjangs,
            'kelases' => $kelases,
            'orangTuas' => $orangTuas,
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
            'kelas_id' => ['nullable', 'exists:kelas,id'],
            'orang_tua_id' => ['nullable', 'exists:users,id'],
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => \Illuminate\Support\Facades\Hash::make($validated['password']),
            'jenjang_id' => $validated['jenjang_id'] ?? null,
            'kelas_id' => $validated['kelas_id'] ?? null,
            'orang_tua_id' => $validated['orang_tua_id'] ?? null,
        ]);

        $user->roles()->attach($validated['role_id']);

        return redirect()->route('master.users.index')
            ->with('success', 'Pengguna berhasil dibuat.');
    }

    public function edit(User $user)
    {
        $user->load('roles', 'jenjang', 'kelas', 'orangTua');
        $roles = \App\Models\Role::all();
        $jenjangs = \App\Models\Jenjang::all();
        $kelases = \App\Models\Kelas::all();
        $orangTuas = User::whereHas('roles', function($q) {
            $q->where('name', 'Orang Tua');
        })->get();

        return Inertia::render('master/users/edit', [
            'user' => $user,
            'roles' => $roles,
            'jenjangs' => $jenjangs,
            'kelases' => $kelases,
            'orangTuas' => $orangTuas,
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
            'kelas_id' => ['nullable', 'exists:kelas,id'],
            'orang_tua_id' => ['nullable', 'exists:users,id'],
        ]);

        $user->update([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'jenjang_id' => $validated['jenjang_id'] ?? null,
            'kelas_id' => $validated['kelas_id'] ?? null,
            'orang_tua_id' => $validated['orang_tua_id'] ?? null,
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

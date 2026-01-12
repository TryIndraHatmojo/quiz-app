<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class UserController extends Controller
{
    public function index()
    {
        $users = User::with('roles', 'jenjang')
            ->latest()
            ->paginate(10);

        return Inertia::render('master/users/index', [
            'users' => $users,
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
            ->with('success', 'User created successfully.');
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
            ->with('success', 'User updated successfully.');
    }

    public function destroy(User $user)
    {
        if ($user->id === auth()->id()) {
            return back()->with('error', 'Cannot delete yourself.');
        }

        $user->delete();

        return redirect()->route('master.users.index')
            ->with('success', 'User deleted successfully.');
    }
}

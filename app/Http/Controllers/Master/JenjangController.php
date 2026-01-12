<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Models\Jenjang;
use Illuminate\Http\Request;
use Inertia\Inertia;

class JenjangController extends Controller
{
    public function index()
    {
        $jenjangs = Jenjang::latest()
            ->paginate(10);

        return Inertia::render('master/jenjang/index', [
            'jenjangs' => $jenjangs,
        ]);
    }

    public function create()
    {
        return Inertia::render('master/jenjang/create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'jenjang' => ['required', 'string', 'max:255'],
            'nama_sekolah' => ['required', 'string', 'max:255'],
        ]);

        Jenjang::create($validated);

        return redirect()->route('master.jenjang.index')
            ->with('success', 'Data jenjang berhasil ditambahkan.');
    }

    public function edit(Jenjang $jenjang)
    {
        return Inertia::render('master/jenjang/edit', [
            'jenjang' => $jenjang,
        ]);
    }

    public function update(Request $request, Jenjang $jenjang)
    {
        $validated = $request->validate([
            'jenjang' => ['required', 'string', 'max:255'],
            'nama_sekolah' => ['required', 'string', 'max:255'],
        ]);

        $jenjang->update($validated);

        return redirect()->route('master.jenjang.index')
            ->with('success', 'Data jenjang berhasil diperbarui.');
    }

    public function destroy(Jenjang $jenjang)
    {
        // Check if jenjang has users
        $userCount = $jenjang->users()->count();

        if ($userCount > 0) {
            return back()->with('error', 'Tidak dapat menghapus jenjang yang masih memiliki siswa.');
        }

        $jenjang->delete();

        return redirect()->route('master.jenjang.index')
            ->with('success', 'Data jenjang berhasil dihapus.');
    }
}

<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Models\Kelas;
use App\Models\Jenjang;
use Illuminate\Http\Request;
use Inertia\Inertia;

class KelasController extends Controller
{
    public function index(Request $request)
    {
        $kelases = Kelas::with('jenjang')
            ->when($request->nama_kelas, function ($query, $nama_kelas) {
                $query->where('nama_kelas', 'like', "%{$nama_kelas}%");
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

        return Inertia::render('master/kelas/index', [
            'kelases' => $kelases,
            'filters' => $request->only(['nama_kelas', 'jenjang']),
        ]);
    }

    public function create()
    {
        $jenjangs = Jenjang::all();
        
        return Inertia::render('master/kelas/create', [
            'jenjangs' => $jenjangs,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama_kelas' => ['required', 'string', 'max:255'],
            'jenjang_id' => ['required', 'exists:jenjangs,id'],
        ]);

        Kelas::create($validated);

        return redirect()->route('master.kelas.index')
            ->with('success', 'Data kelas berhasil ditambahkan.');
    }

    public function edit(Kelas $kela)
    {
        $jenjangs = Jenjang::all();

        return Inertia::render('master/kelas/edit', [
            'kelasData' => $kela,
            'jenjangs' => $jenjangs,
        ]);
    }

    public function update(Request $request, Kelas $kela)
    {
        $validated = $request->validate([
            'nama_kelas' => ['required', 'string', 'max:255'],
            'jenjang_id' => ['required', 'exists:jenjangs,id'],
        ]);

        $kela->update($validated);

        return redirect()->route('master.kelas.index')
            ->with('success', 'Data kelas berhasil diperbarui.');
    }

    public function destroy(Kelas $kela)
    {
        if ($kela->users()->count() > 0) {
            return back()->with('error', 'Tidak dapat menghapus kelas yang masih memiliki pengguna.');
        }

        $kela->delete();

        return redirect()->route('master.kelas.index')
            ->with('success', 'Data kelas berhasil dihapus.');
    }
}

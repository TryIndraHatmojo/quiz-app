<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Models\Role;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RoleController extends Controller
{
    public function index()
    {
        $roles = Role::latest()
            ->paginate(10);

        return Inertia::render('master/roles/index', [
            'roles' => $roles,
        ]);
    }
}

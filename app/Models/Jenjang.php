<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Jenjang extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'jenjang',
        'nama_sekolah',
    ];

    /**
     * Get the users for the jenjang.
     */
    public function users()
    {
        return $this->hasMany(User::class);
    }
}

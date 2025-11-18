<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Question extends Model
{
    use HasFactory;

    protected $fillable = [
        'quiz_id','prompt','type','points','position',
    ];

    protected $casts = [
        'points' => 'integer',
        'position' => 'integer',
    ];

    public function quiz() {
        return $this->belongsTo(Quiz::class);
    }

    public function options() {
        return $this->hasMany(Option::class)->orderBy('position');
    }

    public function answers() {
        return $this->hasMany(QuestionAnswer::class);
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Option extends Model
{
    use HasFactory;

    protected $fillable = [
        'question_id','text','is_correct','position','explanation',
    ];

    protected $casts = [
        'is_correct' => 'boolean',
        'position' => 'integer',
    ];

    public function question() {
        return $this->belongsTo(Question::class);
    }

    public function chosenInAnswers() {
        return $this->belongsToMany(QuestionAnswer::class, 'answer_options')
            ->withTimestamps();
    }
}

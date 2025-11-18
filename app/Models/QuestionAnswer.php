<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class QuestionAnswer extends Model
{
    use HasFactory;

    protected $fillable = [
        'quiz_attempt_id','question_id','is_correct','points_awarded',
    ];

    protected $casts = [
        'is_correct' => 'boolean',
        'points_awarded' => 'integer',
    ];

    public function attempt() {
        return $this->belongsTo(QuizAttempt::class, 'quiz_attempt_id');
    }

    public function question() {
        return $this->belongsTo(Question::class);
    }

    public function selectedOptions() {
        return $this->belongsToMany(Option::class, 'answer_options')->withTimestamps();
    }
}

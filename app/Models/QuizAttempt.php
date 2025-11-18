<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class QuizAttempt extends Model
{
    use HasFactory;

    protected $fillable = [
        'quiz_id',
        'user_id',
        'started_at',
        'completed_at',
        'score',
        'max_score',
        'percentage',
        'time_taken_seconds',
        'status',
    ];

    protected $casts = [
        'started_at'   => 'datetime',
        'completed_at' => 'datetime',
        'score'        => 'integer',
        'max_score'    => 'integer',
        'percentage'   => 'float',
        'time_taken_seconds' => 'integer',
    ];

    /**
     * Get the quiz this attempt belongs to
     */
    public function quiz()
    {
        return $this->belongsTo(Quiz::class);
    }

    /**
     * Get the user who made this attempt
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get all answers for this attempt
     * This is the relationship the controller is looking for
     */
    public function answers()
    {
        return $this->hasMany(QuizAttemptAnswer::class, 'quiz_attempt_id');
    }

    /**
     * Legacy relationship (if you have QuestionAnswer model)
     * You can keep this for backwards compatibility or remove it
     */
    public function questionAnswers()
    {
        return $this->hasMany(QuestionAnswer::class);
    }
}
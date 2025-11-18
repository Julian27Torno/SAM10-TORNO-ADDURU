<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Question extends Model
{
    use HasFactory;

    protected $fillable = [
        'quiz_id',
        'prompt',
        'type',
        'points',
        'position',
        'explanation',
    ];

    protected $casts = [
        'points' => 'integer',
        'position' => 'integer',
    ];

    // Add these accessors to map to frontend expectations
    protected $appends = ['question_text', 'question_type', 'order'];

    /**
     * Accessor: map 'prompt' to 'question_text' for frontend
     */
    public function getQuestionTextAttribute()
    {
        return $this->prompt;
    }

    /**
     * Accessor: map 'type' to 'question_type' for frontend
     * Also converts 'multiple' to 'multiple_choice'
     */
    public function getQuestionTypeAttribute()
    {
        return match($this->type) {
            'multiple' => 'multiple_choice',
            'true_false' => 'true_false',
            'identification' => 'identification',
            default => $this->type,
        };
    }

    /**
     * Accessor: map 'position' to 'order' for frontend
     */
    public function getOrderAttribute()
    {
        return $this->position;
    }

    /**
     * Get the quiz this question belongs to
     */
    public function quiz()
    {
        return $this->belongsTo(Quiz::class);
    }

    /**
     * Get all options for this question
     */
    public function options()
    {
        return $this->hasMany(Option::class);
    }
}
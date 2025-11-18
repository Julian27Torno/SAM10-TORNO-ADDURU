<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Option extends Model
{
    use HasFactory;

    protected $fillable = [
        'question_id',
        'text',
        'is_correct',
        'position',
        'explanation',
    ];

    protected $casts = [
        'is_correct' => 'boolean',
        'position' => 'integer',
    ];

    // Add accessor to map to frontend expectations
    protected $appends = ['option_text'];

    /**
     * Accessor: map 'text' to 'option_text' for frontend
     */
    public function getOptionTextAttribute()
    {
        return $this->text;
    }

    /**
     * Get the question this option belongs to
     */
    public function question()
    {
        return $this->belongsTo(Question::class);
    }
}
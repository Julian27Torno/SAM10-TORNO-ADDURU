<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Str;

class Quiz extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id','title','slug','description','visibility', 'cover_image_url',
        'time_limit_seconds','shuffle_questions','shuffle_options',
        'max_attempts','total_points',
    ];

    protected $casts = [
        'shuffle_questions' => 'boolean',
        'shuffle_options'   => 'boolean',
        'time_limit_seconds'=> 'integer',
        'max_attempts'      => 'integer',
        'total_points'      => 'integer',
    ];

    public static function boot()
    {
        parent::boot();

        static::creating(function (Quiz $quiz) {
            if (empty($quiz->slug)) {
                $base = Str::slug($quiz->title);
                $slug = $base;
                $i = 1;
                while (static::where('slug', $slug)->exists()) {
                    $slug = $base.'-'.$i++;
                }
                $quiz->slug = $slug;
            }
        });

        // Keep total_points in sync
        static::saved(function (Quiz $quiz) {
            $sum = $quiz->questions()->sum('points');
            if ($quiz->total_points !== $sum) {
                $quiz->total_points = $sum;
                // avoid infinite loop by only saving quietly
                $quiz->saveQuietly();
            }
        });
    }

    public function author() {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function questions() {
        return $this->hasMany(Question::class)->orderBy('position');
    }

    public function attempts() {
        return $this->hasMany(QuizAttempt::class);
    }

    public function latestAttempt() {
        return $this->hasOne(QuizAttempt::class)
            ->ofMany('created_at', 'max') // Get the latest by creation date
            ->where('user_id', auth()->id()); // Filter by the current user
    }

    public function scopePublic($query) {
        return $query->where('visibility', 'public');
    }


      public function getQuestionsCountAttribute()
    {
        return $this->questions()->count(); // Return the number of related questions
    }
}

<?php

namespace Database\Factories;

use App\Models\Quiz;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Quiz>
 */
class QuizFactory extends Factory
{
    protected $model = Quiz::class;

    public function definition(): array
    {
        return [
            // Will be overridden in seeder when needed
            'user_id' => User::factory(),

            'title'       => fake()->sentence(3),
            'description' => fake()->optional()->paragraph(),
            'visibility'  => fake()->randomElement(['public', 'unlisted', 'private']),

            // If your migration has these columns they will just work;
            // if not, remove them.
            'time_limit_seconds' => null,
            'shuffle_questions'  => true,
            'shuffle_options'    => true,
            'max_attempts'       => null,
        ];
    }
}

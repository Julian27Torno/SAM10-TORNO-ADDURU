<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Quiz;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Main demo user you can log in with
        $demoUser = User::factory()->create([
            'name' => 'Demo Student',
            'email' => 'student@example.com',
            'password' => bcrypt('password'), // login: student@example.com / password
        ]);

        // Give the demo user some quizzes
        Quiz::factory()
            ->count(5)
            ->create([
                'user_id' => $demoUser->id,
                'visibility' => 'public',
            ]);

        // Some extra users with random quizzes
        User::factory(3)->create()->each(function (User $user) {
            Quiz::factory()
                ->count(fake()->numberBetween(2, 6))
                ->create([
                    'user_id' => $user->id,
                ]);
        });

        // If you later add QuizAttempt, Question, Option etc, you can seed them here too.
    }
}

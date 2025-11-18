import AppLayout from "@/layouts/app-layout";
import { Head, Link } from "@inertiajs/react";
import { type BreadcrumbItem } from "@/types";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
    CheckCircle2, 
    XCircle, 
    Clock, 
    Trophy,
    Target,
    ArrowLeft,
    RotateCcw,
    Home
} from "lucide-react";

// --- Types ---

type Option = {
    id: number;
    option_text: string;
    text: string;
    is_correct: boolean;
};

type Question = {
    id: number;
    question_text: string;
    prompt: string;
    question_type: string;
    type: string;
    points: number;
    options: Option[];
};

type Answer = {
    id: number;
    question_id: number;
    selected_option_id: number | null;
    answer_text: string | null;
    is_correct: boolean;
    points_earned: number;
    question: Question;
};

type QuizAttempt = {
    id: number;
    quiz_id: number;
    user_id: number;
    score: number;
    max_score: number;
    percentage: number;
    time_taken_seconds: number;
    status: string;
    started_at: string;
    completed_at: string;
    answers: Answer[];
    user: {
        id: number;
        name: string;
        email: string;
    };
};

type Quiz = {
    id: number;
    title: string;
    description: string;
    total_points: number;
    author: {
        id: number;
        name: string;
    };
};

interface ResultsProps {
    quiz: Quiz;
    attempt: QuizAttempt;
}

export default function Results({ quiz, attempt }: ResultsProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: "Dashboard", href: "/dashboard" },
        { title: "Quizzes", href: "/quizzes" },
        { title: quiz.title, href: `/quizzes/${quiz.id}` },
        { title: "Results", href: "#" },
    ];

    const correctAnswers = attempt.answers.filter(a => a.is_correct).length;
    const totalQuestions = attempt.answers.length;
    const isPerfectScore = attempt.percentage === 100;
    const isPassing = attempt.percentage >= 60;

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}m ${secs}s`;
    };

    const getScoreColor = () => {
        if (attempt.percentage >= 90) return "text-green-600 dark:text-green-400";
        if (attempt.percentage >= 70) return "text-blue-600 dark:text-blue-400";
        if (attempt.percentage >= 60) return "text-yellow-600 dark:text-yellow-400";
        return "text-red-600 dark:text-red-400";
    };

    const getScoreBadge = () => {
        if (attempt.percentage >= 90) return { text: "Excellent!", color: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300" };
        if (attempt.percentage >= 70) return { text: "Good Job!", color: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300" };
        if (attempt.percentage >= 60) return { text: "Passed", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300" };
        return { text: "Keep Practicing", color: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300" };
    };

    const scoreBadge = getScoreBadge();

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Results: ${quiz.title}`} />

            <div className="max-w-4xl mx-auto px-4">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Quiz Results</h1>
                    <p className="text-muted-foreground mt-1">{quiz.title}</p>
                </div>

                {/* Score Summary Card */}
                <Card className="mb-6 border-2">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <Trophy className="w-6 h-6 text-yellow-500" />
                                Your Score
                            </CardTitle>
                            <Badge className={scoreBadge.color}>{scoreBadge.text}</Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {/* Big Score Display */}
                            <div className="text-center py-6">
                                <div className={`text-6xl font-bold ${getScoreColor()}`}>
                                    {attempt.percentage.toFixed(1)}%
                                </div>
                                <p className="text-muted-foreground mt-2">
                                    {attempt.score} out of {attempt.max_score} points
                                </p>
                            </div>

                            {/* Progress Bar */}
                            <div className="space-y-2">
                                <Progress value={attempt.percentage} className="h-3" />
                                <div className="flex justify-between text-sm text-muted-foreground">
                                    <span>{correctAnswers} correct</span>
                                    <span>{totalQuestions - correctAnswers} incorrect</span>
                                </div>
                            </div>

                            <Separator />

                            {/* Stats Grid */}
                            <div className="grid grid-cols-3 gap-4 text-center">
                                <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                                    <div className="flex items-center justify-center gap-2 text-slate-600 dark:text-slate-400 mb-1">
                                        <Target className="w-4 h-4" />
                                        <span className="text-xs font-medium">Questions</span>
                                    </div>
                                    <div className="text-2xl font-bold">{totalQuestions}</div>
                                </div>
                                <div className="p-3 bg-green-50 dark:bg-green-950/30 rounded-lg">
                                    <div className="flex items-center justify-center gap-2 text-green-600 dark:text-green-400 mb-1">
                                        <CheckCircle2 className="w-4 h-4" />
                                        <span className="text-xs font-medium">Correct</span>
                                    </div>
                                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">{correctAnswers}</div>
                                </div>
                                <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                                    <div className="flex items-center justify-center gap-2 text-blue-600 dark:text-blue-400 mb-1">
                                        <Clock className="w-4 h-4" />
                                        <span className="text-xs font-medium">Time</span>
                                    </div>
                                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{formatTime(attempt.time_taken_seconds)}</div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3 pt-2">
                                <Link href={`/quizzes/${quiz.id}`} className="flex-1">
                                    <Button variant="outline" className="w-full">
                                        <ArrowLeft className="w-4 h-4 mr-2" />
                                        Back to Quiz
                                    </Button>
                                </Link>
                                <Link href={`/quizzes/${quiz.id}/attempt/start`} className="flex-1">
                                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                                        <RotateCcw className="w-4 h-4 mr-2" />
                                        Try Again
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Question Review */}
                <div className="mb-6">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5" />
                        Answer Review
                    </h2>

                    <div className="space-y-4">
                        {attempt.answers.map((answer, index) => {
                            const question = answer.question;
                            const questionText = question.question_text || question.prompt;
                            const questionType = question.question_type || question.type;
                            const isCorrect = answer.is_correct;

                            return (
                                <Card key={answer.id} className={`border-l-4 ${isCorrect ? 'border-l-green-500' : 'border-l-red-500'}`}>
                                    <CardHeader className="pb-3">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <Badge variant="outline" className="font-semibold">
                                                        Question {index + 1}
                                                    </Badge>
                                                    <Badge className={isCorrect ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300" : "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300"}>
                                                        {isCorrect ? (
                                                            <><CheckCircle2 className="w-3 h-3 mr-1" /> Correct</>
                                                        ) : (
                                                            <><XCircle className="w-3 h-3 mr-1" /> Incorrect</>
                                                        )}
                                                    </Badge>
                                                    <span className="text-sm text-muted-foreground">
                                                        {answer.points_earned} / {question.points} points
                                                    </span>
                                                </div>
                                                <h3 className="text-base font-medium">{questionText}</h3>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        {questionType === 'identification' ? (
                                            <div className="space-y-3">
                                                {/* User's Answer */}
                                                <div className={`p-3 rounded-lg border-2 ${isCorrect ? 'bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-900' : 'bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-900'}`}>
                                                    <p className="text-sm font-medium text-muted-foreground mb-1">Your Answer:</p>
                                                    <p className="font-medium">{answer.answer_text || '(No answer provided)'}</p>
                                                </div>

                                                {/* Correct Answer */}
                                                {!isCorrect && (
                                                    <div className="p-3 rounded-lg border-2 bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-900">
                                                        <p className="text-sm font-medium text-muted-foreground mb-1">Correct Answer:</p>
                                                        <p className="font-medium text-green-700 dark:text-green-400">
                                                            {question.options.find(opt => opt.is_correct)?.option_text || question.options.find(opt => opt.is_correct)?.text}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                {question.options.map((option) => {
                                                    const optionText = option.option_text || option.text;
                                                    const isUserAnswer = option.id === answer.selected_option_id;
                                                    const isCorrectOption = option.is_correct;

                                                    let bgClass = "bg-slate-50 border-slate-200 dark:bg-slate-900 dark:border-slate-700";
                                                    let icon = null;

                                                    if (isCorrectOption) {
                                                        bgClass = "bg-green-50 border-green-500 dark:bg-green-950/20 dark:border-green-600";
                                                        icon = <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />;
                                                    } else if (isUserAnswer && !isCorrectOption) {
                                                        bgClass = "bg-red-50 border-red-500 dark:bg-red-950/20 dark:border-red-600";
                                                        icon = <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />;
                                                    }

                                                    return (
                                                        <div
                                                            key={option.id}
                                                            className={`flex items-center gap-3 p-3 rounded-lg border-2 ${bgClass}`}
                                                        >
                                                            {icon}
                                                            <span className={`flex-1 ${isCorrectOption ? 'font-semibold' : ''}`}>
                                                                {optionText}
                                                            </span>
                                                            {isUserAnswer && (
                                                                <Badge variant="secondary" className="text-xs">
                                                                    Your Answer
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </div>

                {/* Bottom Actions */}
                <div className="flex gap-3 pb-8">
                    <Link href="/dashboard" className="flex-1">
                        <Button variant="outline" className="w-full">
                            <Home className="w-4 h-4 mr-2" />
                            Go to Dashboard
                        </Button>
                    </Link>
                    <Link href={`/quizzes/${quiz.id}/attempts`} className="flex-1">
                        <Button variant="outline" className="w-full">
                            View All Attempts
                        </Button>
                    </Link>
                </div>
            </div>
        </AppLayout>
    );
}
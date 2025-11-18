import AppLayout from "@/layouts/app-layout";
import { Head, router } from "@inertiajs/react";
import { type BreadcrumbItem } from "@/types";
import { useState, useEffect, useCallback } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { 
    Clock, 
    CheckCircle, 
    AlertCircle,
    ChevronLeft,
    ChevronRight,
    Send,
    Target,
    BookOpen,
    Sparkles,
    Zap,
    Trophy
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

// --- Types ---

type Option = {
    id: number;
    option_text: string;
    is_correct?: boolean;
};

type Question = {
    id: number;
    question_text: string;
    question_type: 'multiple_choice' | 'true_false' | 'identification';
    points: number;
    order: number;
    options: Option[];
};

type Quiz = {
    id: number;
    title: string;
    description: string;
    time_limit_seconds: number | null;
    questions: Question[];
};

type QuizAttempt = {
    id: number;
    quiz_id: number;
    status: 'in_progress' | 'completed';
    started_at: string;
    score?: number;
    max_score: number;
};

type UserAnswer = {
    question_id: number;
    selected_option_id?: number | null;
    answer_text?: string | null;
};

interface TakeProps {
    quiz: Quiz;
    attempt: QuizAttempt;
    userAnswers: Record<number, UserAnswer>;
}

export default function Take({ quiz, attempt, userAnswers }: TakeProps) {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<number, UserAnswer>>(() => {
        const initial: Record<number, UserAnswer> = {};
        Object.values(userAnswers).forEach(answer => {
            initial[answer.question_id] = answer;
        });
        return initial;
    });
    const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);

    const sortedQuestions = [...quiz.questions].sort((a, b) => a.order - b.order);
    const currentQuestion = sortedQuestions[currentQuestionIndex];
    const totalQuestions = sortedQuestions.length;
    const answeredCount = Object.keys(answers).filter(qId => {
        const answer = answers[parseInt(qId)];
        return answer?.selected_option_id !== null && answer?.selected_option_id !== undefined || 
               (answer?.answer_text && answer.answer_text.trim() !== '');
    }).length;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: "Dashboard", href: "/dashboard" },
        { title: "Quizzes", href: "/quizzes" },
        { title: quiz.title, href: `/quizzes/${quiz.id}` },
        { title: "Take Quiz", href: "#" },
    ];

    // Timer effect
    useEffect(() => {
        if (!quiz.time_limit_seconds) return;

        const startTime = new Date(attempt.started_at).getTime();
        const endTime = startTime + (quiz.time_limit_seconds * 1000);

        const updateTimer = () => {
            const now = Date.now();
            const remaining = Math.max(0, Math.floor((endTime - now) / 1000));
            setTimeRemaining(remaining);

            if (remaining === 0) {
                handleSubmit();
            }
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);

        return () => clearInterval(interval);
    }, [quiz.time_limit_seconds, attempt.started_at]);

    // Auto-save effect
    useEffect(() => {
        const saveTimeout = setTimeout(() => {
            saveAnswers();
        }, 3000);

        return () => clearTimeout(saveTimeout);
    }, [answers]);

   const saveAnswers = useCallback(async () => {
    if (Object.keys(answers).length === 0) return;
    
    setIsSaving(true);
    try {
        const response = await fetch(`/quizzes/${quiz.id}/attempt/${attempt.id}/answer`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
            },
            body: JSON.stringify({ answers }),
        });

        if (response.ok) {
            setLastSaved(new Date());
        } else {
            console.error('Failed to save answers:', response.statusText);
        }
    } catch (error) {
        console.error('Failed to save answers:', error);
    } finally {
        setIsSaving(false);
    }
}, [answers, quiz.id, attempt.id]);

    const handleAnswerChange = (questionId: number, value: string | number, type: 'option' | 'text') => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: {
                question_id: questionId,
                ...(type === 'option' 
                    ? { selected_option_id: value as number, answer_text: null }
                    : { answer_text: value as string, selected_option_id: null }
                )
            }
        }));
    };

    const handleSubmit = () => {
        if (isSubmitting) return;

        const unanswered = totalQuestions - answeredCount;
        if (unanswered > 0) {
            const confirmed = window.confirm(
                `You have ${unanswered} unanswered question(s). Are you sure you want to submit?`
            );
            if (!confirmed) return;
        }

        setIsSubmitting(true);
        router.post(
            `/quizzes/${quiz.id}/attempt/${attempt.id}/submit`,
            { answers },
            {
                onFinish: () => setIsSubmitting(false),
            }
        );
    };

    const goToQuestion = (index: number) => {
        if (index >= 0 && index < totalQuestions) {
            setCurrentQuestionIndex(index);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const progress = (answeredCount / totalQuestions) * 100;
    const currentAnswer = answers[currentQuestion.id];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Taking: ${quiz.title}`} />

            <div className="max-w-6xl mx-auto px-4">
                {/* Enhanced Header with Gradient */}
                <div className="mb-8 space-y-4">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg">
                                <BookOpen className="w-6 h-6" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                    {quiz.title}
                                </h1>
                                <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                                    <Target className="w-4 h-4" />
                                    Question {currentQuestionIndex + 1} of {totalQuestions}
                                </p>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                            {/* Timer with gradient */}
                            {timeRemaining !== null && (
                                <div className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold shadow-lg transition-all ${
                                    timeRemaining < 60 
                                        ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white animate-pulse' 
                                        : timeRemaining < 300
                                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
                                        : 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                                }`}>
                                    <Clock className="w-5 h-5" />
                                    <span className="font-mono text-lg">{formatTime(timeRemaining)}</span>
                                </div>
                            )}

                            {/* Enhanced Save Indicator */}
                            <div className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all ${
                                isSaving 
                                    ? 'bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300'
                                    : lastSaved
                                    ? 'bg-green-100 dark:bg-green-950/50 text-green-700 dark:text-green-300'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600'
                            }`}>
                                {isSaving ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                        <span className="text-sm">Saving...</span>
                                    </>
                                ) : lastSaved ? (
                                    <>
                                        <CheckCircle className="w-4 h-4" />
                                        <span className="text-sm">Auto-saved</span>
                                    </>
                                ) : (
                                    <span className="text-sm">Ready</span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Enhanced Progress Bar */}
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <Zap className="w-4 h-4 text-amber-500" />
                                <span className="text-sm font-semibold text-foreground">Your Progress</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                                    {answeredCount}
                                </span>
                                <span className="text-sm text-muted-foreground">/</span>
                                <span className="text-sm font-bold text-purple-600 dark:text-purple-400">
                                    {totalQuestions}
                                </span>
                                <span className="text-xs text-muted-foreground">completed</span>
                            </div>
                        </div>
                        <div className="relative">
                            <Progress value={progress} className="h-3 bg-slate-200 dark:bg-slate-800" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-[10px] font-bold text-white drop-shadow-md">
                                    {Math.round(progress)}%
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Enhanced Main Question Area */}
                    <div className="lg:col-span-3">
                        <Card className="border-2 border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
                            <CardHeader className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-950/30 dark:via-purple-950/30 dark:to-pink-950/30 pb-6 border-b-2">
                                <CardTitle className="flex items-start justify-between gap-4">
                                    <div className="flex items-start gap-3 flex-1">
                                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold text-sm shadow-md flex-shrink-0 mt-1">
                                            {currentQuestionIndex + 1}
                                        </div>
                                        <span className="text-xl font-bold leading-relaxed">{currentQuestion.question_text}</span>
                                    </div>
                                    <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-br from-orange-500 to-red-500 text-white rounded-xl shadow-md flex-shrink-0">
                                        <Trophy className="w-4 h-4" />
                                        <span className="text-sm font-bold">{currentQuestion.points} pts</span>
                                    </div>
                                </CardTitle>
                            </CardHeader>

                            <CardContent className="p-8 space-y-6">
                                {/* Enhanced Answer Options */}
                                {currentQuestion.question_type === 'multiple_choice' || currentQuestion.question_type === 'true_false' ? (
                                    <RadioGroup
                                        value={currentAnswer?.selected_option_id?.toString() || ''}
                                        onValueChange={(value) => handleAnswerChange(currentQuestion.id, parseInt(value), 'option')}
                                    >
                                        <div className="space-y-3">
                                            {currentQuestion.options.map((option, idx) => (
                                                <div
                                                    key={option.id}
                                                    className={`flex items-center space-x-4 p-5 rounded-xl border-2 transition-all cursor-pointer group ${
                                                        currentAnswer?.selected_option_id === option.id
                                                            ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 shadow-md scale-[1.02]'
                                                            : 'border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-slate-50 dark:hover:bg-slate-900 hover:scale-[1.01]'
                                                    }`}
                                                >
                                                    <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm border-2 transition-all ${
                                                        currentAnswer?.selected_option_id === option.id
                                                            ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white border-transparent shadow-md'
                                                            : 'border-slate-300 dark:border-slate-600 text-slate-500 group-hover:border-blue-400'
                                                    }`}>
                                                        {String.fromCharCode(65 + idx)}
                                                    </div>
                                                    <RadioGroupItem 
                                                        value={option.id.toString()} 
                                                        id={`option-${option.id}`}
                                                        className="sr-only"
                                                    />
                                                    <Label 
                                                        htmlFor={`option-${option.id}`} 
                                                        className={`flex-1 cursor-pointer text-base font-medium transition-colors ${
                                                            currentAnswer?.selected_option_id === option.id
                                                                ? 'text-blue-900 dark:text-blue-100'
                                                                : 'text-foreground'
                                                        }`}
                                                    >
                                                        {option.option_text}
                                                    </Label>
                                                </div>
                                            ))}
                                        </div>
                                    </RadioGroup>
                                ) : (
                                    <div className="space-y-3">
                                        <Label htmlFor="answer-text" className="text-base font-bold flex items-center gap-2">
                                            <Sparkles className="w-4 h-4 text-purple-600" />
                                            Your Answer
                                        </Label>
                                        <Input
                                            id="answer-text"
                                            type="text"
                                            placeholder="Type your answer here..."
                                            value={currentAnswer?.answer_text || ''}
                                            onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value, 'text')}
                                            className="text-lg p-6 border-2 focus-visible:ring-purple-500 focus-visible:border-purple-500"
                                        />
                                        <p className="text-xs text-muted-foreground">Press Enter or click Next to continue</p>
                                    </div>
                                )}

                                {/* Enhanced Navigation Buttons */}
                                <div className="flex items-center justify-between pt-6 border-t-2">
                                    <Button
                                        variant="outline"
                                        size="lg"
                                        onClick={() => goToQuestion(currentQuestionIndex - 1)}
                                        disabled={currentQuestionIndex === 0}
                                        className="border-2 font-semibold"
                                    >
                                        <ChevronLeft className="w-5 h-5 mr-2" />
                                        Previous
                                    </Button>

                                    {currentQuestionIndex === totalQuestions - 1 ? (
                                        <Button
                                            onClick={handleSubmit}
                                            disabled={isSubmitting}
                                            size="lg"
                                            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all font-semibold px-8"
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                                    Submitting...
                                                </>
                                            ) : (
                                                <>
                                                    <Send className="w-5 h-5 mr-2" />
                                                    Submit Quiz
                                                </>
                                            )}
                                        </Button>
                                    ) : (
                                        <Button
                                            onClick={() => goToQuestion(currentQuestionIndex + 1)}
                                            size="lg"
                                            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all font-semibold"
                                        >
                                            Next Question
                                            <ChevronRight className="w-5 h-5 ml-2" />
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Enhanced Question Navigator Sidebar */}
                    <div className="lg:col-span-1">
                        <Card className="sticky top-4 border-2 border-slate-200 dark:border-slate-800 shadow-xl">
                            <CardHeader className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border-b-2">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <div className="p-1.5 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-lg">
                                        <Target className="w-4 h-4" />
                                    </div>
                                    Questions
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4">
                                <div className="grid grid-cols-4 lg:grid-cols-3 gap-2 mb-6">
                                    {sortedQuestions.map((question, index) => {
                                        const isAnswered = answers[question.id]?.selected_option_id !== undefined && answers[question.id]?.selected_option_id !== null ||
                                                         (answers[question.id]?.answer_text && answers[question.id]?.answer_text?.trim() !== '');
                                        const isCurrent = index === currentQuestionIndex;

                                        return (
                                            <button
                                                key={question.id}
                                                onClick={() => goToQuestion(index)}
                                                className={`
                                                    aspect-square rounded-xl font-bold text-sm transition-all
                                                    ${isCurrent 
                                                        ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-lg scale-110 ring-2 ring-blue-400 ring-offset-2' 
                                                        : isAnswered
                                                            ? 'bg-gradient-to-br from-green-500 to-emerald-500 text-white shadow-md hover:scale-105'
                                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:scale-105'
                                                    }
                                                `}
                                            >
                                                {index + 1}
                                            </button>
                                        );
                                    })}
                                </div>

                                <div className="space-y-3 text-xs pt-4 border-t-2">
                                    <p className="font-semibold text-foreground mb-2">Legend:</p>
                                    <div className="flex items-center gap-2">
                                        <div className="w-5 h-5 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 shadow-sm" />
                                        <span className="text-muted-foreground">Current</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-5 h-5 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 shadow-sm" />
                                        <span className="text-muted-foreground">Answered</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-5 h-5 rounded-lg bg-slate-100 dark:bg-slate-800" />
                                        <span className="text-muted-foreground">Not yet</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Enhanced Warning Alert */}
                {answeredCount < totalQuestions && (
                    <Alert className="mt-6 border-2 border-amber-200 dark:border-amber-800 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30">
                        <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                        <AlertDescription className="text-amber-900 dark:text-amber-100 font-medium">
                            You have <span className="font-bold">{totalQuestions - answeredCount}</span> unanswered question(s). 
                            Make sure to complete all questions before submitting!
                        </AlertDescription>
                    </Alert>
                )}
            </div>
        </AppLayout>
    );
}
import AppLayout from "@/layouts/app-layout";
import { Head, Link } from "@inertiajs/react";
import { type BreadcrumbItem } from "@/types";
import { dashboard as dashboardRoute } from "@/routes";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
    Play, 
    ListChecks, 
    Target, 
    Clock, 
    Users,
    AlertTriangle,
    CheckCircle,
    Edit3,
    Sparkles,
    Trophy,
    Zap,
    BookOpen,
    Eye,
    BarChart3,
} from "lucide-react";



type QuizAttempt = {
    id: number;
    score: number;
    max_score: number;
    status: 'completed' | 'in_progress' | 'abandoned';
    created_at: string;
};

type Quiz = {
    id: number;
    title: string;
    description: string;
    cover_image_url: string | null;
    total_points: number | null;
    questions_count: number | null;
    visibility: "public" | "unlisted" | "private";
    time_limit_seconds: number | null;
    latest_attempt?: QuizAttempt | null;
    is_author: boolean;
};

interface ShowProps {
    quiz: Quiz;
}



const formatTimeLimit = (seconds: number | null) => {
    if (seconds === null || seconds === 0) return "No Time Limit";
    const minutes = Math.floor(seconds / 60);
    return `${minutes} Minutes`;
};

const getStatusBadge = (status: QuizAttempt['status']) => {
    switch (status) {
        case 'completed':
            return { 
                text: 'Completed', 
                gradient: 'from-green-500 to-emerald-500',
                bgClass: 'bg-gradient-to-r from-green-500 to-emerald-500',
                icon: CheckCircle 
            };
        case 'in_progress':
            return { 
                text: 'In Progress', 
                gradient: 'from-amber-500 to-orange-500',
                bgClass: 'bg-gradient-to-r from-amber-500 to-orange-500',
                icon: Clock 
            };
        case 'abandoned':
            return { 
                text: 'Abandoned', 
                gradient: 'from-red-500 to-rose-500',
                bgClass: 'bg-gradient-to-r from-red-500 to-rose-500',
                icon: AlertTriangle 
            };
        default:
            return { 
                text: 'Unknown', 
                gradient: 'from-slate-500 to-slate-600',
                bgClass: 'bg-gradient-to-r from-slate-500 to-slate-600',
                icon: AlertTriangle 
            };
    }
};

export default function Show({ quiz }: ShowProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: "Dashboard", href: dashboardRoute().url },
        { title: quiz.is_author ? "My Quizzes" : "Public Quizzes", href: quiz.is_author ? "/my/quizzes" : "/quizzes" },
        { title: quiz.title, href: `/quizzes/${quiz.id}` },
    ];

    const actualQuestionCount = quiz.questions_count ?? 0;
    
    const isQuizReady = actualQuestionCount > 0;
    const latestAttempt = quiz.latest_attempt;
    const hasActiveAttempt = latestAttempt && latestAttempt.status === 'in_progress';
    
    const actionHref = hasActiveAttempt 
        ? `/quizzes/${quiz.id}/attempt/${latestAttempt.id}/continue`
        : isQuizReady ? `/quizzes/${quiz.id}/attempt/start` : '#';

    // Calculate score percentage if completed
    const scorePercentage = latestAttempt?.status === 'completed' 
        ? Math.round((latestAttempt.score / latestAttempt.max_score) * 100)
        : null;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Details: ${quiz.title}`} />

            <div className="max-w-5xl mx-auto px-4">
                
              
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg">
                            <BookOpen className="w-6 h-6" />
                        </div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            {quiz.title}
                        </h1>
                    </div>
                    <p className="text-muted-foreground ml-15">Review quiz details and start your learning journey</p>
                </div>
                
                <Card className="shadow-xl border-2 border-slate-200 dark:border-slate-800 overflow-hidden">
                    <CardHeader className="p-0">
                       
                        <div className="relative h-56 rounded-t-lg bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 dark:from-blue-950 dark:via-purple-950 dark:to-pink-950 overflow-hidden">
                            {quiz.cover_image_url ? (
                                <>
                                    <img src={quiz.cover_image_url} alt="Cover" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                                </>
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center">
                                    <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-lg mb-3">
                                        <ListChecks className="w-10 h-10 text-blue-500" />
                                    </div>
                                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Quiz Preview</span>
                                </div>
                            )}
                            
                          
                            {latestAttempt?.status === 'completed' && scorePercentage !== null && (
                                <div className="absolute top-4 right-4">
                                    <div className={`flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-md shadow-lg ${
                                        scorePercentage >= 90 ? 'bg-green-500/90' :
                                        scorePercentage >= 75 ? 'bg-blue-500/90' :
                                        scorePercentage >= 60 ? 'bg-amber-500/90' :
                                        'bg-red-500/90'
                                    }`}>
                                        <Trophy className="w-5 h-5 text-white" />
                                        <span className="font-bold text-white text-base">
                                            {scorePercentage}%
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardHeader>

                    <CardContent className="p-8 space-y-8">
                        
                      
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-lg shadow-md">
                                    <Sparkles className="w-4 h-4" />
                                </div>
                                <h2 className="text-xl font-bold">About this Quiz</h2>
                            </div>
                            <p className="text-muted-foreground text-base leading-relaxed pl-1">
                                {quiz.description || "The creator has not provided a description for this quiz."}
                            </p>
                        </div>

                        <Separator />

                      
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <div className="p-2 bg-gradient-to-br from-orange-500 to-red-500 text-white rounded-lg shadow-md">
                                    <BarChart3 className="w-4 h-4" />
                                </div>
                                <h3 className="text-lg font-bold">Quiz Stats</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <DetailCard 
                                    icon={ListChecks} 
                                    title="Questions" 
                                    value={String(quiz.questions_count ?? 0)}
                                    gradient="from-purple-500 to-pink-500"
                                />
                                <DetailCard 
                                    icon={Target} 
                                    title="Total Points" 
                                    value={String(quiz.total_points ?? 0)}
                                    gradient="from-orange-500 to-red-500"
                                />
                                <DetailCard 
                                    icon={Clock} 
                                    title="Time Limit" 
                                    value={formatTimeLimit(quiz.time_limit_seconds)}
                                    gradient="from-blue-500 to-cyan-500"
                                />
                            </div>
                        </div>
                        
                        {/* Enhanced Latest Attempt Status */}
                        {latestAttempt && (
                            <>
                                <Separator />
                                <div className="p-6 rounded-xl border-2 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border-slate-200 dark:border-slate-700 shadow-md">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 text-white rounded-lg shadow-md">
                                            <Eye className="w-4 h-4" />
                                        </div>
                                        <h3 className="text-lg font-bold">Your Latest Attempt</h3>
                                    </div>
                                    <AttemptStatus latestAttempt={latestAttempt} />
                                </div>
                            </>
                        )}

                        {/* Enhanced Action Buttons */}
                        <div className="pt-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Primary Action */}
                                {quiz.is_author ? (
                                    <Link href={`/quizzes/${quiz.id}/edit`}>
                                        <Button size="lg" className="w-full bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white shadow-lg hover:shadow-xl transition-all font-semibold">
                                            <Edit3 className="w-5 h-5 mr-2" />
                                            Manage & Edit Quiz
                                        </Button>
                                    </Link>
                                ) : (
                                    <Link href={actionHref}>
                                        <Button 
                                            size="lg" 
                                            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                                            disabled={!isQuizReady}
                                        >
                                            <Play className="w-5 h-5 mr-2 fill-current" />
                                            {hasActiveAttempt ? "Continue Your Attempt" : "Start Quiz Now"}
                                        </Button>
                                    </Link>
                                )}
                                
                                {/* Secondary Action */}
                                <Link href={`/quizzes/${quiz.id}/attempts`}>
                                    <Button 
                                        size="lg" 
                                        variant="outline" 
                                        className="w-full border-2 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"
                                    >
                                        <Users className="w-5 h-5 mr-2" />
                                        View All Attempts
                                    </Button>
                                </Link>
                            </div>
                        </div>

                        {/* Warning Message */}
                        {!isQuizReady && !quiz.is_author && (
                            <div className="p-5 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30 border-2 border-red-200 dark:border-red-800 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-500 text-white flex-shrink-0">
                                        <AlertTriangle className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-red-900 dark:text-red-200 text-base">
                                            Quiz Not Available
                                        </p>
                                        <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                                            This quiz currently has no questions and cannot be started.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}




const DetailCard = ({ 
    icon: Icon, 
    title, 
    value, 
    gradient 
}: { 
    icon: React.ElementType, 
    title: string, 
    value: string, 
    gradient: string 
}) => (
    <div className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${gradient} p-5 shadow-lg transition-transform hover:scale-105`}>
        <div className="absolute inset-0 bg-white/10" />
        <div className="relative">
            <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                    <Icon className="w-5 h-5 text-white" />
                </div>
                <p className="text-xs font-bold text-white/90 uppercase tracking-wide">{title}</p>
            </div>
            <p className="text-3xl font-bold text-white mt-1">{value}</p>
        </div>
    </div>
);


const AttemptStatus = ({ latestAttempt }: { latestAttempt: QuizAttempt }) => {
    const { text, gradient, bgClass, icon: Icon } = getStatusBadge(latestAttempt.status);

    const isCompleted = latestAttempt.status === 'completed';
    const scorePercentage = isCompleted 
        ? Math.round((latestAttempt.score / latestAttempt.max_score) * 100)
        : null;

    return (
        <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4 flex-wrap">
                <div className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 ${bgClass} text-white shadow-md`}>
                    <Icon className="w-4 h-4" />
                    {text}
                </div>
                
                {isCompleted && scorePercentage !== null && (
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <Trophy className="w-5 h-5 text-amber-500" />
                            <span className="text-2xl font-bold text-foreground">
                                {scorePercentage}%
                            </span>
                        </div>
                        <div className="h-8 w-px bg-slate-300 dark:bg-slate-600" />
                        <span className="text-base font-semibold text-muted-foreground">
                            {latestAttempt.score} / {latestAttempt.max_score} points
                        </span>
                    </div>
                )}
            </div>
            
            <Link href={isCompleted 
                ? `/quizzes/${latestAttempt.id}/results` 
                : `/quizzes/${latestAttempt.id}/attempt/${latestAttempt.id}/continue`
            }>
                <Button 
                    variant={isCompleted ? "default" : "outline"}
                    size="lg"
                    className={isCompleted 
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg font-semibold"
                        : "border-2 font-semibold"
                    }
                >
                    {isCompleted ? (
                        <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            View Results
                        </>
                    ) : (
                        <>
                            <Zap className="w-4 h-4 mr-2" />
                            Resume Quiz
                        </>
                    )}
                </Button>
            </Link>
        </div>
    );
};
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
} from "lucide-react";

// --- Types ---

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
    total_points: number | null; // Nullable for safe access
    questions_count: number | null; // Nullable for safe access
    visibility: "public" | "unlisted" | "private";
    time_limit_seconds: number | null;
    latest_attempt?: QuizAttempt | null;
    is_author: boolean;
};

interface ShowProps {
    quiz: Quiz;
}

// --- Helper Functions ---

const formatTimeLimit = (seconds: number | null) => {
    if (seconds === null || seconds === 0) return "No Time Limit";
    const minutes = Math.floor(seconds / 60);
    return `${minutes} Minutes`;
};

const getStatusBadge = (status: QuizAttempt['status']) => {
    switch (status) {
        case 'completed':
            return { text: 'Completed', className: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300', icon: CheckCircle };
        case 'in_progress':
            return { text: 'In Progress', className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300', icon: Clock };
        case 'abandoned':
            return { text: 'Abandoned', className: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300', icon: AlertTriangle };
        default:
            return { text: 'Unknown', className: 'bg-slate-100 text-slate-700', icon: AlertTriangle };
    }
};

export default function Show({ quiz }: ShowProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: "Dashboard", href: dashboardRoute().url },
        { title: quiz.is_author ? "My Quizzes" : "Public Quizzes", href: quiz.is_author ? "/my/quizzes" : "/quizzes" },
        { title: quiz.title, href: `/quizzes/${quiz.id}` },
    ];

    // Use nullish coalescing for safe access
    const actualQuestionCount = quiz.questions_count ?? 0;
    
    const isQuizReady = actualQuestionCount > 0;
    const latestAttempt = quiz.latest_attempt;
    const hasActiveAttempt = latestAttempt && latestAttempt.status === 'in_progress';
    
    const actionHref = hasActiveAttempt 
        ? `/quizzes/${quiz.id}/attempt/${latestAttempt.id}/continue`
        : isQuizReady ? `/quizzes/${quiz.id}/attempt/start` : '#';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Details: ${quiz.title}`} />

            {/* Centralized container for desktop view */}
            <div className="max-w-4xl mx-auto px-4">
                
                {/* Header Section */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">{quiz.title}</h1>
                    <p className="text-muted-foreground mt-1">Quiz Details and Overview</p>
                </div>
                
                <Card className="shadow-lg border-slate-200 dark:border-slate-800">
                    <CardHeader className="p-0">
                        {/* Cover Image Placeholder */}
                        <div className="h-48 rounded-t-lg bg-gradient-to-br from-sky-50 to-sky-100 dark:from-slate-900 dark:to-slate-800 overflow-hidden">
                            {quiz.cover_image_url ? (
                                <img src={quiz.cover_image_url} alt="Cover" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <ListChecks className="w-12 h-12 text-sky-400 opacity-50" />
                                </div>
                            )}
                        </div>
                    </CardHeader>

                    <CardContent className="p-6 space-y-8">
                        
                        {/* Quiz Description */}
                        <div>
                            <h2 className="text-xl font-semibold mb-2">About this Quiz</h2>
                            <p className="text-muted-foreground">{quiz.description || "The creator has not provided a description for this quiz."}</p>
                        </div>

                        <Separator />

                        {/* Rules and Details Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <DetailCard 
                                icon={ListChecks} 
                                title="Questions" 
                                value={String(quiz.questions_count ?? 0)} // ✅ Safe Accessor & String Conversion
                                color="text-purple-600 bg-purple-50 dark:bg-purple-950/30"
                            />
                            <DetailCard 
                                icon={Target} 
                                title="Total Points" 
                                value={String(quiz.total_points ?? 0)} // ✅ Safe Accessor & String Conversion
                                color="text-orange-600 bg-orange-50 dark:bg-orange-950/30"
                            />
                            <DetailCard 
                                icon={Clock} 
                                title="Time Limit" 
                                value={formatTimeLimit(quiz.time_limit_seconds)} 
                                color="text-sky-600 bg-sky-50 dark:bg-sky-950/30"
                            />
                        </div>
                        
                        {/* Latest Attempt Status */}
                        {latestAttempt && (
                            <>
                                <Separator />
                                <div className="p-4 rounded-lg border bg-slate-50 dark:bg-slate-900">
                                    <h3 className="text-md font-semibold mb-2 flex items-center gap-2">
                                        <Users className="w-4 h-4 text-slate-500" /> Your Latest Attempt
                                    </h3>
                                    <AttemptStatus latestAttempt={latestAttempt} />
                                </div>
                            </>
                        )}

                        {/* Action Buttons Section - Improved Desktop Layout */}
                        <div className="pt-4 flex flex-col sm:flex-row gap-4">
                            {/* Primary Action: Edit (if author) or Start/Continue */}
                            {quiz.is_author ? (
                                <Link href={`/quizzes/${quiz.id}/edit`} className="sm:w-1/2">
                                    <Button size="lg" className="w-full bg-slate-600 hover:bg-slate-700 text-white gap-2">
                                        <Edit3 className="w-5 h-5" />
                                        Manage & Edit
                                    </Button>
                                </Link>
                            ) : (
                                <Link href={actionHref} className="sm:w-1/2">
                                    <Button 
                                        size="lg" 
                                        className="w-full bg-green-600 hover:bg-green-700 text-white gap-2"
                                        disabled={!isQuizReady}
                                    >
                                        <Play className="w-5 h-5 fill-current" />
                                        {hasActiveAttempt ? "Continue Attempt" : "Start Quiz"}
                                    </Button>
                                </Link>
                            )}
                            
                            {/* Secondary Action: View Attempts (for all users) */}
                            <Link href={`/quizzes/${quiz.id}/attempts`} className="sm:w-1/2">
                                <Button size="lg" variant="outline" className="w-full">
                                    <Users className="w-5 h-5 mr-2" />
                                    View Attempts
                                </Button>
                            </Link>

                        </div>

                        {!isQuizReady && !quiz.is_author && (
                            <div className="text-center p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-lg mt-4">
                                <p className="font-semibold text-red-800 dark:text-red-300 text-sm">
                                    <AlertTriangle className="w-4 h-4 inline mr-1" /> This quiz currently has no questions and cannot be started.
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

// --- Sub-Components ---

// Reusable Detail Card
const DetailCard = ({ icon: Icon, title, value, color }: { icon: React.ElementType, title: string, value: string, color: string }) => (
    <div className={`p-4 rounded-xl flex items-center gap-4 border ${color}`}>
        <div className={`p-2 rounded-full ${color.replace('text', 'bg').replace('-600', '-100').replace('-50', '-50')}`}>
            <Icon className={`w-5 h-5 ${color.split(' ')[0]}`} />
        </div>
        <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="font-bold text-lg leading-tight">{value}</p>
        </div>
    </div>
);

// Component to show latest attempt status
const AttemptStatus = ({ latestAttempt }: { latestAttempt: QuizAttempt }) => {
    const { text, className, icon: Icon } = getStatusBadge(latestAttempt.status);

    const isCompleted = latestAttempt.status === 'completed';

    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className={`px-3 py-1.5 rounded-lg text-sm font-semibold flex items-center gap-2 ${className}`}>
                    <Icon className="w-4 h-4" />
                    {text}
                </div>
                {isCompleted && (
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                        {latestAttempt.score} / {latestAttempt.max_score}
                    </span>
                )}
            </div>
            
            <Link href={isCompleted 
                ? `/quizzes/${latestAttempt.id}/results` 
                : `/quizzes/${latestAttempt.id}/attempt/${latestAttempt.id}/continue` // Assuming the attempt ID is part of the route
            }>
                <Button variant="outline" size="sm" className="h-8">
                    {isCompleted ? 'View Results' : 'Resume'}
                </Button>
            </Link>
        </div>
    );
};

import AppLayout from "@/layouts/app-layout";
import { Head, Link } from "@inertiajs/react";
import { type BreadcrumbItem } from "@/types";
import { dashboard as dashboardRoute } from "@/routes";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Plus, NotebookText, Users, Image as ImageIcon, Edit3, Play, Award, Clock, Target, ListChecks, Sparkles, TrendingUp, Zap, BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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
    attempts_count?: number;
    total_points: number;
    questions_count?: number;
    latest_attempt?: QuizAttempt | null;
    visibility: "public" | "unlisted" | "private";
    created_at: string;
};

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

interface PaginatedData {
    data: Quiz[];
    links: PaginationLink[];
    current_page: number;
    last_page: number;
    total: number;
}

interface MineProps {
    quizzes: PaginatedData;
}

// --- Component Data ---

const breadcrumbs: BreadcrumbItem[] = [
    { title: "Dashboard", href: dashboardRoute().url },
    { title: "My Quizzes", href: "/my/quizzes" },
];

// --- Main Component ---

export default function Mine({ quizzes }: MineProps) {
    const quizList = quizzes.data;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="My Quizzes • StudyBuddy" />

            {/* Page header with gradient accent */}
            <div className="mb-8">
                <div className="flex items-center justify-between gap-2">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg">
                                <BookOpen className="w-5 h-5" />
                            </div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                My Quizzes
                            </h1>
                        </div>
                        <p className="text-sm text-muted-foreground ml-13">
                            Keep learning and growing with your personalized quizzes
                        </p>
                    </div>
                    <Link href="/quizzes/create">
                        <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all">
                            <Sparkles className="w-4 h-4 mr-2" />
                            Create New Quiz
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Stats Overview Cards */}
            {quizList.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <Card className="border-2 border-blue-100 dark:border-blue-900/50 bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/20">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-blue-500 text-white shadow-md">
                                    <NotebookText className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Total Quizzes</p>
                                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{quizzes.total}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-2 border-purple-100 dark:border-purple-900/50 bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/30 dark:to-purple-900/20">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-purple-500 text-white shadow-md">
                                    <TrendingUp className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Completed</p>
                                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                                        {quizList.filter(q => q.latest_attempt?.status === 'completed').length}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-2 border-amber-100 dark:border-amber-900/50 bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-950/30 dark:to-amber-900/20">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-amber-500 text-white shadow-md">
                                    <Zap className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">In Progress</p>
                                    <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                                        {quizList.filter(q => q.latest_attempt?.status === 'in_progress').length}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Quizzes Grid Layout */}
            {quizList.length > 0 ? (
                <div className="space-y-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {quizList.map((quiz) => {
                            const percentageScore = quiz.latest_attempt?.status === 'completed' 
                                ? Math.round((quiz.latest_attempt.score / quiz.latest_attempt.max_score) * 100)
                                : null;
                            
                            return (
                                <Card
                                    key={quiz.id}
                                    className="group transition-all hover:shadow-xl hover:shadow-blue-100 dark:hover:shadow-blue-900/30 hover:-translate-y-1 flex flex-col h-full overflow-hidden border-2 border-slate-200 dark:border-slate-800"
                                >
                                    {/* Cover Image Section with Gradient Overlay */}
                                    <Link href={`/quizzes/${quiz.id}/edit`} className="block relative">
                                        <div className="relative h-44 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 dark:from-blue-950 dark:via-purple-950 dark:to-pink-950 border-b-2 border-slate-200 dark:border-slate-800 overflow-hidden">
                                            {quiz.cover_image_url ? (
                                                <>
                                                    <img
                                                        src={quiz.cover_image_url}
                                                        alt={`Cover for ${quiz.title}`}
                                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                                                </>
                                            ) : (
                                                <div className="w-full h-full flex flex-col items-center justify-center">
                                                    <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-lg mb-3">
                                                        <ImageIcon className="w-8 h-8 text-blue-500" />
                                                    </div>
                                                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">No Cover Image</span>
                                                </div>
                                            )}
                                            
                                            {/* Visibility Badge - Redesigned */}
                                            <div className="absolute top-3 right-3">
                                                <div className={`
                                                    px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg backdrop-blur-sm
                                                    ${quiz.visibility === 'public' ? 'bg-blue-500/90 text-white' : ''}
                                                    ${quiz.visibility === 'unlisted' ? 'bg-amber-500/90 text-white' : ''}
                                                    ${quiz.visibility === 'private' ? 'bg-slate-600/90 text-white' : ''}
                                                `}>
                                                    {quiz.visibility}
                                                </div>
                                            </div>

                                            {/* Score Badge Overlay - Only for completed quizzes */}
                                            {percentageScore !== null && (
                                                <div className="absolute bottom-3 left-3">
                                                    <div className={`
                                                        flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-md shadow-lg
                                                        ${percentageScore >= 90 ? 'bg-green-500/90' :
                                                        percentageScore >= 75 ? 'bg-blue-500/90' :
                                                        percentageScore >= 60 ? 'bg-amber-500/90' :
                                                        'bg-red-500/90'
                                                        }
                                                    `}>
                                                        <Award className="w-4 h-4 text-white" />
                                                        <span className="font-bold text-white text-sm">
                                                            {percentageScore}%
                                                        </span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </Link>

                                    <CardContent className="p-5 flex flex-col flex-grow bg-gradient-to-br from-slate-50/50 to-white dark:from-slate-900/50 dark:to-slate-950">
                                        <Link href={`/quizzes/${quiz.id}/edit`} className="block mb-4">
                                            <div className="space-y-2">
                                                <CardTitle className="text-lg font-bold leading-tight line-clamp-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 group-hover:bg-clip-text transition-all">
                                                    {quiz.title}
                                                </CardTitle>
                                                <CardDescription className="text-sm line-clamp-2 min-h-[40px]">
                                                    {quiz.description || "No description provided for this quiz."}
                                                </CardDescription>
                                            </div>
                                        </Link>

                                        {/* Stats Grid - Redesigned with gradients */}
                                        <div className="mt-auto space-y-3">
                                            <div className="grid grid-cols-2 gap-3">
                                                {/* Total Points */}
                                                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-orange-500 to-red-500 p-3 shadow-md">
                                                    <div className="absolute inset-0 bg-white/10" />
                                                    <div className="relative">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <Target className="w-4 h-4 text-white" />
                                                            <p className="text-[10px] font-bold text-white/90 uppercase tracking-wide">
                                                                Points
                                                            </p>
                                                        </div>
                                                        <p className="text-2xl font-bold text-white">
                                                            {quiz.total_points}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Questions Count */}
                                                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 p-3 shadow-md">
                                                    <div className="absolute inset-0 bg-white/10" />
                                                    <div className="relative">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <ListChecks className="w-4 h-4 text-white" />
                                                            <p className="text-[10px] font-bold text-white/90 uppercase tracking-wide">
                                                                Questions
                                                            </p>
                                                        </div>
                                                        <p className="text-2xl font-bold text-white">
                                                            {quiz.questions_count || 0}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Status Badge */}
                                            <div className="rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 p-3.5 border-2 border-slate-300 dark:border-slate-700">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">Status</span>
                                                    
                                                    {quiz.latest_attempt ? (
                                                        <div className="flex items-center gap-2">
                                                            {quiz.latest_attempt.status === 'completed' ? (
                                                                <div className="flex items-center gap-2 text-xs">
                                                                    <span className="font-semibold text-slate-600 dark:text-slate-400">
                                                                        Score: {quiz.latest_attempt.score}/{quiz.latest_attempt.max_score}
                                                                    </span>
                                                                </div>
                                                            ) : (
                                                                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-500 rounded-full">
                                                                    <Clock className="w-3.5 h-3.5 text-white" />
                                                                    <span className="font-bold text-white text-xs">In Progress</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs font-medium text-slate-500 dark:text-slate-500 italic">Not started</span>
                                                    )}
                                                </div>
                                            </div>

                                            <Separator />

                                            {/* Action Buttons - Redesigned */}
                                            <div className="flex gap-2">
                                                <Link href={`/quizzes/${quiz.id}/edit`} className="flex-1">
                                                    <Button variant="outline" className="w-full border-2 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-slate-400 dark:hover:border-slate-600 font-semibold transition-all">
                                                        <Edit3 className="w-4 h-4 mr-2" />
                                                        Edit
                                                    </Button>
                                                </Link>

                                                <Link href={`/quizzes/${quiz.id}`} className="flex-1">
                                                    <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-md hover:shadow-lg transition-all">
                                                        <Play className="w-4 h-4 mr-2 fill-current" />
                                                        Start Quiz
                                                    </Button>
                                                </Link>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>

                    {/* Pagination */}
                    {quizzes.links && quizzes.links.length > 3 && (
                        <div className="flex flex-wrap justify-center gap-2 mt-8">
                            {quizzes.links.map((link, i) => (
                                link.url ? (
                                    <Link
                                        key={i}
                                        href={link.url}
                                        className={`px-4 py-2 text-sm rounded-lg border-2 font-medium transition-all ${
                                            link.active
                                                ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white border-transparent shadow-md"
                                                : "bg-background border-input hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-slate-400"
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ) : (
                                    <span
                                        key={i}
                                        className="px-4 py-2 text-sm text-muted-foreground"
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                )
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                /* Empty State - Redesigned */
                <Card className="rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 shadow-none">
                    <CardContent className="p-12 text-center">
                        <div className="inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-950 dark:to-purple-950 text-blue-600 dark:text-blue-400 mb-4">
                            <NotebookText className="w-10 h-10" />
                        </div>
                        <CardTitle className="mt-4 text-2xl font-bold mb-2">
                            Start Your Learning Journey
                        </CardTitle>
                        <CardDescription className="mt-2 mb-6 text-base max-w-md mx-auto">
                            You haven't created any quizzes yet. Create your first quiz and begin studying smarter!
                        </CardDescription>
                        <Link href="/quizzes/create">
                            <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all">
                                <Sparkles className="w-5 h-5 mr-2" />
                                Create Your First Quiz
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            )}
        </AppLayout>
    );
}
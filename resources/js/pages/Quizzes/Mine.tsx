import AppLayout from "@/layouts/app-layout";
import { Head, Link } from "@inertiajs/react";
import { type BreadcrumbItem } from "@/types";
import { dashboard as dashboardRoute } from "@/routes";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Plus, NotebookText, Users, Image as ImageIcon, Edit3, Play, Award, Clock, Target, ListChecks } from "lucide-react";
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
    total_points: number; // ✅ Added total_points
    questions_count?: number; // ✅ Added for better stats
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

            {/* Page header */}
            <div className="mb-6 flex items-center justify-between gap-2">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        My Quizzes
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        View and manage the quizzes you have created.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Link href="/quizzes/create">
                        <Button size="sm" className="bg-sky-600 hover:bg-sky-700 text-white">
                            <Plus className="w-4 h-4 mr-1" />
                            New Quiz
                        </Button>
                    </Link>
                </div>
            </div>

            <Separator className="mb-6" />

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
                                    className="group transition-all hover:shadow-lg dark:hover:shadow-sky-900/40 flex flex-col h-full overflow-hidden border-slate-200 dark:border-slate-800"
                                >
                                    {/* Clickable Area for Editing (Top part) */}
                                    <Link href={`/quizzes/${quiz.id}/edit`} className="block relative group-hover:opacity-90 transition-opacity">
                                        {/* Cover Image Section */}
                                        <div className="relative h-40 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border-b border-slate-100 dark:border-slate-800 overflow-hidden">
                                            {quiz.cover_image_url ? (
                                                <img
                                                    src={quiz.cover_image_url}
                                                    alt={`Cover for ${quiz.title}`}
                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 dark:text-slate-700">
                                                    <ImageIcon className="w-10 h-10 mb-2" />
                                                    <span className="text-xs font-medium">No Cover Image</span>
                                                </div>
                                            )}
                                            
                                            {/* Visibility Badge */}
                                            <div className="absolute top-3 right-3">
                                                <span className={`
                                                    px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider shadow-sm
                                                    ${quiz.visibility === 'public' ? 'bg-sky-500 text-white' : ''}
                                                    ${quiz.visibility === 'unlisted' ? 'bg-amber-500 text-white' : ''}
                                                    ${quiz.visibility === 'private' ? 'bg-slate-600 text-white' : ''}
                                                `}>
                                                    {quiz.visibility}
                                                </span>
                                            </div>
                                        </div>
                                    </Link>

                                    <CardContent className="p-5 flex flex-col flex-grow">
                                        <Link href={`/quizzes/${quiz.id}/edit`} className="block mb-4">
                                            <div className="space-y-2">
                                                <CardTitle className="text-lg font-bold leading-tight line-clamp-1 group-hover:text-sky-600 transition-colors">
                                                    {quiz.title}
                                                </CardTitle>
                                                <CardDescription className="text-sm line-clamp-2 min-h-[40px]">
                                                    {quiz.description || "No description provided for this quiz."}
                                                </CardDescription>
                                            </div>
                                        </Link>

                                        {/* Stats Grid */}
                                        <div className="mt-auto space-y-3">
                                            {/* Quiz Info Stats */}
                                            <div className="grid grid-cols-2 gap-2">
                                                {/* Total Points */}
                                                <div className="flex items-center gap-2 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/30 dark:to-orange-900/20 p-2.5 rounded-lg border border-orange-200 dark:border-orange-800/30">
                                                    <div className="flex items-center justify-center w-8 h-8 bg-orange-500 rounded-md">
                                                        <Target className="w-4 h-4 text-white" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-[10px] font-semibold text-orange-700 dark:text-orange-400 uppercase tracking-wide">
                                                            Points
                                                        </p>
                                                        <p className="text-base font-bold text-orange-900 dark:text-orange-200">
                                                            {quiz.total_points}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Questions Count */}
                                                <div className="flex items-center gap-2 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/20 p-2.5 rounded-lg border border-purple-200 dark:border-purple-800/30">
                                                    <div className="flex items-center justify-center w-8 h-8 bg-purple-500 rounded-md">
                                                        <ListChecks className="w-4 h-4 text-white" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-[10px] font-semibold text-purple-700 dark:text-purple-400 uppercase tracking-wide">
                                                            Questions
                                                        </p>
                                                        <p className="text-base font-bold text-purple-900 dark:text-purple-200">
                                                            {quiz.questions_count || 0}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* User's Grade Status */}
                                            <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-lg border">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-muted-foreground font-medium text-xs">Your Status</span>
                                                    
                                                    {quiz.latest_attempt ? (
                                                        <div className="flex items-center gap-2">
                                                            {quiz.latest_attempt.status === 'completed' ? (
                                                                <>
                                                                    <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md ${
                                                                        percentageScore >= 90 ? 'bg-green-100 dark:bg-green-950/40' :
                                                                        percentageScore >= 75 ? 'bg-blue-100 dark:bg-blue-950/40' :
                                                                        percentageScore >= 60 ? 'bg-yellow-100 dark:bg-yellow-950/40' :
                                                                        'bg-red-100 dark:bg-red-950/40'
                                                                    }`}>
                                                                        <Award className={`w-3.5 h-3.5 ${
                                                                            percentageScore >= 90 ? 'text-green-600 dark:text-green-400' :
                                                                            percentageScore >= 75 ? 'text-blue-600 dark:text-blue-400' :
                                                                            percentageScore >= 60 ? 'text-yellow-600 dark:text-yellow-400' :
                                                                            'text-red-600 dark:text-red-400'
                                                                        }`} />
                                                                        <span className={`font-bold text-sm ${
                                                                            percentageScore >= 90 ? 'text-green-700 dark:text-green-300' :
                                                                            percentageScore >= 75 ? 'text-blue-700 dark:text-blue-300' :
                                                                            percentageScore >= 60 ? 'text-yellow-700 dark:text-yellow-300' :
                                                                            'text-red-700 dark:text-red-300'
                                                                        }`}>
                                                                            {percentageScore}%
                                                                        </span>
                                                                    </div>
                                                                    <span className="text-xs text-muted-foreground">
                                                                        ({quiz.latest_attempt.score}/{quiz.latest_attempt.max_score})
                                                                    </span>
                                                                </>
                                                            ) : (
                                                                <div className="flex items-center gap-1.5 px-2 py-1 bg-blue-100 dark:bg-blue-950/40 rounded-md">
                                                                    <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                                                                    <span className="font-medium text-blue-700 dark:text-blue-300 text-xs">In Progress</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-muted-foreground italic">Not yet taken</span>
                                                    )}
                                                </div>
                                            </div>

                                            <Separator />

                                            {/* Action Buttons */}
                                            <div className="flex gap-2">
                                                {/* Edit Button */}
                                                <Link href={`/quizzes/${quiz.id}/edit`} className="flex-1">
                                                    <Button variant="outline" className="w-full hover:bg-slate-50 dark:hover:bg-slate-900">
                                                        <Edit3 className="w-4 h-4 mr-2" />
                                                        Edit
                                                    </Button>
                                                </Link>

                                                {/* Take Quiz Button */}
                                                <Link href={`/quizzes/${quiz.id}`} className="flex-1">
                                                    <Button className="w-full bg-sky-600 hover:bg-sky-700 text-white">
                                                        <Play className="w-4 h-4 mr-2 fill-current" />
                                                        Take Quiz
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
                        <div className="flex flex-wrap justify-center gap-1 mt-8">
                            {quizzes.links.map((link, i) => (
                                link.url ? (
                                    <Link
                                        key={i}
                                        href={link.url}
                                        className={`px-4 py-2 text-sm rounded-md border transition-colors ${
                                            link.active
                                                ? "bg-sky-600 text-white border-sky-600"
                                                : "bg-background border-input hover:bg-accent hover:text-accent-foreground"
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ) : (
                                    <span
                                        key={i}
                                        className="px-4 py-2 text-sm text-muted-foreground border border-transparent"
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                )
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                /* Empty State */
                <Card className="rounded-2xl border border-dashed shadow-none p-10 text-center">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                        <NotebookText className="w-6 h-6" />
                    </div>
                    <CardTitle className="mt-4 text-xl font-semibold">
                        No Quizzes Found
                    </CardTitle>
                    <CardDescription className="mt-2 mb-4">
                        It looks like you haven't created any quizzes yet. Start now!
                    </CardDescription>
                    <Link href="/quizzes/create">
                        <Button className="bg-sky-600 hover:bg-sky-700 text-white">
                            <Plus className="w-4 h-4 mr-1" />
                            Create Your First Quiz
                        </Button>
                    </Link>
                </Card>
            )}
        </AppLayout>
    );
}
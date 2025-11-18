import AppLayout from "@/layouts/app-layout";
import { Head, usePage, Link } from "@inertiajs/react";
import { type BreadcrumbItem } from "@/types";
import { dashboard as dashboardRoute } from "@/routes";
import quizzes from "@/routes/quizzes";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
    Plus, ListChecks, Layers, Search, Trophy, Clock, Users,
    TrendingUp, Sparkles, Target, Zap, BookOpen, ArrowRight,
} from "lucide-react";

type DashboardProps = {
    stats: { myQuizzes: number; attempts: number; avgScore: number };
    recentQuizzes: Array<{ id: number; title: string; visibility: string; author: { name: string } }>;
    recentAttempts: Array<{ id: number; quizTitle: string; score: number; maxScore: number; status: string }>;
    popularQuizzes: Array<{ id: number; title: string; slug: string; avgScore: number; attemptsCount: number; author: { name: string } }>;
};

const breadcrumbs: BreadcrumbItem[] = [{ title: "Dashboard", href: dashboardRoute().url }];

export default function Dashboard() {
    const { props } = usePage<{ auth: any } & DashboardProps>();
    const { stats, recentQuizzes, recentAttempts, popularQuizzes } = props;

    const getPerformanceLevel = (score: number) => {
        if (score >= 90) return { text: "Excellent", color: "text-emerald-600", bg: "bg-emerald-50" };
        if (score >= 75) return { text: "Good", color: "text-sky-600", bg: "bg-sky-50" };
        if (score >= 60) return { text: "Fair", color: "text-amber-600", bg: "bg-amber-50" };
        return { text: "Improving", color: "text-rose-600", bg: "bg-rose-50" };
    };

    const performance = getPerformanceLevel(stats.avgScore);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard • StudyBuddy" />

            <section className="relative overflow-hidden rounded-3xl p-8 md:p-10 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white shadow-2xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
                
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-3">
                        <Sparkles className="w-6 h-6 text-yellow-300" />
                        <span className="text-sm font-medium text-white/90">Welcome back!</span>
                    </div>
                    
                    <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-white to-white/80">
                        StudyBuddy Dashboard
                    </h1>
                    
                    <p className="text-purple-100 text-lg mb-8 max-w-2xl">
                        Track your progress, create amazing quizzes, and challenge yourself to reach new heights in your learning journey.
                    </p>

                    <div className="flex flex-wrap gap-3 mb-8">
                        <Link href={quizzes.create().url}>
                            <Button className="bg-white text-purple-600 hover:bg-purple-50 shadow-lg hover:shadow-xl transition-all h-12 px-6 font-semibold">
                                <Plus className="w-5 h-5 mr-2" />
                                Create New Quiz
                            </Button>
                        </Link>

                        <Link href={quizzes.mine().url}>
                            <Button className="bg-purple-500/20 backdrop-blur-sm text-white hover:bg-purple-500/30 border border-white/20 h-12 px-6 font-semibold">
                                <ListChecks className="w-5 h-5 mr-2" />
                                My Quizzes
                            </Button>
                        </Link>

                        <Link href="/quizzes">
                            <Button className="bg-purple-500/20 backdrop-blur-sm text-white hover:bg-purple-500/30 border border-white/20 h-12 px-6 font-semibold">
                                <Layers className="w-5 h-5 mr-2" />
                                Explore Public
                            </Button>
                        </Link>
                    </div>

                    <div className="max-w-xl">
                        <div className="relative group">
                            <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-500 rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity" />
                            <div className="relative flex items-center bg-white rounded-2xl shadow-xl overflow-hidden">
                                <div className="flex items-center px-4">
                                    <Search className="w-5 h-5 text-purple-600" />
                                </div>
                                <Input
                                    type="text"
                                    name="q"
                                    placeholder="Search for quizzes..."
                                    className="border-0 shadow-none focus-visible:ring-0 h-14 text-gray-700 placeholder:text-gray-400"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            window.location.href = `/quizzes?q=${e.currentTarget.value}`;
                                        }
                                    }}
                                />
                                <Button
                                    onClick={(e) => {
                                        const input = (e.currentTarget.parentElement?.querySelector('input') as HTMLInputElement);
                                        if (input) window.location.href = `/quizzes?q=${input.value}`;
                                    }}
                                    className="rounded-none rounded-r-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white h-14 px-8 font-semibold"
                                >
                                    Search
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="mt-8 grid md:grid-cols-3 gap-6">
                <Card className="relative overflow-hidden rounded-2xl border-0 shadow-lg hover:shadow-xl transition-all group">
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-amber-50" />
                    <CardContent className="relative p-6">
                        <div className="flex items-start justify-between mb-4">
                            <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 shadow-lg group-hover:scale-110 transition-transform">
                                <BookOpen className="w-6 h-6 text-white" />
                            </div>
                            <Badge className="bg-orange-100 text-orange-700 border-0">Created</Badge>
                        </div>
                        <p className="text-sm font-medium text-gray-600 mb-1">My Quizzes</p>
                        <p className="text-4xl font-bold text-gray-900">{stats.myQuizzes}</p>
                        <p className="text-xs text-gray-500 mt-2">Total quizzes created</p>
                    </CardContent>
                </Card>

                <Card className="relative overflow-hidden rounded-2xl border-0 shadow-lg hover:shadow-xl transition-all group">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50" />
                    <CardContent className="relative p-6">
                        <div className="flex items-start justify-between mb-4">
                            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 shadow-lg group-hover:scale-110 transition-transform">
                                <Target className="w-6 h-6 text-white" />
                            </div>
                            <Badge className="bg-blue-100 text-blue-700 border-0">Activity</Badge>
                        </div>
                        <p className="text-sm font-medium text-gray-600 mb-1">Total Attempts</p>
                        <p className="text-4xl font-bold text-gray-900">{stats.attempts}</p>
                        <p className="text-xs text-gray-500 mt-2">Quizzes taken</p>
                    </CardContent>
                </Card>

                <Card className="relative overflow-hidden rounded-2xl border-0 shadow-lg hover:shadow-xl transition-all group">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-teal-50" />
                    <CardContent className="relative p-6">
                        <div className="flex items-start justify-between mb-4">
                            <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg group-hover:scale-110 transition-transform">
                                <Trophy className="w-6 h-6 text-white" />
                            </div>
                            <Badge className={`${performance.bg} ${performance.color} border-0`}>
                                {performance.text}
                            </Badge>
                        </div>
                        <p className="text-sm font-medium text-gray-600 mb-1">Average Score</p>
                        <p className="text-4xl font-bold text-gray-900">{Math.round(stats.avgScore)}%</p>
                        <p className="text-xs text-gray-500 mt-2">Overall performance</p>
                    </CardContent>
                </Card>
            </section>

            <section className="mt-8 grid lg:grid-cols-3 gap-6">
                <Card className="rounded-2xl lg:col-span-2 border-0 shadow-lg overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-purple-100">
                                    <ListChecks className="w-5 h-5 text-purple-600" />
                                </div>
                                <CardTitle className="text-xl">Recent Quizzes</CardTitle>
                            </div>
                            <Link href={quizzes.mine().url}>
                                <Button variant="ghost" size="sm" className="hover:bg-purple-100">
                                    View All
                                    <ArrowRight className="w-4 h-4 ml-1" />
                                </Button>
                            </Link>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {recentQuizzes.length === 0 ? (
                            <div className="p-12 text-center">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                                    <BookOpen className="w-8 h-8 text-gray-400" />
                                </div>
                                <p className="text-gray-600 font-medium mb-2">No quizzes yet</p>
                                <p className="text-sm text-gray-500 mb-4">Create your first quiz to get started!</p>
                                <Link href={quizzes.create().url}>
                                    <Button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                                        <Plus className="w-4 h-4 mr-2" />
                                        Create Quiz
                                    </Button>
                                </Link>
                            </div>
                        ) : (
                            <ul className="divide-y">
                                {recentQuizzes.map((quiz, idx) => (
                                    <li key={quiz.id} className="p-5 hover:bg-gray-50 transition-colors group">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4 flex-1">
                                                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-purple-100 to-pink-100 text-purple-700 font-bold">
                                                    {idx + 1}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-semibold text-gray-900 mb-1 group-hover:text-purple-600 transition-colors">
                                                        {quiz.title}
                                                    </p>
                                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                                        <span>by {quiz.author.name}</span>
                                                        <span>•</span>
                                                        <Badge variant="outline" className="capitalize text-xs">
                                                            {quiz.visibility}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </div>
                                            <Link href={quizzes.edit(quiz.id).url}>
                                                <Button size="sm" variant="outline" className="hover:bg-purple-50 hover:text-purple-600 hover:border-purple-200">
                                                    Edit
                                                </Button>
                                            </Link>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </CardContent>
                </Card>

                <Card className="rounded-2xl border-0 shadow-lg overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-blue-100">
                                    <Clock className="w-5 h-5 text-blue-600" />
                                </div>
                                <CardTitle>Recent Activity</CardTitle>
                            </div>
                            <Link href="/quizzes">
                                <Button variant="ghost" size="sm" className="hover:bg-blue-100">Browse</Button>
                            </Link>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {recentAttempts.length === 0 ? (
                            <div className="p-8 text-center">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                                    <Target className="w-8 h-8 text-gray-400" />
                                </div>
                                <p className="text-gray-600 font-medium mb-2">No attempts yet</p>
                                <p className="text-sm text-gray-500">Start taking quizzes!</p>
                            </div>
                        ) : (
                            <ul className="divide-y">
                                {recentAttempts.map((a) => {
                                    const pct = a.maxScore ? Math.round((a.score / a.maxScore) * 100) : 0;
                                    const statusConfig = {
                                        completed: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", icon: "✓" },
                                        in_progress: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", icon: "⏳" },
                                        abandoned: { bg: "bg-gray-50", text: "text-gray-700", border: "border-gray-200", icon: "—" }
                                    };
                                    const config = statusConfig[a.status as keyof typeof statusConfig] || statusConfig.abandoned;

                                    return (
                                        <li key={a.id} className="p-4 hover:bg-gray-50 transition-colors">
                                            <div className="space-y-2">
                                                <p className="font-semibold text-gray-900 text-sm truncate">{a.quizTitle}</p>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-2xl font-bold text-gray-900">{pct}%</span>
                                                        <span className="text-xs text-gray-500">{a.score}/{a.maxScore}</span>
                                                    </div>
                                                    <Badge className={`${config.bg} ${config.text} border ${config.border} text-xs`}>
                                                        {config.icon} {a.status.replace('_', ' ')}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </CardContent>
                </Card>
            </section>

            <section className="mt-8">
                <Card className="rounded-2xl border-0 shadow-lg overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-amber-50 via-orange-50 to-rose-50 border-b">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500 to-rose-500">
                                    <TrendingUp className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl">Trending Quizzes</CardTitle>
                                    <p className="text-sm text-gray-600 mt-1">Most popular in the community</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Users className="w-4 h-4" />
                                <span className="font-medium">Community</span>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6">
                        {popularQuizzes.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-amber-100 to-rose-100 mb-4">
                                    <Sparkles className="w-10 h-10 text-amber-600" />
                                </div>
                                <p className="text-lg font-semibold text-gray-900 mb-2">No trending quizzes yet</p>
                                <p className="text-gray-600 mb-6">Be the first to create a popular quiz!</p>
                                <Link href={quizzes.create().url}>
                                    <Button className="bg-gradient-to-r from-amber-500 to-rose-500 text-white hover:from-amber-600 hover:to-rose-600">
                                        <Plus className="w-4 h-4 mr-2" />
                                        Create Quiz
                                    </Button>
                                </Link>
                            </div>
                        ) : (
                            <div className="grid md:grid-cols-3 gap-6">
                                {popularQuizzes.map((quiz, idx) => (
                                    <Link key={quiz.id} href={`/quizzes/${quiz.slug}`} className="block group">
                                        <Card className="relative overflow-hidden border-2 hover:border-purple-300 transition-all hover:shadow-xl h-full">
                                            <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-rose-400 flex items-center justify-center text-white font-bold shadow-lg z-10">
                                                #{idx + 1}
                                            </div>
                                            
                                            <div className="h-24 bg-gradient-to-br from-purple-400 via-pink-400 to-rose-400 relative">
                                                <div className="absolute inset-0 bg-black/10" />
                                            </div>
                                            
                                            <CardContent className="p-5 -mt-8 relative">
                                                <div className="bg-white rounded-xl p-4 shadow-lg mb-4 border-2 border-gray-100 group-hover:border-purple-200 transition-colors">
                                                    <div className="flex items-center gap-2 mb-3">
                                                        <Zap className="w-5 h-5 text-amber-500" />
                                                        <Badge className="bg-amber-100 text-amber-700 border-0 text-xs">Popular</Badge>
                                                    </div>
                                                    
                                                    <h3 className="font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-purple-600 transition-colors">
                                                        {quiz.title}
                                                    </h3>
                                                    
                                                    <div className="flex items-center gap-4 text-sm mb-3">
                                                        <div className="flex items-center gap-1">
                                                            <Trophy className="w-4 h-4 text-emerald-600" />
                                                            <span className="font-semibold text-gray-900">{quiz.avgScore}%</span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <Users className="w-4 h-4 text-blue-600" />
                                                            <span className="font-semibold text-gray-900">{quiz.attemptsCount}</span>
                                                        </div>
                                                    </div>
                                                    
                                                    <Separator className="my-3" />
                                                    
                                                    <div className="flex items-center justify-between">
                                                        <p className="text-xs text-gray-500">by {quiz.author.name}</p>
                                                        <ArrowRight className="w-4 h-4 text-purple-600 group-hover:translate-x-1 transition-transform" />
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </section>
        </AppLayout>
    );
}
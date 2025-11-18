import { dashboard, login, register } from '@/routes';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { BookOpen, Sparkles, Trophy, Users, Zap, Target, Clock, Brain, Lightbulb, TrendingUp, ArrowRight } from 'lucide-react';

export default function Welcome({ canRegister = true }: { canRegister?: boolean }) {
    const { auth } = usePage<SharedData>().props;

    return (
        <>
            <Head title="Welcome to StudyBuddy" />
            
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-950 dark:to-blue-950">
                {/* Navigation */}
                <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800">
                    <div className="max-w-7xl mx-auto px-6 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg">
                                    <BookOpen className="w-6 h-6" />
                                </div>
                                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                    StudyBuddy
                                </span>
                            </div>
                            
                            <div className="flex items-center gap-4">
                                {auth.user ? (
                                    <Link
                                        href={dashboard()}
                                        className="px-6 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
                                    >
                                        Dashboard
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href={login()}
                                            className="px-6 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                        >
                                            Log in
                                        </Link>
                                        {canRegister && (
                                            <Link
                                                href={register()}
                                                className="px-6 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
                                            >
                                                Get Started
                                            </Link>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </nav>

                {/* Hero Section */}
                <section className="pt-32 pb-20 px-6">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-16">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 mb-6 border border-blue-200 dark:border-blue-800">
                                <Sparkles className="w-4 h-4" />
                                <span className="text-sm font-semibold">Learn Smarter, Not Harder</span>
                            </div>
                            
                            <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent leading-tight">
                                Your Ultimate
                                <br />
                                Study Companion
                            </h1>
                            
                            <p className="text-xl text-slate-600 dark:text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed">
                                Create engaging quizzes, track your progress, and master any subject with our interactive learning platform.
                            </p>
                            
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <Link
                                    href={auth.user ? dashboard() : register()}
                                    className="px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold text-lg shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 inline-flex items-center"
                                >
                                    {auth.user ? "Go to Dashboard" : "Start Learning Free"}
                                    <ArrowRight className="w-5 h-5 ml-2" />
                                </Link>
                                {!auth.user && (
                                    <Link
                                        href={login()}
                                        className="px-8 py-4 rounded-xl border-2 border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 text-slate-700 dark:text-slate-300 font-bold text-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                                    >
                                        Watch Demo
                                    </Link>
                                )}
                            </div>
                        </div>

                        {/* Hero Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                            {[
                                { icon: Users, label: 'Active Learners', value: '10K+', gradient: 'from-blue-500 to-cyan-500' },
                                { icon: BookOpen, label: 'Quizzes Created', value: '50K+', gradient: 'from-purple-500 to-pink-500' },
                                { icon: Trophy, label: 'Study Streaks', value: '100K+', gradient: 'from-orange-500 to-red-500' }
                            ].map((stat, i) => {
                                const Icon = stat.icon;
                                return (
                                    <div key={i} className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${stat.gradient} p-6 shadow-xl text-white`}>
                                        <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl">
                                            <Icon className="w-8 h-8 mb-3" />
                                            <p className="text-4xl font-bold mb-1">{stat.value}</p>
                                            <p className="text-sm text-white/90">{stat.label}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section className="py-20 px-6 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                Powerful Features
                            </h2>
                            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
                                Everything you need to ace your studies and reach your learning goals
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[
                                {
                                    icon: Sparkles,
                                    title: 'Smart Quiz Builder',
                                    description: 'Create custom quizzes with multiple question types and auto-grading',
                                    gradient: 'from-blue-500 to-cyan-500'
                                },
                                {
                                    icon: Brain,
                                    title: 'Adaptive Learning',
                                    description: 'AI-powered recommendations based on your performance',
                                    gradient: 'from-purple-500 to-pink-500'
                                },
                                {
                                    icon: TrendingUp,
                                    title: 'Progress Tracking',
                                    description: 'Visualize your improvement with detailed analytics',
                                    gradient: 'from-orange-500 to-red-500'
                                },
                                {
                                    icon: Clock,
                                    title: 'Timed Challenges',
                                    description: 'Test yourself with time limits to simulate exam conditions',
                                    gradient: 'from-green-500 to-emerald-500'
                                },
                                {
                                    icon: Users,
                                    title: 'Study Groups',
                                    description: 'Collaborate with friends and compete on leaderboards',
                                    gradient: 'from-amber-500 to-orange-500'
                                },
                                {
                                    icon: Target,
                                    title: 'Goal Setting',
                                    description: 'Set targets and track milestones to stay motivated',
                                    gradient: 'from-rose-500 to-pink-500'
                                }
                            ].map((feature, i) => {
                                const Icon = feature.icon;
                                return (
                                    <div key={i} className="group relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-slate-200 dark:border-slate-700 hover:border-transparent">
                                        <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                                        <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} text-white shadow-lg mb-4`}>
                                            <Icon className="w-7 h-7" />
                                        </div>
                                        <h3 className="text-xl font-bold mb-3 text-slate-800 dark:text-slate-100">{feature.title}</h3>
                                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{feature.description}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* How It Works */}
                <section className="py-20 px-6">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                How It Works
                            </h2>
                            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
                                Get started in three simple steps
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[
                                {
                                    step: '01',
                                    title: 'Create Your Quiz',
                                    description: 'Build custom quizzes with our intuitive editor',
                                    icon: Lightbulb,
                                    color: 'blue'
                                },
                                {
                                    step: '02',
                                    title: 'Take the Challenge',
                                    description: 'Answer questions and test your knowledge',
                                    icon: Zap,
                                    color: 'purple'
                                },
                                {
                                    step: '03',
                                    title: 'Track Progress',
                                    description: 'Review results and improve continuously',
                                    icon: Trophy,
                                    color: 'pink'
                                }
                            ].map((step, i) => {
                                const Icon = step.icon;
                                return (
                                    <div key={i} className="relative">
                                        <div className="text-center">
                                            <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-${step.color}-500 to-${step.color}-600 text-white shadow-xl mb-6`}>
                                                <Icon className="w-10 h-10" />
                                            </div>
                                            <div className={`text-6xl font-black text-${step.color}-100 dark:text-${step.color}-950/30 mb-4`}>
                                                {step.step}
                                            </div>
                                            <h3 className="text-2xl font-bold mb-3 text-slate-800 dark:text-slate-100">{step.title}</h3>
                                            <p className="text-slate-600 dark:text-slate-300">{step.description}</p>
                                        </div>
                                        {i < 2 && (
                                            <div className="hidden md:block absolute top-10 left-[60%] w-[40%] border-t-2 border-dashed border-slate-300 dark:border-slate-700" />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-20 px-6">
                    <div className="max-w-4xl mx-auto">
                        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-12 shadow-2xl">
                            <div className="absolute inset-0 bg-black/10" />
                            <div className="relative text-center text-white">
                                <h2 className="text-4xl md:text-5xl font-bold mb-6">
                                    Ready to Transform Your Learning?
                                </h2>
                                <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
                                    Join thousands of students who are already mastering their subjects with StudyBuddy
                                </p>
                                <Link
                                    href={auth.user ? dashboard() : register()}
                                    className="inline-flex items-center px-10 py-5 rounded-xl bg-white text-blue-600 hover:bg-blue-50 font-bold text-lg shadow-xl hover:shadow-2xl transition-all transform hover:scale-105"
                                >
                                    {auth.user ? "Go to Dashboard" : "Start Your Free Trial"}
                                    <ArrowRight className="w-5 h-5 ml-2" />
                                </Link>
                                <p className="mt-4 text-sm text-white/80">No credit card required • Free forever</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="py-12 px-6 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border-t border-slate-200 dark:border-slate-800">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg">
                                    <BookOpen className="w-6 h-6" />
                                </div>
                                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                    StudyBuddy
                                </span>
                            </div>
                            
                            <div className="flex items-center gap-6 text-sm text-slate-600 dark:text-slate-400">
                                <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">About</a>
                                <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Features</a>
                                <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Pricing</a>
                                <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Contact</a>
                            </div>
                            
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                © 2025 StudyBuddy. Learn & Grow. | Torno | Adduru | SAM10
                            </p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
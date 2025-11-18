import { login } from '@/routes';
import { store } from '@/routes/register';
import { Form, Head, Link } from '@inertiajs/react';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { BookOpen, Sparkles, User, Mail, Lock, ArrowRight, Check } from 'lucide-react';

export default function Register() {
    return (
        <>
            <Head title="Register" />
            
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-950 dark:to-blue-950 flex items-center justify-center p-6">
                {/* Decorative Elements */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-20 right-10 w-72 h-72 bg-purple-400/20 rounded-full blur-3xl" />
                    <div className="absolute bottom-20 left-10 w-96 h-96 bg-pink-400/20 rounded-full blur-3xl" />
                </div>

                <div className="relative w-full max-w-6xl">
                    <div className="grid lg:grid-cols-2 gap-8 items-center">
                        {/* Left Side - Benefits */}
                        <div className="hidden lg:block">
                            {/* Logo */}
                            <Link href="/" className="flex items-center gap-3 mb-8">
                                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg">
                                    <BookOpen className="w-7 h-7" />
                                </div>
                                <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                    StudyBuddy
                                </span>
                            </Link>

                            <h2 className="text-4xl font-bold mb-4 text-slate-800 dark:text-slate-100">
                                Start your learning journey today
                            </h2>
                            <p className="text-lg text-slate-600 dark:text-slate-300 mb-8">
                                Join thousands of students who are already mastering their subjects
                            </p>

                            <div className="space-y-4">
                                {[
                                    'Create unlimited custom quizzes',
                                    'Track your progress with detailed analytics',
                                    'Compete with friends on leaderboards',
                                    'Access AI-powered learning recommendations'
                                ].map((benefit, i) => (
                                    <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700">
                                        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white flex-shrink-0 mt-0.5">
                                            <Check className="w-4 h-4" />
                                        </div>
                                        <p className="text-slate-700 dark:text-slate-200 font-medium">{benefit}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right Side - Form */}
                        <div className="w-full max-w-md mx-auto lg:mx-0">
                            {/* Mobile Logo */}
                            <Link href="/" className="flex lg:hidden items-center justify-center gap-3 mb-8">
                                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg">
                                    <BookOpen className="w-7 h-7" />
                                </div>
                                <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                    StudyBuddy
                                </span>
                            </Link>

                            {/* Main Card */}
                            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 p-8 md:p-10">
                                {/* Header */}
                                <div className="text-center mb-8">
                                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 mb-4 border border-purple-200 dark:border-purple-800">
                                        <Sparkles className="w-4 h-4" />
                                        <span className="text-sm font-semibold">Get Started Free</span>
                                    </div>
                                    <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                        Create an account
                                    </h1>
                                    <p className="text-slate-600 dark:text-slate-300">
                                        Sign up to unlock your learning potential
                                    </p>
                                </div>

                                <Form
                                    {...store.form()}
                                    resetOnSuccess={['password', 'password_confirmation']}
                                    disableWhileProcessing
                                    className="flex flex-col gap-6"
                                >
                                    {({ processing, errors }) => (
                                        <>
                                            <div className="grid gap-5">
                                                <div className="grid gap-2">
                                                    <Label htmlFor="name" className="text-slate-700 dark:text-slate-200 font-semibold">
                                                        Full Name
                                                    </Label>
                                                    <div className="relative">
                                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                                        <Input
                                                            id="name"
                                                            type="text"
                                                            required
                                                            autoFocus
                                                            tabIndex={1}
                                                            autoComplete="name"
                                                            name="name"
                                                            placeholder="John Doe"
                                                            className="pl-10 h-12 rounded-xl border-2 border-slate-200 dark:border-slate-700 focus:border-purple-500 dark:focus:border-purple-500 transition-colors"
                                                        />
                                                    </div>
                                                    <InputError message={errors.name} />
                                                </div>

                                                <div className="grid gap-2">
                                                    <Label htmlFor="email" className="text-slate-700 dark:text-slate-200 font-semibold">
                                                        Email address
                                                    </Label>
                                                    <div className="relative">
                                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                                        <Input
                                                            id="email"
                                                            type="email"
                                                            required
                                                            tabIndex={2}
                                                            autoComplete="email"
                                                            name="email"
                                                            placeholder="email@example.com"
                                                            className="pl-10 h-12 rounded-xl border-2 border-slate-200 dark:border-slate-700 focus:border-purple-500 dark:focus:border-purple-500 transition-colors"
                                                        />
                                                    </div>
                                                    <InputError message={errors.email} />
                                                </div>

                                                <div className="grid gap-2">
                                                    <Label htmlFor="password" className="text-slate-700 dark:text-slate-200 font-semibold">
                                                        Password
                                                    </Label>
                                                    <div className="relative">
                                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                                        <Input
                                                            id="password"
                                                            type="password"
                                                            required
                                                            tabIndex={3}
                                                            autoComplete="new-password"
                                                            name="password"
                                                            placeholder="Create a strong password"
                                                            className="pl-10 h-12 rounded-xl border-2 border-slate-200 dark:border-slate-700 focus:border-purple-500 dark:focus:border-purple-500 transition-colors"
                                                        />
                                                    </div>
                                                    <InputError message={errors.password} />
                                                </div>

                                                <div className="grid gap-2">
                                                    <Label htmlFor="password_confirmation" className="text-slate-700 dark:text-slate-200 font-semibold">
                                                        Confirm password
                                                    </Label>
                                                    <div className="relative">
                                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                                        <Input
                                                            id="password_confirmation"
                                                            type="password"
                                                            required
                                                            tabIndex={4}
                                                            autoComplete="new-password"
                                                            name="password_confirmation"
                                                            placeholder="Confirm your password"
                                                            className="pl-10 h-12 rounded-xl border-2 border-slate-200 dark:border-slate-700 focus:border-purple-500 dark:focus:border-purple-500 transition-colors"
                                                        />
                                                    </div>
                                                    <InputError message={errors.password_confirmation} />
                                                </div>

                                                <Button
                                                    type="submit"
                                                    className="mt-2 w-full h-12 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] inline-flex items-center justify-center gap-2"
                                                    tabIndex={5}
                                                    data-test="register-user-button"
                                                >
                                                    {processing ? (
                                                        <Spinner />
                                                    ) : (
                                                        <>
                                                            Create account
                                                            <ArrowRight className="w-4 h-4" />
                                                        </>
                                                    )}
                                                </Button>
                                            </div>

                                            <div className="text-center pt-4 border-t border-slate-200 dark:border-slate-700">
                                                <p className="text-slate-600 dark:text-slate-300">
                                                    Already have an account?{' '}
                                                    <TextLink 
                                                        href={login()} 
                                                        tabIndex={6}
                                                        className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-bold"
                                                    >
                                                        Log in
                                                    </TextLink>
                                                </p>
                                            </div>
                                        </>
                                    )}
                                </Form>
                            </div>

                            {/* Footer */}
                            <p className="text-center mt-6 text-sm text-slate-600 dark:text-slate-400">
                                © 2025 StudyBuddy. Learn & Grow. | TORNO | ADDURU | SAM10
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
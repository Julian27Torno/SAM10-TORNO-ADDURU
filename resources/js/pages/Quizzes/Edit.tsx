import { useState } from "react";
import AppLayout from "@/layouts/app-layout";
import { Head, Link, useForm, router } from "@inertiajs/react";
import { dashboard as dashboardRoute } from "@/routes";

import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { 
    Save, ArrowLeft, Trash2, X, 
    Image as ImageIcon, PlusCircle, HelpCircle, GripVertical, AlertCircle,
    CheckCircle2, Circle, Plus, Settings2, FileText, Clock, Sparkles,
    Upload, Globe, Lock, Link2, Eye, Target, ListChecks, Edit3
} from "lucide-react";

// --- Types ---

type Option = {
    id: number;
    text: string;
    is_correct: boolean;
};

type Question = {
    id: number;
    prompt: string;
    type: 'multiple' | 'true_false' | 'identification';
    points: number;
    options: Option[];
};

type Quiz = {
    id: number;
    title: string;
    description: string;
    visibility: "public" | "unlisted" | "private";
    time_limit_seconds: number | null;
    cover_image_url: string | null;
    questions: Question[];
};

// Main Quiz Form Type
type QuizForm = Omit<Quiz, 'cover_image_url' | 'questions' | 'time_limit_seconds'> & {
    cover_image: File | null;
    time_limit: number | '';
    _method: string;
};

// New Question Form Type
type NewOption = { text: string; is_correct: boolean };
type QuestionForm = {
    prompt: string;
    type: 'multiple' | 'true_false' | 'identification';
    points: number;
    options: NewOption[];
};

interface EditQuizProps {
    quiz: Quiz;
    errors: any;
}

export default function EditQuiz({ quiz, errors: pageErrors }: EditQuizProps) {
    const breadcrumbs = [
        { title: "Dashboard", href: dashboardRoute().url },
        { title: "My Quizzes", href: "/my/quizzes" },
        { title: `Edit: ${quiz.title}`, href: `/quizzes/${quiz.id}/edit` },
    ];

    const { data, setData, post, processing, errors, transform } = useForm<QuizForm>({
        _method: 'PUT',
        title: quiz.title,
        description: quiz.description || "",
        visibility: quiz.visibility,
        time_limit: quiz.time_limit_seconds ? Math.floor(quiz.time_limit_seconds / 60) : '',
        id: quiz.id,
        cover_image: null,
    });

    const { 
        data: qData, 
        setData: setQData, 
        post: postQuestion, 
        processing: qProcessing, 
        errors: qErrors,
        reset: qReset 
    } = useForm<QuestionForm>({
        prompt: "",
        type: "multiple",
        points: 1,
        options: [{ text: "", is_correct: false }, { text: "", is_correct: false }]
    });

    const [isAddingQuestion, setIsAddingQuestion] = useState(false);
    const [newOptionTexts, setNewOptionTexts] = useState<Record<number, string>>({});

    const handleSettingsSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        transform((data) => ({
            ...data,
            time_limit_seconds: data.time_limit ? Number(data.time_limit) * 60 : null,
            time_limit: undefined,
        }));

        post(`/quizzes/${quiz.id}`, { 
            forceFormData: true,
        });
    };

    const handleQuestionSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        postQuestion(`/quizzes/${quiz.id}/questions`, {
            onSuccess: () => {
                setIsAddingQuestion(false);
                qReset();
            },
            preserveScroll: true,
        });
    };

    const handleTypeChange = (newType: 'multiple' | 'true_false' | 'identification') => {
        let newOptions: NewOption[] = [];
        if (newType === 'multiple') newOptions = [{ text: "", is_correct: false }, { text: "", is_correct: false }];
        if (newType === 'true_false') newOptions = [{ text: "True", is_correct: true }, { text: "False", is_correct: false }];
        if (newType === 'identification') newOptions = [{ text: "", is_correct: true }];
        
        setQData(prev => ({ ...prev, type: newType, options: newOptions }));
    };

    const updateNewOption = (index: number, field: keyof NewOption, value: any) => {
        const updated = [...qData.options];
        updated[index] = { ...updated[index], [field]: value };
        if (field === 'is_correct' && value === true && qData.type === 'true_false') {
            updated.forEach((opt, i) => opt.is_correct = (i === index));
        }
        setQData('options', updated);
    };

    const addNewOptionField = () => {
        if (qData.options.length < 5) setQData('options', [...qData.options, { text: "", is_correct: false }]);
    };

    const removeNewOptionField = (index: number) => {
        setQData('options', qData.options.filter((_, i) => i !== index));
    };

    const deleteQuestion = (questionId: number) => {
        if(confirm("Delete this question?")) router.delete(`/questions/${questionId}`, { preserveScroll: true });
    };

    const deleteOption = (optionId: number) => {
        if(confirm("Remove this option?")) router.delete(`/options/${optionId}`, { preserveScroll: true });
    };

    const handleQuickAddOption = (questionId: number) => {
        const text = newOptionTexts[questionId];
        if (!text || !text.trim()) return;
        router.post(`/questions/${questionId}/options`, { text, is_correct: false }, {
            preserveScroll: true,
            onSuccess: () => setNewOptionTexts(p => ({ ...p, [questionId]: "" }))
        });
    };
    
    const toggleOptionCorrectness = (option: Option) => {
         router.put(`/options/${option.id}`, { is_correct: !option.is_correct }, { preserveScroll: true });
    };

    const imagePreview = data.cover_image ? URL.createObjectURL(data.cover_image) : quiz.cover_image_url;
    const removeImage = () => setData('cover_image', null);

    const visibilityIcons = {
        public: Globe,
        unlisted: Link2,
        private: Lock
    };

    const totalPoints = quiz.questions.reduce((sum, q) => sum + q.points, 0);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Quiz: ${quiz.title}`} />

            {/* Header with gradient */}
            <div className="mb-8">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg">
                            <Edit3 className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                {quiz.title}
                            </h1>
                            <p className="text-sm text-muted-foreground">Edit your quiz settings and questions</p>
                        </div>
                    </div>
                    <Link href="/my/quizzes">
                        <Button variant="outline" size="lg" className="border-2">
                            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Quizzes
                        </Button>
                    </Link>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-4 mt-6">
                    <Card className="border-2 border-blue-100 dark:border-blue-900/50 bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/20">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-500 text-white shadow-md">
                                    <HelpCircle className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground">Questions</p>
                                    <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{quiz.questions.length}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-2 border-purple-100 dark:border-purple-900/50 bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/30 dark:to-purple-900/20">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-purple-500 text-white shadow-md">
                                    <Target className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground">Total Points</p>
                                    <p className="text-xl font-bold text-purple-600 dark:text-purple-400">{totalPoints}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-2 border-amber-100 dark:border-amber-900/50 bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-950/30 dark:to-amber-900/20">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-amber-500 text-white shadow-md">
                                    <Eye className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground">Visibility</p>
                                    <p className="text-xl font-bold text-amber-600 dark:text-amber-400 capitalize">{quiz.visibility}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <Card className="border-2 border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
                <CardHeader className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-950/30 dark:via-purple-950/30 dark:to-pink-950/30 pb-6 border-b-2">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-xl shadow-md">
                            <Settings2 className="w-5 h-5" />
                        </div>
                        <CardTitle className="text-2xl font-bold">Quiz Editor</CardTitle>
                    </div>
                </CardHeader>
                
                <CardContent className="pt-8 space-y-10">
                    {/* SETTINGS SECTION */}
                    <section className="space-y-6">
                        <div className="flex items-center gap-3 pb-2">
                            <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 text-white rounded-lg shadow-md">
                                <FileText className="w-5 h-5" />
                            </div>
                            <h3 className="text-xl font-bold">Quiz Details</h3>
                        </div>

                        <form id="quiz-settings-form" onSubmit={handleSettingsSubmit} className="space-y-6">
                            <div className="grid gap-8 md:grid-cols-12">
                                {/* Cover Image */}
                                <div className="md:col-span-4 space-y-3">
                                    <label className="block text-sm font-bold">Cover Image</label>
                                    {imagePreview ? (
                                        <div className="relative group">
                                            <div className="w-full h-48 rounded-xl overflow-hidden border-2 border-slate-200 dark:border-slate-700 shadow-lg">
                                                <img src={imagePreview} className="w-full h-full object-cover" alt="Cover" />
                                            </div>
                                            <Button 
                                                type="button" 
                                                variant="destructive" 
                                                size="sm" 
                                                onClick={removeImage}
                                                className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                            >
                                                <X className="w-4 h-4 mr-1" />
                                                Remove
                                            </Button>
                                        </div>
                                    ) : (
                                        <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl cursor-pointer bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-950/20 dark:hover:to-purple-950/20 transition-all group">
                                            <div className="flex flex-col items-center">
                                                <div className="mb-3 p-3 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white group-hover:scale-110 transition-transform shadow-lg">
                                                    <Upload className="w-6 h-6" />
                                                </div>
                                                <p className="text-sm font-semibold text-foreground">Upload Cover</p>
                                                <p className="text-xs text-muted-foreground mt-1">PNG, JPG, WEBP</p>
                                            </div>
                                            <Input type="file" accept="image/*" onChange={e => setData("cover_image", e.target.files?.[0] || null)} className="hidden" />
                                        </label>
                                    )}
                                </div>

                                {/* Title & Description */}
                                <div className="md:col-span-8 space-y-5">
                                    <div className="space-y-2">
                                        <label className="block text-sm font-bold">Quiz Title</label>
                                        <Input 
                                            value={data.title} 
                                            onChange={e => setData('title', e.target.value)} 
                                            className="h-12 text-base border-2 focus-visible:ring-blue-500"
                                        />
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <label className="block text-sm font-bold">Description</label>
                                        <textarea 
                                            className="w-full rounded-xl border-2 border-input bg-background px-4 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-blue-500 h-28 resize-y transition-all" 
                                            value={data.description} 
                                            onChange={e => setData('description', e.target.value)}
                                            placeholder="Brief overview or instructions..."
                                        />
                                    </div>
                                    
                                    {/* Visibility & Time */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold">Visibility</label>
                                            <div className="grid grid-cols-3 gap-2">
                                                {['public', 'unlisted', 'private'].map(vis => {
                                                    const Icon = visibilityIcons[vis as keyof typeof visibilityIcons];
                                                    const isSelected = data.visibility === vis;
                                                    return (
                                                        <button 
                                                            key={vis} 
                                                            type="button" 
                                                            onClick={() => setData('visibility', vis as any)} 
                                                            className={`
                                                                flex flex-col items-center gap-1.5 border-2 rounded-lg p-2 text-xs capitalize transition-all
                                                                ${isSelected 
                                                                    ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/40 dark:to-purple-950/40 text-blue-700 dark:text-blue-300 font-bold shadow-md' 
                                                                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800'
                                                                }
                                                            `}
                                                        >
                                                            <Icon className="w-4 h-4" />
                                                            <span>{vis}</span>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                        
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold flex items-center gap-2">
                                                <Clock className="w-4 h-4 text-purple-600"/>
                                                Time Limit (Mins)
                                            </label>
                                            <Input 
                                                type="number" 
                                                min="0" 
                                                placeholder="No limit" 
                                                value={data.time_limit} 
                                                onChange={e => setData('time_limit', e.target.value === '' ? '' : parseInt(e.target.value))} 
                                                className="h-12 border-2 focus-visible:ring-purple-500"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </section>

                    <Separator className="my-10" />

                    {/* QUESTIONS SECTION */}
                    <section className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-gradient-to-br from-orange-500 to-red-500 text-white rounded-lg shadow-md">
                                    <HelpCircle className="w-5 h-5" />
                                </div>
                                <h3 className="text-xl font-bold">Questions</h3>
                            </div>
                            <Badge 
                                variant={quiz.questions.length >= 20 ? "destructive" : "secondary"}
                                className="text-sm px-4 py-1.5"
                            >
                                {quiz.questions.length} / 20 Questions
                            </Badge>
                        </div>

                        {pageErrors.questions_limit && (
                            <div className="p-4 bg-red-50 dark:bg-red-950/30 border-2 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm rounded-xl flex gap-3 items-center">
                                <AlertCircle className="w-5 h-5 flex-shrink-0"/>
                                <span className="font-medium">{pageErrors.questions_limit}</span>
                            </div>
                        )}

                        <div className="space-y-4">
                            {quiz.questions.map((q, idx) => (
                                <div 
                                    key={q.id} 
                                    className="group border-2 rounded-xl p-5 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 shadow-sm hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700 transition-all"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold text-sm shadow-md flex-shrink-0">
                                            {idx + 1}
                                        </div>
                                        
                                        <div className="flex-1 space-y-4">
                                            <div className="flex justify-between items-start gap-4">
                                                <div className="flex-1">
                                                    <p className="font-semibold text-base text-foreground mb-2">{q.prompt}</p>
                                                    <div className="flex gap-2">
                                                        <Badge variant="secondary" className="text-xs capitalize font-medium">
                                                            {q.type.replace('_', ' ')}
                                                        </Badge>
                                                        <Badge variant="outline" className="text-xs font-bold text-orange-600 dark:text-orange-400">
                                                            {q.points} pts
                                                        </Badge>
                                                    </div>
                                                </div>
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    className="text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors" 
                                                    onClick={() => deleteQuestion(q.id)}
                                                >
                                                    <Trash2 className="w-4 h-4"/>
                                                </Button>
                                            </div>
                                            
                                            <div className="space-y-2">
                                                {q.type === 'identification' ? (
                                                    <div className="flex items-center gap-2 text-sm font-medium bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 text-green-700 dark:text-green-400 p-3 rounded-lg border-2 border-green-200 dark:border-green-800 w-fit">
                                                        <CheckCircle2 className="w-4 h-4"/> 
                                                        Answer: {q.options[0]?.text}
                                                    </div>
                                                ) : (
                                                    q.options.map(opt => (
                                                        <div 
                                                            key={opt.id} 
                                                            className="flex items-center gap-3 text-sm p-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                                        >
                                                            <button 
                                                                onClick={() => toggleOptionCorrectness(opt)} 
                                                                className={`flex-shrink-0 ${opt.is_correct ? "text-green-600" : "text-slate-300 hover:text-slate-400"}`}
                                                            >
                                                                {opt.is_correct ? <CheckCircle2 className="w-5 h-5"/> : <Circle className="w-5 h-5"/>}
                                                            </button>
                                                            <span className={`flex-1 ${opt.is_correct ? "text-green-700 dark:text-green-400 font-semibold" : "text-slate-600 dark:text-slate-400"}`}>
                                                                {opt.text}
                                                            </span>
                                                            <button 
                                                                onClick={() => deleteOption(opt.id)} 
                                                                className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-all"
                                                            >
                                                                <X className="w-4 h-4"/>
                                                            </button>
                                                        </div>
                                                    ))
                                                )}
                                                
                                                {q.type === 'multiple' && (
                                                    <div className="flex gap-2 items-center mt-3 pl-2">
                                                        <Input 
                                                            placeholder="Add new option..." 
                                                            className="h-9 text-sm flex-1 max-w-md border-2" 
                                                            value={newOptionTexts[q.id] || ""} 
                                                            onChange={e => setNewOptionTexts(p => ({...p, [q.id]: e.target.value}))} 
                                                            onKeyDown={e => e.key === 'Enter' && handleQuickAddOption(q.id)}
                                                        />
                                                        <Button 
                                                            size="sm" 
                                                            onClick={() => handleQuickAddOption(q.id)} 
                                                            className="h-9 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                                                        >
                                                            <Plus className="w-4 h-4 mr-1" />
                                                            Add
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Add Question Button/Form */}
                        {!isAddingQuestion ? (
                            <Button 
                                variant="outline" 
                                className="w-full border-dashed border-2 py-10 hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-950/20 dark:hover:to-purple-950/20 hover:border-blue-300 dark:hover:border-blue-700 transition-all group" 
                                onClick={() => setIsAddingQuestion(true)} 
                                disabled={quiz.questions.length >= 20}
                            >
                                <div className="flex flex-col items-center gap-2">
                                    <div className="p-3 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white group-hover:scale-110 transition-transform shadow-lg">
                                        <PlusCircle className="w-6 h-6"/>
                                    </div>
                                    <span className="font-semibold text-base">Add New Question</span>
                                </div>
                            </Button>
                        ) : (
                            <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6 rounded-xl border-2 border-slate-200 dark:border-slate-700 shadow-lg">
                                <div className="flex justify-between items-center mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-lg shadow-md">
                                            <Sparkles className="w-5 h-5" />
                                        </div>
                                        <h4 className="font-bold text-lg">Create New Question</h4>
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={() => setIsAddingQuestion(false)}>
                                        <X className="w-5 h-5"/>
                                    </Button>
                                </div>
                                
                                <div className="space-y-5">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase text-slate-500">Question Prompt</label>
                                        <Input 
                                            placeholder="e.g. What is the capital of France?" 
                                            value={qData.prompt} 
                                            onChange={e => setQData('prompt', e.target.value)} 
                                            className="bg-white border-2 h-12 text-base"
                                        />
                                    </div>
                                    
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="col-span-2 space-y-2">
                                            <label className="text-xs font-bold uppercase text-slate-500">Question Type</label>
                                            <select 
                                                className="w-full h-12 rounded-lg border-2 border-input px-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" 
                                                value={qData.type} 
                                                onChange={e => handleTypeChange(e.target.value as any)}
                                            >
                                                <option value="multiple">Multiple Choice</option>
                                                <option value="true_false">True / False</option>
                                                <option value="identification">Identification</option>
                                            </select>
                                        </div>
                                        
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase text-slate-500">Points</label>
                                            <Input 
                                                type="number" 
                                                className="bg-white border-2 h-12" 
                                                min={1} 
                                                value={qData.points} 
                                                onChange={e => setQData('points', parseInt(e.target.value))} 
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-3 pt-2">
                                        <label className="text-xs font-bold uppercase text-slate-500">
                                            {qData.type === 'identification' ? 'Correct Answer' : 'Options'}
                                        </label>
                                        
                                        {qData.type === 'identification' && (
                                            <Input 
                                                className="bg-white border-2 border-green-500 h-12 focus-visible:ring-green-500" 
                                                placeholder="Enter the correct answer..." 
                                                value={qData.options[0].text} 
                                                onChange={e => updateNewOption(0, 'text', e.target.value)}
                                            />
                                        )}

                                        {qData.type === 'true_false' && (
                                            <div className="space-y-2">
                                                {qData.options.map((opt, i) => (
                                                    <div 
                                                        key={i} 
                                                        className={`flex items-center gap-3 p-4 border-2 rounded-xl bg-white transition-all cursor-pointer ${
                                                            opt.is_correct 
                                                                ? 'border-green-500 bg-green-50 dark:bg-green-950/30' 
                                                                : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                                                        }`}
                                                        onClick={() => updateNewOption(i, 'is_correct', true)}
                                                    >
                                                        <input 
                                                            type="radio" 
                                                            checked={opt.is_correct} 
                                                            onChange={() => updateNewOption(i, 'is_correct', true)} 
                                                            className="w-5 h-5 text-green-600"
                                                        />
                                                        <span className={`text-base font-semibold ${opt.is_correct ? 'text-green-700' : 'text-slate-700'}`}>
                                                            {opt.text}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {qData.type === 'multiple' && (
                                            <div className="space-y-3">
                                                {qData.options.map((opt, i) => (
                                                    <div key={i} className="flex gap-3 items-center">
                                                        <button 
                                                            type="button" 
                                                            onClick={() => updateNewOption(i, 'is_correct', !opt.is_correct)}
                                                            className="flex-shrink-0"
                                                        >
                                                            {opt.is_correct 
                                                                ? <CheckCircle2 className="w-6 h-6 text-green-600"/> 
                                                                : <Circle className="w-6 h-6 text-slate-300 hover:text-slate-400"/>
                                                            }
                                                        </button>
                                                        <Input 
                                                            className="bg-white border-2 h-11 flex-1" 
                                                            placeholder={`Option ${i+1}`} 
                                                            value={opt.text} 
                                                            onChange={e => updateNewOption(i, 'text', e.target.value)} 
                                                        />
                                                        {qData.options.length > 2 && (
                                                            <button 
                                                                type="button" 
                                                                onClick={() => removeNewOptionField(i)} 
                                                                className="text-slate-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                                                            >
                                                                <X className="w-5 h-5"/>
                                                            </button>
                                                        )}
                                                    </div>
                                                ))}
                                                {qData.options.length < 5 && (
                                                    <Button 
                                                        type="button" 
                                                        variant="outline" 
                                                        size="sm" 
                                                        onClick={addNewOptionField} 
                                                        className="border-2 border-dashed hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/20"
                                                    >
                                                        <Plus className="w-4 h-4 mr-2"/> 
                                                        Add Option
                                                    </Button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div className="pt-4 flex justify-end gap-3">
                                        <Button 
                                            variant="outline" 
                                            onClick={() => setIsAddingQuestion(false)}
                                            className="border-2"
                                        >
                                            Cancel
                                        </Button>
                                        <Button 
                                            onClick={handleQuestionSubmit} 
                                            disabled={qProcessing} 
                                            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg font-semibold px-6"
                                        >
                                            <Save className="w-4 h-4 mr-2" />
                                            {qProcessing ? 'Saving...' : 'Save Question'}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </section>
                    
                    <Separator className="my-10" />
                    
                    {/* Save Button - Sticky Footer */}
                    <div className="sticky bottom-0 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 -mx-6 px-6 py-5 border-t-2 border-slate-200 dark:border-slate-700 z-10 flex justify-between items-center rounded-b-xl">
                        <div className="flex items-center gap-2">
                            <Save className="w-5 h-5 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground font-medium">Remember to save your changes</span>
                        </div>
                        <Button 
                            type="submit" 
                            form="quiz-settings-form" 
                            disabled={processing} 
                            size="lg"
                            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all font-semibold px-8"
                        >
                            <Save className="w-5 h-5 mr-2" /> 
                            {processing ? 'Saving...' : 'Save Quiz Settings'}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </AppLayout>
    );
}
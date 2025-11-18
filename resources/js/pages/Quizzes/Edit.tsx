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
    CheckCircle2, Circle, Plus, Settings2, FileText, Clock
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

    // --- FORM 1: Quiz Settings ---
    // Destructure 'transform' here
    const { data, setData, post, processing, errors, transform } = useForm<QuizForm>({
        _method: 'PUT',
        title: quiz.title,
        description: quiz.description || "",
        visibility: quiz.visibility,
        time_limit: quiz.time_limit_seconds ? Math.floor(quiz.time_limit_seconds / 60) : '',
        id: quiz.id,
        cover_image: null,
    });

    // --- FORM 2: New Question ---
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

    // --- Handlers ---

    const handleSettingsSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // FIX: Transform minutes to seconds BEFORE post
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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Quiz: ${quiz.title}`} />

            <div className="mb-6 flex items-center justify-between gap-2">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Editing: {quiz.title}</h1>
                    <p className="text-sm text-muted-foreground mt-1">Update settings and manage questions.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Link href="/my/quizzes">
                        <Button variant="outline" size="sm"><ArrowLeft className="w-4 h-4 mr-1" /> Back</Button>
                    </Link>
                </div>
            </div>

            <Card className="rounded-2xl border border-sky-100/70 dark:border-slate-800 shadow-sm max-w-6xl mx-auto">
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2">
                        <Settings2 className="w-5 h-5 text-sky-600" />
                        Quiz Editor
                    </CardTitle>
                </CardHeader>
                
                <Separator />
                
                <CardContent className="pt-6 space-y-10">
                    {/* SETTINGS */}
                    <section className="space-y-6">
                        <div className="flex items-center gap-2 text-lg font-semibold text-slate-800 dark:text-slate-200">
                            <FileText className="w-5 h-5 text-sky-600"/> <h3>Quiz Details</h3>
                        </div>

                        <form id="quiz-settings-form" onSubmit={handleSettingsSubmit} className="space-y-6 pl-1">
                            <div className="grid gap-8 md:grid-cols-12">
                                <div className="md:col-span-4 space-y-2">
                                    <label className="block text-sm font-medium">Cover Image</label>
                                    <div className="flex flex-col gap-3">
                                        <div className="w-full h-40 bg-slate-50 rounded-lg border border-dashed flex items-center justify-center overflow-hidden relative">
                                            {imagePreview ? <img src={imagePreview} className="w-full h-full object-cover" /> : <ImageIcon className="text-gray-300 w-8 h-8"/>}
                                        </div>
                                        <Input type="file" accept="image/*" onChange={e => setData("cover_image", e.target.files?.[0] || null)} className="bg-white text-xs" />
                                        {imagePreview && <Button type="button" variant="outline" size="xs" onClick={removeImage}>Remove Image</Button>}
                                    </div>
                                </div>

                                <div className="md:col-span-8 space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="block text-sm font-medium">Title</label>
                                        <Input value={data.title} onChange={e => setData('title', e.target.value)} className="max-w-2xl"/>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="block text-sm font-medium">Description</label>
                                        <textarea className="w-full max-w-2xl rounded-md border border-input bg-background px-3 py-2 text-sm h-24" value={data.description} onChange={e => setData('description', e.target.value)} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 max-w-2xl">
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-medium">Visibility</label>
                                            <div className="flex gap-1">
                                                {['public', 'unlisted', 'private'].map(vis => (
                                                    <button key={vis} type="button" onClick={() => setData('visibility', vis as any)} className={`flex-1 border rounded text-xs py-2 capitalize transition-all ${data.visibility === vis ? 'bg-sky-50 border-sky-500 text-sky-700 font-medium' : 'hover:bg-slate-50'}`}>{vis}</button>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-medium flex items-center gap-1"><Clock className="w-3.5 h-3.5"/> Time Limit (Mins)</label>
                                            <Input type="number" min="0" placeholder="No limit" value={data.time_limit} onChange={e => setData('time_limit', e.target.value === '' ? '' : parseInt(e.target.value))} className="bg-white" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </section>

                    <Separator />

                    {/* QUESTIONS */}
                    <section className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold flex items-center gap-2"><HelpCircle className="w-5 h-5 text-orange-500" /> Questions</h3>
                            <Badge variant={quiz.questions.length >= 20 ? "destructive" : "secondary"}>{quiz.questions.length} / 20</Badge>
                        </div>

                        {pageErrors.questions_limit && <div className="p-3 bg-red-50 text-red-600 text-sm rounded flex gap-2"><AlertCircle className="w-4"/> {pageErrors.questions_limit}</div>}

                        <div className="space-y-4 max-w-3xl">
                            {quiz.questions.map((q, idx) => (
                                <div key={q.id} className="group border rounded-xl p-4 bg-card shadow-sm hover:border-sky-200">
                                    <div className="flex items-start gap-4">
                                        <Badge variant="outline" className="h-6 w-6 rounded-full flex items-center justify-center mt-1">{idx + 1}</Badge>
                                        <div className="flex-1 space-y-3">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="font-medium text-base">{q.prompt}</p>
                                                    <div className="flex gap-2 mt-1.5">
                                                        <Badge variant="secondary" className="text-[10px] capitalize">{q.type.replace('_', ' ')}</Badge>
                                                        <span className="text-[10px] text-muted-foreground border px-1.5 rounded">{q.points} pts</span>
                                                    </div>
                                                </div>
                                                <Button variant="ghost" size="icon" className="text-slate-400 hover:text-red-600 -mt-1" onClick={() => deleteQuestion(q.id)}><Trash2 className="w-4 h-4"/></Button>
                                            </div>
                                            <div className="space-y-1.5">
                                                {q.type === 'identification' ? (
                                                    <div className="flex items-center gap-2 text-sm text-green-700 font-medium bg-green-50 p-2 rounded border border-green-100 w-fit">
                                                        <CheckCircle2 className="w-4 h-4"/> Answer: {q.options[0]?.text}
                                                    </div>
                                                ) : (
                                                    q.options.map(opt => (
                                                        <div key={opt.id} className="flex items-center gap-3 text-sm p-1.5 rounded hover:bg-slate-50 -ml-1.5 px-2">
                                                            <button onClick={() => toggleOptionCorrectness(opt)} className={opt.is_correct ? "text-green-600" : "text-slate-300 hover:text-slate-400"}>
                                                                {opt.is_correct ? <CheckCircle2 className="w-5 h-5"/> : <Circle className="w-5 h-5"/>}
                                                            </button>
                                                            <span className={`flex-1 ${opt.is_correct ? "text-green-700 font-medium" : "text-slate-600"}`}>{opt.text}</span>
                                                            <button onClick={() => deleteOption(opt.id)} className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 px-2"><X className="w-4 h-4"/></button>
                                                        </div>
                                                    ))
                                                )}
                                                {q.type === 'multiple' && (
                                                    <div className="flex gap-2 items-center mt-2 pl-2">
                                                        <Input placeholder="Add option..." className="h-8 text-sm w-full max-w-sm" value={newOptionTexts[q.id] || ""} onChange={e => setNewOptionTexts(p => ({...p, [q.id]: e.target.value}))} onKeyDown={e => e.key === 'Enter' && handleQuickAddOption(q.id)}/>
                                                        <Button size="sm" variant="ghost" onClick={() => handleQuickAddOption(q.id)} className="h-8 text-xs text-sky-600">Add</Button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {!isAddingQuestion ? (
                            <Button variant="outline" className="w-full max-w-3xl border-dashed border-2 py-8" onClick={() => setIsAddingQuestion(true)} disabled={quiz.questions.length >= 20}>
                                <div className="flex flex-col items-center gap-1"><PlusCircle className="w-6 h-6"/><span className="font-medium">Add New Question</span></div>
                            </Button>
                        ) : (
                            <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-xl border shadow-sm max-w-3xl">
                                <div className="flex justify-between items-start mb-4">
                                    <h4 className="font-semibold text-base">Create New Question</h4>
                                    <Button variant="ghost" size="sm" onClick={() => setIsAddingQuestion(false)}><X className="w-4 h-4"/></Button>
                                </div>
                                <div className="space-y-5">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold uppercase text-slate-500">Prompt</label>
                                        <Input placeholder="e.g. Capital of France?" value={qData.prompt} onChange={e => setQData('prompt', e.target.value)} className="bg-white"/>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="flex-1 space-y-1.5">
                                            <label className="text-xs font-semibold uppercase text-slate-500">Type</label>
                                            <select className="w-full h-10 rounded-md border px-3 text-sm bg-white" value={qData.type} onChange={e => handleTypeChange(e.target.value as any)}>
                                                <option value="multiple">Multiple Choice</option>
                                                <option value="true_false">True / False</option>
                                                <option value="identification">Identification</option>
                                            </select>
                                        </div>
                                        <div className="w-24 space-y-1.5">
                                            <label className="text-xs font-semibold uppercase text-slate-500">Points</label>
                                            <Input type="number" className="bg-white" min={1} value={qData.points} onChange={e => setQData('points', parseInt(e.target.value))} />
                                        </div>
                                    </div>
                                    <div className="space-y-3 pt-2">
                                        <label className="text-xs font-semibold uppercase text-slate-500">{qData.type === 'identification' ? 'Correct Answer' : 'Options'}</label>
                                        
                                        {qData.type === 'identification' && (
                                            <Input className="bg-white border-green-500" placeholder="Exact answer..." value={qData.options[0].text} onChange={e => updateNewOption(0, 'text', e.target.value)}/>
                                        )}

                                        {qData.type === 'true_false' && qData.options.map((opt, i) => (
                                            <div key={i} className="flex items-center gap-3 p-2 border rounded bg-white">
                                                <input type="radio" checked={opt.is_correct} onChange={() => updateNewOption(i, 'is_correct', true)} className="w-4 h-4 text-sky-600"/>
                                                <span className="text-sm font-medium">{opt.text}</span>
                                            </div>
                                        ))}

                                        {qData.type === 'multiple' && (
                                            <div className="space-y-2">
                                                {qData.options.map((opt, i) => (
                                                    <div key={i} className="flex gap-3 items-center">
                                                        <button type="button" onClick={() => updateNewOption(i, 'is_correct', !opt.is_correct)}>{opt.is_correct ? <CheckCircle2 className="w-6 h-6 text-green-600"/> : <Circle className="w-6 h-6 text-slate-300"/>}</button>
                                                        <Input className="bg-white" placeholder={`Option ${i+1}`} value={opt.text} onChange={e => updateNewOption(i, 'text', e.target.value)} />
                                                        {qData.options.length > 2 && <button type="button" onClick={() => removeNewOptionField(i)} className="text-slate-300 hover:text-red-500"><X className="w-5 h-5"/></button>}
                                                    </div>
                                                ))}
                                                {qData.options.length < 5 && <Button type="button" variant="ghost" size="sm" onClick={addNewOptionField} className="text-sky-600 -ml-2"><Plus className="w-4 h-4 mr-1.5"/> Add Option</Button>}
                                            </div>
                                        )}
                                    </div>
                                    <div className="pt-4 flex justify-end gap-2">
                                        <Button variant="ghost" onClick={() => setIsAddingQuestion(false)}>Cancel</Button>
                                        <Button onClick={handleQuestionSubmit} disabled={qProcessing} className="bg-sky-600 text-white">Save Question</Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </section>
                    
                    <Separator />
                    
                    <div className="flex justify-end sticky bottom-0 bg-white dark:bg-gray-950 pt-4 pb-2 z-10 border-t border-transparent -mx-6 px-6 mt-4">
                        <Button type="submit" form="quiz-settings-form" disabled={processing} className="bg-sky-600 hover:bg-sky-700 text-white shadow-md" size="lg"><Save className="w-4 h-4 mr-2" /> Save Quiz Settings</Button>
                    </div>
                </CardContent>
            </Card>
        </AppLayout>
    );
}
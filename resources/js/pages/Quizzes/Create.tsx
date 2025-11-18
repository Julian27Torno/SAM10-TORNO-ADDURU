import { useState } from "react";
import AppLayout from "@/layouts/app-layout";
import { Head, useForm } from "@inertiajs/react";
import { dashboard as dashboardRoute } from "@/routes";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ArrowRight, Image as ImageIcon, Clock, FileText, Layout, Sparkles, Upload, X, Eye, EyeOff, Lock, Globe, Link2 } from "lucide-react";

type CreateForm = {
    title: string;
    description: string;
    visibility: "public" | "unlisted" | "private";
    time_limit: number | ''; 
    cover_image: File | null;
};

export default function CreateQuiz() {
    const { data, setData, post, processing, errors, transform } = useForm<CreateForm>({
        title: "",
        description: "",
        visibility: "public",
        time_limit: "",
        cover_image: null,
    });

    const [preview, setPreview] = useState<string | null>(null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData("cover_image", file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const removeImage = () => {
        setData("cover_image", null);
        setPreview(null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        transform((data) => ({
            ...data,
            time_limit_seconds: data.time_limit ? Number(data.time_limit) * 60 : null,
            time_limit: undefined, 
        }));

        post("/quizzes", {
            forceFormData: true,
        });
    };

    const visibilityOptions = [
        {
            value: 'public',
            icon: Globe,
            label: 'Public',
            description: 'Anyone can find and take',
            gradient: 'from-blue-500 to-cyan-500'
        },
        {
            value: 'unlisted',
            icon: Link2,
            label: 'Unlisted',
            description: 'Only with direct link',
            gradient: 'from-amber-500 to-orange-500'
        },
        {
            value: 'private',
            icon: Lock,
            label: 'Private',
            description: 'Only you can access',
            gradient: 'from-slate-500 to-slate-600'
        }
    ];

    return (
        <AppLayout breadcrumbs={[{ title: "Dashboard", href: dashboardRoute().url }, { title: "Create Quiz", href: "/quizzes/create" }]}>
            <Head title="Create Quiz • StudyBuddy" />

            <div className="max-w-5xl mx-auto px-4">
                {/* Header with gradient */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg">
                            <Sparkles className="w-6 h-6" />
                        </div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            Create New Quiz
                        </h1>
                    </div>
                    <p className="text-muted-foreground ml-15">Design your quiz with custom settings and make learning fun!</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <Card className="border-2 border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
                        <CardHeader className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-950/30 dark:via-purple-950/30 dark:to-pink-950/30 pb-6 border-b-2">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-xl shadow-md">
                                    <Layout className="w-5 h-5" />
                                </div>
                                <div>
                                    <CardTitle className="text-2xl font-bold">Quiz Configuration</CardTitle>
                                    <CardDescription className="text-base">Set up the basics for your learning experience</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        
                        <CardContent className="pt-8 space-y-8 pb-8">
                            {/* Title and Time Limit Row */}
                            <div className="grid gap-6 md:grid-cols-3">
                                <div className="md:col-span-2 space-y-3">
                                    <label className="text-sm font-bold text-foreground flex items-center gap-2">
                                        <FileText className="w-4 h-4 text-blue-600" />
                                        Quiz Title <span className="text-red-500">*</span>
                                    </label>
                                    <Input 
                                        placeholder="e.g. Advanced Biology Midterm" 
                                        value={data.title} 
                                        onChange={e => setData('title', e.target.value)} 
                                        className="h-14 text-base border-2 focus-visible:ring-blue-500 focus-visible:border-blue-500"
                                    />
                                    {errors.title && <p className="text-sm text-red-500 font-medium flex items-center gap-1"><X className="w-4 h-4" />{errors.title}</p>}
                                </div>

                                <div className="space-y-3">
                                    <label className="text-sm font-bold text-foreground flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-purple-600" />
                                        Time Limit (Minutes)
                                    </label>
                                    <Input 
                                        type="number" 
                                        min="1"
                                        placeholder="No limit"
                                        value={data.time_limit} 
                                        onChange={e => setData('time_limit', e.target.value === '' ? '' : parseInt(e.target.value))} 
                                        className="h-14 text-base border-2 focus-visible:ring-purple-500 focus-visible:border-purple-500"
                                    />
                                    <p className="text-xs text-muted-foreground">Optional: Set a countdown timer</p>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="space-y-3">
                                <label className="text-sm font-bold text-foreground flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-blue-600" />
                                    Description
                                </label>
                                <textarea 
                                    className="w-full rounded-xl border-2 border-input bg-background px-4 py-3 text-base shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-blue-500 min-h-[120px] resize-y transition-all"
                                    placeholder="Provide context, instructions, or what students will learn..."
                                    value={data.description}
                                    onChange={e => setData('description', e.target.value)}
                                />
                            </div>

                            <Separator className="my-8" />

                            {/* Visibility Options - Redesigned */}
                            <div className="space-y-4">
                                <label className="text-sm font-bold text-foreground flex items-center gap-2">
                                    <Eye className="w-4 h-4 text-blue-600" />
                                    Visibility Settings
                                </label>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {visibilityOptions.map((option) => {
                                        const Icon = option.icon;
                                        const isSelected = data.visibility === option.value;
                                        
                                        return (
                                            <div 
                                                key={option.value}
                                                onClick={() => setData('visibility', option.value as any)}
                                                className={`
                                                    cursor-pointer rounded-xl p-5 transition-all duration-200 border-2
                                                    ${isSelected 
                                                        ? 'border-transparent shadow-lg scale-105 bg-gradient-to-br ' + option.gradient
                                                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-md'
                                                    }
                                                `}
                                            >
                                                <div className="flex flex-col items-center text-center gap-3">
                                                    <div className={`
                                                        p-3 rounded-xl transition-colors
                                                        ${isSelected 
                                                            ? 'bg-white/20' 
                                                            : 'bg-slate-100 dark:bg-slate-800'
                                                        }
                                                    `}>
                                                        <Icon className={`w-6 h-6 ${isSelected ? 'text-white' : 'text-slate-600 dark:text-slate-400'}`} />
                                                    </div>
                                                    <div>
                                                        <p className={`font-bold text-base mb-1 ${isSelected ? 'text-white' : 'text-foreground'}`}>
                                                            {option.label}
                                                        </p>
                                                        <p className={`text-xs ${isSelected ? 'text-white/90' : 'text-muted-foreground'}`}>
                                                            {option.description}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <Separator className="my-8" />

                            {/* Cover Image - Redesigned */}
                            <div className="space-y-4">
                                <label className="text-sm font-bold text-foreground flex items-center gap-2">
                                    <ImageIcon className="w-4 h-4 text-blue-600" />
                                    Cover Image
                                </label>
                                
                                <div className="relative">
                                    {preview ? (
                                        <div className="relative rounded-xl overflow-hidden border-2 border-slate-200 dark:border-slate-700 shadow-lg group">
                                            <img 
                                                src={preview} 
                                                className="w-full h-64 object-cover"
                                                alt="Cover preview"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                            <Button 
                                                type="button" 
                                                variant="destructive" 
                                                size="sm" 
                                                onClick={removeImage}
                                                className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                            >
                                                <X className="w-4 h-4 mr-1" />
                                                Remove
                                            </Button>
                                        </div>
                                    ) : (
                                        <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl cursor-pointer bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-950/20 dark:hover:to-purple-950/20 transition-all group">
                                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                <div className="mb-4 p-4 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white group-hover:scale-110 transition-transform shadow-lg">
                                                    <Upload className="w-8 h-8" />
                                                </div>
                                                <p className="mb-2 text-sm font-semibold text-foreground">
                                                    Click to upload cover image
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    PNG, JPG or WEBP (MAX. 5MB)
                                                </p>
                                            </div>
                                            <Input 
                                                type="file" 
                                                accept="image/*" 
                                                onChange={handleImageChange}
                                                className="hidden"
                                            />
                                        </label>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                        
                        {/* Footer with gradient */}
                        <div className="p-6 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex justify-between items-center border-t-2">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center font-bold text-sm shadow-md">
                                    1
                                </div>
                                <span className="text-sm font-medium text-muted-foreground">Step 1 of 2 - Basic Setup</span>
                            </div>
                            <Button 
                                type="submit" 
                                disabled={processing} 
                                size="lg" 
                                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 shadow-lg hover:shadow-xl transition-all font-semibold"
                            >
                                {processing ? 'Saving...' : 'Save & Continue'}
                                <ArrowRight className="w-5 h-5 ml-2"/>
                            </Button>
                        </div>
                    </Card>
                </form>
            </div>
        </AppLayout>
    );
}
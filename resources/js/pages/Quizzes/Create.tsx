import { useState } from "react";
import AppLayout from "@/layouts/app-layout";
import { Head, useForm } from "@inertiajs/react";
import { dashboard as dashboardRoute } from "@/routes";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ArrowRight, Image as ImageIcon, Clock, FileText, Layout } from "lucide-react";

type CreateForm = {
    title: string;
    description: string;
    visibility: "public" | "unlisted" | "private";
    time_limit: number | ''; 
    cover_image: File | null;
};

export default function CreateQuiz() {
    // Destructure 'transform' from useForm
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
        
        // FIX: Register the transformation logic BEFORE posting
        transform((data) => ({
            ...data,
            // Convert Minutes (UI) to Seconds (DB)
            time_limit_seconds: data.time_limit ? Number(data.time_limit) * 60 : null,
            // Remove fields that don't belong in the DB request
            time_limit: undefined, 
        }));

        // Now call post (with forceFormData for file upload)
        post("/quizzes", {
            forceFormData: true,
        });
    };

    return (
        <AppLayout breadcrumbs={[{ title: "Dashboard", href: dashboardRoute().url }, { title: "Create Quiz", href: "/quizzes/create" }]}>
            <Head title="Create Quiz" />

            <div className="max-w-6xl mx-auto px-4">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Create New Quiz</h1>
                    <p className="text-muted-foreground mt-1">Step 1: Configure the basic details, timing, and visibility.</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <Card className="border-slate-200 shadow-sm bg-white dark:bg-slate-950">
                        <CardHeader className="pb-4">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-sky-100 text-sky-600 rounded-lg dark:bg-sky-900 dark:text-sky-300">
                                    <Layout className="w-5 h-5" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl">Quiz Settings</CardTitle>
                                    <CardDescription>Define how your quiz looks and behaves.</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        
                        <Separator />
                        
                        <CardContent className="pt-8 space-y-8">
                            <div className="grid gap-8 md:grid-cols-3">
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-sm font-semibold text-foreground">
                                        Quiz Title <span className="text-red-500">*</span>
                                    </label>
                                    <Input 
                                        placeholder="e.g. Advanced Biology Midterm" 
                                        value={data.title} 
                                        onChange={e => setData('title', e.target.value)} 
                                        className="h-12 text-lg"
                                    />
                                    {errors.title && <p className="text-xs text-red-500 font-medium">{errors.title}</p>}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-sky-600" />
                                        Time Limit (Minutes)
                                    </label>
                                    <Input 
                                        type="number" 
                                        min="1"
                                        placeholder="No limit"
                                        value={data.time_limit} 
                                        onChange={e => setData('time_limit', e.target.value === '' ? '' : parseInt(e.target.value))} 
                                        className="h-12"
                                    />
                                    <p className="text-[11px] text-muted-foreground">Leave empty for no timer.</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-foreground">Description</label>
                                <textarea 
                                    className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 min-h-[120px] resize-y"
                                    placeholder="Give instructions or a brief overview..."
                                    value={data.description}
                                    onChange={e => setData('description', e.target.value)}
                                />
                            </div>

                            <div className="grid gap-8 md:grid-cols-2 pt-4">
                                <div className="space-y-3">
                                    <label className="text-sm font-semibold text-foreground">Visibility</label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {['public', 'unlisted', 'private'].map((vis) => (
                                            <div 
                                                key={vis}
                                                onClick={() => setData('visibility', vis as any)}
                                                className={`cursor-pointer border-2 rounded-xl p-3 text-center capitalize text-sm font-medium transition-all ${
                                                    data.visibility === vis 
                                                    ? 'border-sky-500 bg-sky-50 text-sky-700 dark:bg-sky-950 shadow-sm' 
                                                    : 'border-transparent bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-muted-foreground'
                                                }`}
                                            >
                                                {vis}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-sm font-semibold text-foreground">Cover Page</label>
                                    <div className="flex items-start gap-4 p-4 border border-dashed border-slate-300 rounded-xl bg-slate-50">
                                        <div className="w-28 h-20 bg-white rounded-lg border border-slate-200 flex items-center justify-center overflow-hidden shadow-sm relative group shrink-0">
                                            {preview ? (
                                                <img src={preview} className="w-full h-full object-cover" />
                                            ) : (
                                                <ImageIcon className="text-slate-300 w-8 h-8"/>
                                            )}
                                        </div>
                                        <div className="flex-1 space-y-2">
                                            <Input 
                                                type="file" 
                                                accept="image/*" 
                                                onChange={handleImageChange} 
                                                className="cursor-pointer text-xs bg-white" 
                                            />
                                            {preview && (
                                                <Button type="button" variant="destructive" size="sm" onClick={removeImage} className="h-7 text-xs px-3">
                                                    Remove Image
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                        
                        <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-b-xl flex justify-between items-center border-t">
                            <span className="text-sm text-muted-foreground">Step 1 of 2</span>
                            <Button type="submit" disabled={processing} size="lg" className="bg-sky-600 hover:bg-sky-700 text-white px-8">
                                Save & Continue <ArrowRight className="w-4 h-4 ml-2"/>
                            </Button>
                        </div>
                    </Card>
                </form>
            </div>
        </AppLayout>
    );
}
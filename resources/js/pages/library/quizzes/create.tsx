import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

interface QuizCategory {
    id: number;
    name: string;
}

interface Props {
    categories: QuizCategory[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Library',
        href: '#',
    },
    {
        title: 'All Activities',
        href: '/library/quizzes',
    },
    {
        title: 'Create',
        href: '/library/quizzes/create',
    },
];

export default function QuizCreate({ categories = [] }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        title: '',
        description: '',
        quiz_category_id: '',
    });


    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        
        // Check if category is selected
        if (!data.quiz_category_id) {
            alert('Please select a category');
            return;
        }
        
        post(route('library.quizzes.store'));
    };

    return (
        <AppSidebarLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Activity" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="max-w-2xl">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold tracking-tight">Create Activity</h1>
                        <p className="text-muted-foreground">
                            Create a new quiz or activity for your students.
                        </p>
                    </div>

                    <form onSubmit={submit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="title">Title</Label>
                            <Input
                                id="title"
                                value={data.title}
                                onChange={(e) => setData('title', e.target.value)}
                                placeholder="e.g. Mathematics Final Exam"
                                required
                            />
                            {errors.title && (
                                <p className="text-sm text-destructive">{errors.title}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="category">Category *</Label>
                            <Select
                                value={data.quiz_category_id}
                                onValueChange={(value) => setData('quiz_category_id', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent>
                                {categories.map((cat) => (
                                        <SelectItem key={cat.id} value={cat.id.toString()}>
                                            {cat.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.quiz_category_id && (
                                <p className="text-sm text-destructive">{errors.quiz_category_id}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={data.description}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setData('description', e.target.value)}
                                placeholder="Optional description for this activity..."
                                className="h-32"
                            />
                            {errors.description && (
                                <p className="text-sm text-destructive">{errors.description}</p>
                            )}
                        </div>

                        <div className="flex items-center gap-4">
                            <Button type="submit" disabled={processing}>
                                Create Activity
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => window.history.back()}
                            >
                                Cancel
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppSidebarLayout>
    );
}

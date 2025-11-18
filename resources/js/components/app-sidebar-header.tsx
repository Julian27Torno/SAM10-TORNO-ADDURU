import { Breadcrumbs } from '@/components/breadcrumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { type BreadcrumbItem as BreadcrumbItemType } from '@/types';
import { Sparkles } from 'lucide-react';

export function AppSidebarHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItemType[];
}) {
    return (
        <header className="flex h-16 shrink-0 items-center gap-4 border-b-2 border-sidebar-border/50 px-6 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4 bg-gradient-to-r from-white via-blue-50/30 to-purple-50/30 dark:from-slate-950 dark:via-blue-950/10 dark:to-purple-950/10">
            <div className="flex items-center gap-3 flex-1">
                {/* Sidebar Toggle with Accent */}
                <div className="flex items-center gap-2">
                    <SidebarTrigger className="-ml-1 hover:bg-blue-100 dark:hover:bg-blue-950/30 transition-colors" />
                    <div className="h-6 w-px bg-gradient-to-b from-transparent via-blue-300 to-transparent dark:via-blue-700" />
                </div>
                
                {/* Breadcrumbs */}
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>

            {/* Optional: Motivational Badge */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-950/50 dark:to-purple-950/50 border border-blue-200/50 dark:border-blue-800/50">
                <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span className="text-xs font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Keep Learning!
                </span>
            </div>
        </header>
    );
}
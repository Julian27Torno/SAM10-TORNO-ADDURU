import { NavFooter } from "@/components/nav-footer";
import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarGroupContent,
} from "@/components/ui/sidebar";

import { dashboard as dashboardRoute } from "@/routes";
import {
    mine as quizzesMine,
    index as quizzesIndex,
    create as quizzesCreate,
} from "@/routes/quizzes";

import { Link } from "@inertiajs/react";
import { type NavItem } from "@/types";

// Icons
import {
    LayoutGrid,
    FilePlus,
    ListChecks,
    Layers,
    Settings,
    BookOpen,
    GraduationCap,
    Sparkles,
    Trophy,
    TrendingUp,
    Users,
    Lightbulb,
} from "lucide-react";

import AppLogo from "./app-logo";

/* ---------------------------------------------
   MAIN NAVIGATION - Study Focus
---------------------------------------------- */
const studyNavItems: NavItem[] = [
    {
        title: "Dashboard",
        href: dashboardRoute().url,
        icon: LayoutGrid,
        description: "Overview & Stats",
    },
    {
        title: "My Quizzes",
        href: quizzesMine().url,
        icon: GraduationCap,
        description: "Manage your quizzes",
    },
    {
        title: "Create Quiz",
        href: quizzesCreate().url,
        icon: Sparkles,
        description: "Build something new",
    },
];

/* ---------------------------------------------
   EXPLORE NAVIGATION
---------------------------------------------- */
const exploreNavItems: NavItem[] = [
    {
        title: "Browse Quizzes",
        href: quizzesIndex().url,
        icon: Layers,
        description: "Discover & learn",
    },
    {
        title: "Leaderboard",
        href: "/leaderboard",
        icon: Trophy,
        description: "Top performers",
    },
    {
        title: "Study Groups",
        href: "/groups",
        icon: Users,
        description: "Learn together",
    },
];

/* ---------------------------------------------
   FOOTER / RESOURCES
---------------------------------------------- */
const resourceNavItems: NavItem[] = [
    {
        title: "Study Tips",
        href: "/resources/tips",
        icon: Lightbulb,
    },
    {
        title: "Progress",
        href: "/progress",
        icon: TrendingUp,
    },
    {
        title: "Settings",
        href: "/settings/profile",
        icon: Settings,
    },
];

/* ---------------------------------------------
   SIDEBAR COMPONENT - STUDYBUDDY EDITION
---------------------------------------------- */
export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset" className="border-r-2">
            {/* ---------------- HEADER / LOGO with Gradient ---------------- */}
            <SidebarHeader className="border-b border-sidebar-border/50">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-950/20 dark:hover:to-purple-950/20 transition-all">
                            <Link href={dashboardRoute().url} prefetch>
                                <div className="flex items-center gap-3">
                                    <div className="flex aspect-square size-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-md">
                                        <BookOpen className="size-5" />
                                    </div>
                                    <div className="grid flex-1 text-left text-sm leading-tight">
                                        <span className="truncate font-bold text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                            StudyBuddy
                                        </span>
                                        <span className="truncate text-xs text-muted-foreground">
                                            Learn & Grow
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            {/* ---------------- MAIN NAVIGATION with Sections ---------------- */}
            <SidebarContent className="px-2">
                {/* Study Section */}
                <SidebarGroup>
                    <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400 px-2">
                        Study
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <NavMain items={studyNavItems} />
                    </SidebarGroupContent>
                </SidebarGroup>

                {/* Explore Section */}
                <SidebarGroup className="mt-4">
                    <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider text-purple-600 dark:text-purple-400 px-2">
                        Explore
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <NavMain items={exploreNavItems} />
                    </SidebarGroupContent>
                </SidebarGroup>

                {/* Quick Stats Card - Only visible when expanded */}
                <div className="mt-6 mx-2 p-4 rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border border-blue-200/50 dark:border-blue-800/50 group-data-[collapsible=icon]:hidden">
                    <div className="flex items-center gap-2 mb-3">
                        <Trophy className="w-4 h-4 text-yellow-600" />
                        <span className="text-sm font-semibold text-foreground">Your Progress</span>
                    </div>
                    <div className="space-y-2 text-xs">
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Quizzes Taken</span>
                            <span className="font-bold text-blue-600 dark:text-blue-400">12</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Avg Score</span>
                            <span className="font-bold text-purple-600 dark:text-purple-400">85%</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Study Streak</span>
                            <span className="font-bold text-green-600 dark:text-green-400">7 days 🔥</span>
                        </div>
                    </div>
                </div>
            </SidebarContent>

            {/* ---------------- FOOTER with Resources + User ---------------- */}
            <SidebarFooter className="border-t border-sidebar-border/50 mt-auto">
                <NavFooter items={resourceNavItems} className="mb-2" />
                <NavUser />
                
                {/* Quick Tip Badge - Only visible when expanded */}
                <div className="px-2 pt-2 group-data-[collapsible=icon]:hidden">
                    <div className="p-3 rounded-lg bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border border-amber-200/50 dark:border-amber-800/50">
                        <div className="flex items-start gap-2">
                            <Lightbulb className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="text-xs font-medium text-foreground mb-1">Study Tip</p>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    Take regular breaks every 25 minutes for better retention! 🧠
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </SidebarFooter>
        </Sidebar>
    );
}
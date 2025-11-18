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
} from "lucide-react";

import AppLogo from "./app-logo";

/* ---------------------------------------------
   MAIN NAVIGATION
---------------------------------------------- */
const mainNavItems: NavItem[] = [
    {
        title: "Dashboard",
        href: dashboardRoute().url,
        icon: LayoutGrid,
    },
    {
        title: "My Quizzes",
        href: quizzesMine().url,
        icon: ListChecks,
    },
    {
        title: "Create Quiz",
        href: quizzesCreate().url,
        icon: FilePlus,
    },
    {
        title: "Browse Quizzes",
        href: quizzesIndex().url,
        icon: Layers,
    },
];

/* ---------------------------------------------
   FOOTER / EXTRA LINKS
---------------------------------------------- */
const footerNavItems: NavItem[] = [
    {
        title: "StudyBuddy Docs",
        href: "https://yourdocs.studybuddy.app",
        icon: BookOpen,
    },
    {
        title: "Settings",
        href: "/settings/profile",
        icon: Settings,
    },
];

/* ---------------------------------------------
   SIDEBAR COMPONENT
---------------------------------------------- */
export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            {/* ---------------- HEADER / LOGO ---------------- */}
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboardRoute().url} prefetch>
                                <AppLogo className="text-sky-600" />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            {/* ---------------- MAIN NAVIGATION ---------------- */}
            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            {/* ---------------- FOOTER + USER ---------------- */}
            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}

/**
 * App Sidebar - Main navigation sidebar
 */

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Phone,
  LayoutDashboard,
  Building2,
  Users,
  BarChart3,
  PhoneCall,
  BookOpen,
  Settings,
  LogOut,
} from "lucide-react";

interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
}

export function AppSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  // Determine navigation items based on role
  const navItems: NavItem[] =
    user?.role === "superadmin"
      ? [
          {
            title: "Dashboard",
            href: "/superadmin",
            icon: <LayoutDashboard className="h-5 w-5" />,
          },
          {
            title: "Companies",
            href: "/superadmin/companies",
            icon: <Building2 className="h-5 w-5" />,
          },
          {
            title: "Users",
            href: "/superadmin/users",
            icon: <Users className="h-5 w-5" />,
          },
          {
            title: "Analytics",
            href: "/superadmin/analytics",
            icon: <BarChart3 className="h-5 w-5" />,
          },
        ]
      : [
          {
            title: "Dashboard",
            href: "/admin",
            icon: <LayoutDashboard className="h-5 w-5" />,
          },
          {
            title: "Calls",
            href: "/admin/calls",
            icon: <PhoneCall className="h-5 w-5" />,
          },
          {
            title: "Knowledge Base",
            href: "/admin/knowledge",
            icon: <BookOpen className="h-5 w-5" />,
          },
          {
            title: "Agent Config",
            href: "/admin/agent",
            icon: <Settings className="h-5 w-5" />,
          },
        ];

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-card">
      {/* Logo */}
      <div className="flex h-16 items-center border-b px-6">
        <div className="flex items-center gap-2">
          <div className="bg-primary rounded-full p-2">
            <Phone className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-sm">Voice Agent</span>
            <span className="text-xs text-muted-foreground">Platform</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              {item.icon}
              {item.title}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="border-t p-4">
        <div className="mb-3 px-3">
          <div className="text-sm font-medium">{user?.full_name}</div>
          <div className="text-xs text-muted-foreground">{user?.email}</div>
          <div className="mt-1">
            <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-primary/10 text-primary">
              {user?.role === "superadmin" ? "Super Admin" : "Admin"}
            </span>
          </div>
        </div>
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={logout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
}

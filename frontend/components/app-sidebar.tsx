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

  const navItems: NavItem[] =
    user?.role === "superadmin"
      ? [
          { title: "Dashboard", href: "/superadmin", icon: <LayoutDashboard className="h-4 w-4" /> },
          { title: "Companies", href: "/superadmin/companies", icon: <Building2 className="h-4 w-4" /> },
          { title: "Users", href: "/superadmin/users", icon: <Users className="h-4 w-4" /> },
          { title: "Analytics", href: "/superadmin/analytics", icon: <BarChart3 className="h-4 w-4" /> },
        ]
      : [
          { title: "Dashboard", href: "/admin", icon: <LayoutDashboard className="h-4 w-4" /> },
          { title: "Calls", href: "/admin/calls", icon: <PhoneCall className="h-4 w-4" /> },
          { title: "Knowledge Base", href: "/admin/knowledge", icon: <BookOpen className="h-4 w-4" /> },
          { title: "Agent Config", href: "/admin/agent", icon: <Settings className="h-4 w-4" /> },
        ];

  const initials = user?.full_name
    ? user.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  return (
    <div
      className="flex h-screen w-60 shrink-0 flex-col"
      style={{ background: "var(--sidebar)", borderRight: "1px solid var(--sidebar-border)" }}
    >
      {/* Logo */}
      <div
        className="flex h-16 items-center px-5 gap-3"
        style={{ borderBottom: "1px solid var(--sidebar-border)" }}
      >
        <div className="bg-primary rounded-xl p-2 shadow-sm">
          <Phone className="h-4 w-4 text-primary-foreground" />
        </div>
        <div className="flex flex-col leading-none">
          <span className="font-bold text-sm" style={{ color: "var(--sidebar-foreground)" }}>
            VoiceAgent
          </span>
          <span className="text-xs" style={{ color: "var(--sidebar-foreground)", opacity: 0.45 }}>
            Platform
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-0.5 p-3">
        <p
          className="px-2 pb-2 pt-1 text-xs font-semibold uppercase tracking-widest"
          style={{ color: "var(--sidebar-foreground)", opacity: 0.35 }}
        >
          Menu
        </p>
        {navItems.map((item) => {
          const isBase = item.href === "/superadmin" || item.href === "/admin";
          const isActive = isBase
            ? pathname === item.href
            : pathname === item.href || pathname?.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150",
                isActive
                  ? "shadow-sm"
                  : "opacity-60 hover:opacity-90"
              )}
              style={
                isActive
                  ? {
                      background: "var(--sidebar-accent)",
                      color: "var(--sidebar-foreground)",
                      opacity: 1,
                    }
                  : {
                      color: "var(--sidebar-foreground)",
                    }
              }
            >
              <span
                className={cn(
                  "flex items-center justify-center rounded-lg p-1.5",
                  isActive ? "bg-primary text-primary-foreground" : "bg-transparent"
                )}
                style={isActive ? {} : { color: "inherit" }}
              >
                {item.icon}
              </span>
              {item.title}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div
        className="p-3 space-y-3"
        style={{ borderTop: "1px solid var(--sidebar-border)" }}
      >
        <div className="flex items-center gap-3 px-2 py-1.5">
          <div
            className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
            style={{ background: "oklch(0.53 0.24 277 / 0.25)", color: "var(--sidebar-primary)" }}
          >
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div
              className="text-sm font-medium truncate"
              style={{ color: "var(--sidebar-foreground)" }}
            >
              {user?.full_name}
            </div>
            <div
              className="text-xs truncate"
              style={{ color: "var(--sidebar-foreground)", opacity: 0.45 }}
            >
              {user?.email}
            </div>
          </div>
        </div>

        <div className="px-2">
          <span
            className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
            style={{
              background: "oklch(0.53 0.24 277 / 0.2)",
              color: "var(--sidebar-primary)",
            }}
          >
            {user?.role === "superadmin" ? "Super Admin" : "Admin"}
          </span>
        </div>

        <Button
          variant="ghost"
          className="w-full justify-start gap-2 h-9 text-sm font-medium rounded-xl opacity-60 hover:opacity-90 transition-opacity"
          style={{ color: "var(--sidebar-foreground)" }}
          onClick={logout}
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}

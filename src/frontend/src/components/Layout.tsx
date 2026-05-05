import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { Link, useMatchRoute } from "@tanstack/react-router";
import {
  BarChart3,
  CheckSquare,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Settings,
  Sun,
  Tag,
  X,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useState } from "react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "My Tasks", href: "/tasks", icon: CheckSquare },
  { label: "Tags", href: "/tags", icon: Tag },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
  { label: "Settings", href: "/settings", icon: Settings },
];

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { principal, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const matchRoute = useMatchRoute();

  const shortPrincipal = principal
    ? `${principal.slice(0, 5)}…${principal.slice(-4)}`
    : "";

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar — desktop */}
      <aside className="hidden md:flex flex-col w-64 min-h-screen bg-sidebar border-r border-sidebar-border shrink-0">
        <SidebarContent
          navItems={NAV_ITEMS}
          matchRoute={matchRoute}
          shortPrincipal={shortPrincipal}
          logout={logout}
        />
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setMobileOpen(false)}
          onKeyDown={(e) => e.key === "Escape" && setMobileOpen(false)}
          aria-hidden="true"
          role="presentation"
        />
      )}

      {/* Sidebar — mobile drawer */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 flex flex-col bg-sidebar border-r border-sidebar-border md:hidden transition-transform duration-300",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between px-4 py-4 border-b border-sidebar-border">
          <AppLogo />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <SidebarContent
          navItems={NAV_ITEMS}
          matchRoute={matchRoute}
          shortPrincipal={shortPrincipal}
          logout={logout}
          onNavClick={() => setMobileOpen(false)}
        />
      </aside>

      {/* Main area */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Top header — mobile only hamburger + desktop title bar */}
        <header className="sticky top-0 z-30 bg-card border-b border-border flex items-center gap-3 px-4 md:px-6 h-14 shadow-xs">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            data-ocid="layout.menu_button"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex-1" />
          {/* Principal badge + actions */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 rounded-lg bg-muted/60 px-3 py-1.5 border border-border">
              <div className="h-2 w-2 rounded-full bg-primary" />
              <span className="text-xs font-mono text-muted-foreground">
                {shortPrincipal}
              </span>
            </div>
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={logout}
              aria-label="Logout"
              data-ocid="layout.logout_button"
              className="text-muted-foreground hover:text-destructive transition-colors"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const isDark =
    theme === "dark" ||
    (theme === "system" &&
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      data-ocid="layout.theme_toggle"
      className="text-muted-foreground hover:text-foreground transition-colors"
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  );
}

function AppLogo() {
  return (
    <Link to="/dashboard" className="flex items-center gap-2.5 group">
      <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
        <svg
          viewBox="0 0 20 20"
          fill="none"
          className="h-5 w-5"
          aria-hidden="true"
        >
          <rect
            x="2"
            y="5"
            width="16"
            height="2"
            rx="1"
            fill="oklch(var(--sidebar-primary))"
          />
          <rect
            x="2"
            y="9"
            width="10"
            height="2"
            rx="1"
            fill="oklch(var(--sidebar-primary) / 0.7)"
          />
          <rect
            x="2"
            y="13"
            width="13"
            height="2"
            rx="1"
            fill="oklch(var(--sidebar-primary) / 0.4)"
          />
          <circle cx="16" cy="14" r="2.5" fill="oklch(var(--success))" />
          <path
            d="M15 14l.8.8 1.6-1.6"
            stroke="oklch(var(--sidebar))"
            strokeWidth="0.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <div className="min-w-0">
        <p className="text-sm font-display font-semibold text-sidebar-foreground leading-none truncate">
          Smart AI
        </p>
        <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">
          Task Manager Pro
        </p>
      </div>
    </Link>
  );
}

interface SidebarContentProps {
  navItems: NavItem[];
  matchRoute: ReturnType<typeof useMatchRoute>;
  shortPrincipal: string;
  logout: () => void;
  onNavClick?: () => void;
}

function SidebarContent({
  navItems,
  matchRoute,
  shortPrincipal,
  logout,
  onNavClick,
}: SidebarContentProps) {
  return (
    <>
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-sidebar-border">
        <AppLogo />
      </div>

      {/* Nav items */}
      <nav
        className="flex-1 px-3 py-4 space-y-0.5"
        aria-label="Main navigation"
      >
        {navItems.map((item) => {
          const active = !!matchRoute({ to: item.href });
          return (
            <Link
              key={item.href}
              to={item.href}
              onClick={onNavClick}
              data-ocid={`nav.${item.label.toLowerCase().replace(" ", "_")}.link`}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-body transition-smooth",
                active
                  ? "bg-sidebar-primary/10 text-sidebar-primary font-medium"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground",
              )}
              aria-current={active ? "page" : undefined}
            >
              <item.icon
                className={cn(
                  "h-4 w-4 shrink-0",
                  active ? "text-sidebar-primary" : "text-muted-foreground",
                )}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer user / logout */}
      <div className="px-3 pb-4 border-t border-sidebar-border pt-4">
        <div className="flex items-center gap-2 rounded-lg bg-sidebar-accent/50 px-3 py-2 mb-2">
          <div className="h-7 w-7 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
            <span className="text-[10px] font-mono text-primary">
              {shortPrincipal.slice(0, 2)}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-mono text-muted-foreground truncate">
              {shortPrincipal}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={logout}
          data-ocid="sidebar.logout_button"
          className="w-full justify-start gap-2 text-muted-foreground hover:text-destructive text-xs"
        >
          <LogOut className="h-3.5 w-3.5" />
          Sign out
        </Button>
      </div>
    </>
  );
}

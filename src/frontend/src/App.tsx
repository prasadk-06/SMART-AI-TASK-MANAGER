import { Layout } from "@/components/Layout";
import { FullPageLoader } from "@/components/ui/LoadingSpinner";
import { useAuth } from "@/hooks/useAuth";
import LoginPage from "@/pages/LoginPage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
} from "@tanstack/react-router";
import { ThemeProvider } from "next-themes";
import { Suspense, lazy } from "react";
import { Toaster } from "sonner";

const DashboardPage = lazy(() => import("@/pages/DashboardPage"));
const TasksPage = lazy(() => import("@/pages/TasksPage"));
const TagsPage = lazy(() => import("@/pages/TagsPage"));
const AnalyticsPage = lazy(() => import("@/pages/AnalyticsPage"));
const SettingsPage = lazy(() => import("@/pages/SettingsPage"));

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <FullPageLoader />;
  if (!isAuthenticated) return <LoginPage />;
  return (
    <Layout>
      <Suspense fallback={<FullPageLoader />}>{children}</Suspense>
    </Layout>
  );
}

const rootRoute = createRootRoute();

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  beforeLoad: () => {
    throw redirect({ to: "/dashboard" });
  },
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard",
  component: () => (
    <AuthGuard>
      <DashboardPage />
    </AuthGuard>
  ),
});

const tasksRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/tasks",
  component: () => (
    <AuthGuard>
      <TasksPage />
    </AuthGuard>
  ),
});

const tagsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/tags",
  component: () => (
    <AuthGuard>
      <TagsPage />
    </AuthGuard>
  ),
});

const analyticsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/analytics",
  component: () => (
    <AuthGuard>
      <AnalyticsPage />
    </AuthGuard>
  ),
});

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/settings",
  component: () => (
    <AuthGuard>
      <SettingsPage />
    </AuthGuard>
  ),
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  dashboardRoute,
  tasksRoute,
  tagsRoute,
  analyticsRoute,
  settingsRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        <Toaster
          position="bottom-right"
          toastOptions={{
            classNames: {
              toast:
                "bg-card border border-border text-foreground font-body text-sm",
              success: "border-l-4 border-l-primary",
              error: "border-l-4 border-l-destructive",
            },
            duration: 4000,
          }}
        />
      </QueryClientProvider>
    </ThemeProvider>
  );
}

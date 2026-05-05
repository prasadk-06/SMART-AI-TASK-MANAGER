import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { Info, LogOut, Shield, Zap } from "lucide-react";
import { motion } from "motion/react";

export default function SettingsPage() {
  const { principal, logout } = useAuth();

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground tracking-tight">
          Settings
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Manage your account and preferences
        </p>
      </div>

      {/* Account section */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="rounded-2xl border border-border bg-card p-6 space-y-4"
        data-ocid="settings.account.card"
      >
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-primary" />
          <h2 className="font-display font-semibold text-foreground">
            Account
          </h2>
        </div>
        <Separator className="bg-border" />
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-body text-foreground">
                Account email
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                The email used for login and signup
              </p>
            </div>
          </div>
          <div className="rounded-lg bg-muted/60 border border-border px-3 py-2">
            <p className="text-xs font-mono text-muted-foreground break-all">
              {principal ?? "Not connected"}
            </p>
          </div>
        </div>
      </motion.div>

      {/* App info */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="rounded-2xl border border-border bg-card p-6 space-y-4"
      >
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-primary" />
          <h2 className="font-display font-semibold text-foreground">
            App Features
          </h2>
        </div>
        <Separator className="bg-border" />
        <ul className="space-y-2">
          {[
            "Smart AI suggestions as you type",
            "Drag-and-drop task reordering",
            "Priority-coded borders (High/Medium/Low)",
            "Tag-based organization (Work / Study / Personal)",
            "Overdue task highlighting",
            "Real-time search and multi-filter",
            "Dashboard analytics with completion rate",
            "Decentralized storage on Internet Computer",
          ].map((f) => (
            <li
              key={f}
              className="flex items-center gap-2 text-sm text-muted-foreground"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
              {f}
            </li>
          ))}
        </ul>
      </motion.div>

      {/* About */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="rounded-2xl border border-border bg-card p-6 space-y-4"
      >
        <div className="flex items-center gap-2">
          <Info className="h-4 w-4 text-primary" />
          <h2 className="font-display font-semibold text-foreground">About</h2>
        </div>
        <Separator className="bg-border" />
        <p className="text-sm text-muted-foreground">
          Smart AI Task Manager Pro is a premium task management application
          with email and Google login. Your tasks stay connected to your
          signed-in account.
        </p>
      </motion.div>

      {/* Danger zone */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 space-y-4"
        data-ocid="settings.danger.card"
      >
        <h2 className="font-display font-semibold text-destructive">Session</h2>
        <Separator className="bg-destructive/20" />
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-body text-foreground">Sign out</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              End your current session
            </p>
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={logout}
            data-ocid="settings.logout_button"
            className="gap-2 font-body"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign out
          </Button>
        </div>
      </motion.div>

      <p className="text-center text-xs text-muted-foreground pt-2">
        created by prasad-06
      </p>
    </div>
  );
}

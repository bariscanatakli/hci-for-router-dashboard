"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { LoginScreen } from "@/components/auth/LoginScreen";
import { GuidedTour } from "@/components/auth/GuidedTour";
import { HCITour } from "@/components/auth/HCITour";
import {
  completeTour,
  completeHCITour,
  loadAuthState,
  markPasswordChanged,
  skipPasswordChange,
  startTour,
  useAuthState,
} from "@/store/authStore";
import { loadSettingsState } from "@/store/settingsStore";
import { FeedbackProvider } from "@/components/ui/feedback";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function AuthShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const auth = useAuthState();
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const shouldGateForPassword = auth.isAuthenticated && auth.passwordRequiresChange && !auth.passwordSkipWarning;
  const isPresentationPage = pathname === "/presentation";

  useEffect(() => {
    if (isPresentationPage) return;
    loadAuthState();
    loadSettingsState();
  }, [isPresentationPage]);

  useEffect(() => {
    if (isPresentationPage) return;
    const handler = () => setPasswordModalOpen(true);
    if (typeof window !== "undefined") {
      window.addEventListener("router-dashboard:open-password-modal", handler);
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("router-dashboard:open-password-modal", handler);
      }
    };
  }, [isPresentationPage]);

  // Bypass auth shell for presentation page - render children directly
  if (isPresentationPage) {
    return <>{children}</>;
  }

  // Fallback loader while hydrating from localStorage
  if (!auth.initialized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-100">
        <div className="flex items-center gap-3 rounded-md border border-slate-800 bg-slate-900/60 px-4 py-3 text-sm">
          <span className="h-2 w-2 animate-pulse rounded-full bg-indigo-400" />
          Loading session...
        </div>
      </div>
    );
  }

  if (!auth.isAuthenticated) {
    return <LoginScreen />;
  }

  const passwordDialog = (
    <Dialog open={passwordModalOpen} onOpenChange={(open) => setPasswordModalOpen(open)}>
      <DialogContent className="bg-slate-950 text-slate-100" data-tour="password-change-dialog">
        <DialogHeader>
          <DialogTitle>Change default password</DialogTitle>
          <DialogDescription className="text-sm text-slate-400">
            You are signed in with the default admin credentials. Set a new password to secure access.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs text-slate-400">New password</label>
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="At least 8 characters"
              className="bg-slate-900/70"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-slate-400">Confirm password</label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat password"
              className="bg-slate-900/70"
            />
          </div>
          {passwordError && <p className="text-xs text-amber-200">{passwordError}</p>}
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              skipPasswordChange();
              setPasswordModalOpen(false);
            }}
          >
            Skip for now
          </Button>
          <Button
            size="sm"
            className="bg-indigo-500 text-white hover:bg-indigo-600"
            onClick={() => {
              if (newPassword.trim().length < 8) {
                setPasswordError("Password must be at least 8 characters.");
                return;
              }
              if (newPassword === "admin") {
                setPasswordError("New password cannot be the default.");
                return;
              }
              if (newPassword !== confirmPassword) {
                setPasswordError("Passwords do not match.");
                return;
              }
              setPasswordError(null);
              markPasswordChanged(newPassword.trim());
              setPasswordModalOpen(false);
              setNewPassword("");
              setConfirmPassword("");
            }}
          >
            Save new password
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  // Gate access before dashboard when default password is still active, but only open modal on user action
  if (shouldGateForPassword) {
    return (
      <FeedbackProvider>
        <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-slate-100">
          <div className="w-full max-w-xl space-y-4 rounded-xl border border-amber-800/60 bg-amber-950/30 p-4 shadow-2xl shadow-amber-900/40">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-amber-100">Default password detected</div>
                <p className="text-xs text-amber-200">
                  Change it now before entering the dashboard. You can skip, but security will be reduced.
                </p>
              </div>
              <Button variant="ghost" size="sm" className="text-amber-100" onClick={() => setPasswordModalOpen(true)}>
                Change now
              </Button>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                className="border-amber-800/60 text-amber-100 hover:border-amber-500"
                onClick={() => {
                  skipPasswordChange();
                  setPasswordModalOpen(false);
                }}
              >
                Skip for now
              </Button>
            </div>
          </div>
          {passwordDialog}
        </div>
      </FeedbackProvider>
    );
  }

  // Gate access before dashboard when default password is still active
  if (shouldGateForPassword) {
    return (
      <FeedbackProvider>
        <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-slate-100">
          <div className="w-full max-w-xl space-y-4 rounded-xl border border-amber-800/60 bg-amber-950/30 p-4 shadow-2xl shadow-amber-900/40">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-amber-100">Default password detected</div>
                <p className="text-xs text-amber-200">
                  Change it now before entering the dashboard. You can skip, but security will be reduced.
                </p>
              </div>
              <Button variant="ghost" size="sm" className="text-amber-100" onClick={() => setPasswordModalOpen(true)}>
                Change now
              </Button>
            </div>
          </div>
          {passwordDialog}
        </div>
      </FeedbackProvider>
    );
  }

  return (
    <FeedbackProvider>
      <div className="flex min-h-screen bg-slate-950">
        <Sidebar />
        <div className="flex flex-1 flex-col">
          <Topbar />
          <main className="flex-1 px-6 pb-10 pt-6 md:px-10">
            <div className="mx-auto max-w-6xl">
              {auth.passwordRequiresChange && (
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-md border border-amber-800/60 bg-amber-950/30 px-3 py-2 text-xs text-amber-100">
                  <div className="flex flex-col">
                    <span className="font-semibold">Default password in use</span>
                    <span className="text-amber-200">Change it now or continue with reduced security.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="ghost" className="text-amber-100" onClick={() => setPasswordModalOpen(true)}>
                      Change password
                    </Button>
                    {auth.passwordSkipWarning && (
                      <span className="rounded-full border border-amber-700/60 px-2 py-1 text-[11px] uppercase">Warning</span>
                    )}
                  </div>
                </div>
              )}
              {children}
            </div>
          </main>
        </div>

        {auth.showTour && <GuidedTour onComplete={completeTour} />}
        {auth.showHCITour && <HCITour onComplete={completeHCITour} />}
        {passwordDialog}
      </div>
    </FeedbackProvider>
  );
}

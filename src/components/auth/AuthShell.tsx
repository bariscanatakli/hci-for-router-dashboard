"use client";

import React, { useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { LoginScreen } from "@/components/auth/LoginScreen";
import { GuidedTour } from "@/components/auth/GuidedTour";
import { completeTour, loadAuthState, logout, startTour, useAuthState } from "@/store/authStore";

export function AuthShell({ children }: { children: React.ReactNode }) {
  const auth = useAuthState();

  useEffect(() => {
    loadAuthState();
  }, []);

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

  return (
    <div className="flex min-h-screen bg-slate-950">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Topbar />
        <main className="flex-1 px-6 pb-10 pt-6 md:px-10">
          <div className="mx-auto max-w-6xl">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-md border border-slate-800 bg-slate-900/70 px-3 py-2 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-indigo-200">Signed in</span>
                <span>{auth.userName ?? "user"}</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  className="rounded-full border border-indigo-800/60 px-3 py-1 font-semibold text-indigo-100 shadow-sm shadow-indigo-900/40 transition hover:border-indigo-500 hover:bg-indigo-950/50"
                  onClick={startTour}
                  data-hci="tour-trigger"
                >
                  Guided tour
                </button>
                <button className="text-amber-200 underline-offset-2 hover:underline" onClick={logout}>
                  Sign out
                </button>
              </div>
            </div>
            {children}
          </div>
        </main>
      </div>

      {auth.showTour && <GuidedTour onComplete={completeTour} />}
    </div>
  );
}

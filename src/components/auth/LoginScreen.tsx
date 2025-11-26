"use client";

import React, { useMemo, useState } from "react";
import { Lock, Shield, Wifi } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { login } from "@/store/authStore";
import { cn } from "@/lib/utils";

const demoUser = { username: "admin", password: "password123" };

export function LoginScreen() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(() => username.trim().length >= 3 && password.trim().length >= 4, [username, password]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) {
      setError("Fill username and password.");
      return;
    }
    if (username === demoUser.username && password === demoUser.password) {
      login(username);
    } else {
      // Dummy check: allow any creds but warn if not demo
      setError("Demo credentials are admin / password123 (others are allowed for mock login).");
      login(username || "guest");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 px-4">
      <Card className="w-full max-w-lg border-slate-800 bg-slate-900/70 shadow-2xl shadow-slate-950/60">
        <CardHeader className="space-y-2">
          <div className="flex items-center gap-2 text-indigo-300">
            <Shield className="h-5 w-5" />
            <span className="text-xs uppercase tracking-wide">Router sign-in</span>
          </div>
          <CardTitle className="text-2xl text-slate-50">Welcome back</CardTitle>
          <CardDescription className="text-sm text-slate-400">
            Dummy login only. Use <span className="font-semibold text-indigo-200">admin / password123</span> or any
            credentials to continue.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-sm text-slate-300">Username</label>
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                autoComplete="username"
                className="bg-slate-950/70"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-slate-300">Password</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                className="bg-slate-950/70"
              />
            </div>
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <Lock className="h-3.5 w-3.5 text-amber-300" />
                Local mock only; no data sent.
              </span>
              <span className="flex items-center gap-1 text-indigo-200">
                <Wifi className="h-3.5 w-3.5" />
                Secure access
              </span>
            </div>
            {error && (
              <div className="rounded-md border border-amber-800 bg-amber-950/40 px-3 py-2 text-xs text-amber-100" role="alert">
                {error}
              </div>
            )}
            <Button
              type="submit"
              className={cn(
                "w-full bg-indigo-500 text-white shadow-lg shadow-indigo-900/40 hover:bg-indigo-600",
                !canSubmit && "opacity-70"
              )}
              disabled={!canSubmit}
            >
              Sign in
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

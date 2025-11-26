"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PortForwardRule } from "@/lib/types/security";

interface PortForwardWizardProps {
  rules: PortForwardRule[];
  onChange: (rules: PortForwardRule[]) => void;
}

const protocolOptions: PortForwardRule["protocol"][] = ["tcp", "udp"];

export function PortForwardWizard({ rules, onChange }: PortForwardWizardProps) {
  const [draft, setDraft] = useState<PortForwardRule>({
    id: `rule-${rules.length + 1}`,
    name: "",
    port: 0,
    targetIp: "",
    protocol: "tcp",
  });
  const [feedback, setFeedback] = useState<{ message: string; tone?: "success" | "warning" } | null>(null);
  const [lastRemoved, setLastRemoved] = useState<PortForwardRule | null>(null);
  const [confirmRule, setConfirmRule] = useState<PortForwardRule | null>(null);

  const draftErrors = useMemo(() => {
    const errors: string[] = [];
    if (!draft.name.trim()) errors.push("Rule name required");
    if (!draft.port || draft.port < 1 || draft.port > 65535) errors.push("Port must be 1-65535");
    const ipPattern = /^(25[0-5]|2[0-4]\\d|[01]?\\d\\d?)(\\.(25[0-5]|2[0-4]\\d|[01]?\\d\\d?)){3}$/;
    if (!ipPattern.test(draft.targetIp)) errors.push("Target IP must be valid IPv4");
    return errors;
  }, [draft]);

  const canAdd = draftErrors.length === 0;

  const addRule = () => {
    if (!canAdd) {
      setFeedback({ message: draftErrors.join(" • "), tone: "warning" });
      return;
    }
    const newRule = { ...draft, id: `rule-${Date.now()}` };
    onChange([...rules, newRule]);
    setFeedback({ message: "Rule added", tone: "success" });
    setDraft({ id: `rule-${Date.now()}`, name: "", port: 0, targetIp: "", protocol: "tcp" });
  };

  const removeRule = (id: string) => {
    const removed = rules.find((r) => r.id === id) || null;
    setLastRemoved(removed);
    onChange(rules.filter((r) => r.id !== id));
    setFeedback({ message: "Rule removed. Undo?", tone: "warning" });
  };

  const undoRemove = () => {
    if (!lastRemoved) return;
    onChange([...rules, lastRemoved]);
    setFeedback({ message: "Rule restored", tone: "success" });
    setLastRemoved(null);
  };

  useEffect(() => {
    if (!feedback) return;
    const t = setTimeout(() => setFeedback(null), 2500);
    return () => clearTimeout(t);
  }, [feedback]);

  return (
    <Card className="border-slate-800 bg-slate-900/50" data-tour="port-forward-wizard">
      <CardHeader className="flex flex-row items-start justify-between gap-3">
        <div className="space-y-1">
          <CardTitle className="text-base">Port Forwarding</CardTitle>
          <CardDescription className="text-xs">
            Expose internal services cautiously. Ensure firewall level allows desired access.
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid gap-3 md:grid-cols-4">
          <Field label="Rule name">
            <Input
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              placeholder="e.g. NAS SMB"
              className="bg-slate-950/70 text-sm"
              aria-invalid={!draft.name.trim()}
            />
          </Field>
          <Field label="Port">
            <Input
              type="number"
              min={1}
              max={65535}
              value={draft.port || ""}
              onChange={(e) => setDraft({ ...draft, port: Number(e.target.value) || 0 })}
              placeholder="445"
              className="bg-slate-950/70 text-sm"
              aria-invalid={draft.port < 1 || draft.port > 65535}
            />
          </Field>
          <Field label="Target IP">
            <Input
              value={draft.targetIp}
              onChange={(e) => setDraft({ ...draft, targetIp: e.target.value })}
              placeholder="192.168.1.50"
              className="bg-slate-950/70 text-sm"
              aria-invalid={!draft.targetIp}
            />
          </Field>
          <Field label="Protocol">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="w-full justify-between">
                  {draft.protocol.toUpperCase()}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-slate-950 text-slate-100">
                {protocolOptions.map((p) => (
                  <DropdownMenuItem key={p} onClick={() => setDraft({ ...draft, protocol: p })}>
                    {p.toUpperCase()}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </Field>
        </div>
        <div className="flex justify-end">
          <Button
            size="sm"
            className="gap-2 bg-indigo-500 text-white shadow-md shadow-indigo-900/30 hover:bg-indigo-600"
            onClick={addRule}
            disabled={!canAdd}
          >
            <Plus className="h-4 w-4" />
            Add rule
          </Button>
        </div>

        {draftErrors.length > 0 && (
          <div className="rounded-md border border-amber-800/60 bg-amber-950/40 px-3 py-2 text-xs text-amber-200">
            {draftErrors.join(" • ")}
          </div>
        )}

        <div className="space-y-2">
          {rules.length === 0 && (
            <div className="flex flex-col gap-2 rounded-md border border-slate-800 bg-slate-950/60 px-3 py-3 text-sm text-slate-300">
              <span>No port forwards configured.</span>
              <Button
                size="sm"
                className="self-start bg-indigo-500 text-white hover:bg-indigo-600"
                onClick={addRule}
                disabled={!canAdd}
              >
                Add your first rule
              </Button>
            </div>
          )}
          {rules.map((rule) => (
            <div
              key={rule.id}
              className="flex flex-col gap-2 rounded-md border border-slate-800 bg-slate-950/50 p-3 md:flex-row md:items-center md:justify-between"
            >
              <div className="space-y-1 text-sm text-slate-200">
                <div className="font-semibold">{rule.name}</div>
                <div className="text-xs text-slate-400">
                  {rule.protocol.toUpperCase()} • Port {rule.port} → {rule.targetIp}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 text-red-300 hover:bg-red-500/10"
                onClick={() => setConfirmRule(rule)}
              >
                <Trash2 className="h-4 w-4" />
                Remove
              </Button>
            </div>
          ))}
          {lastRemoved && (
            <div className="flex items-center justify-between rounded-md border border-slate-800 bg-slate-950/60 px-3 py-2 text-xs text-slate-200">
              <span>Rule removed: {lastRemoved.name}</span>
              <Button variant="ghost" size="sm" className="text-indigo-200" onClick={undoRemove}>
                Undo
              </Button>
            </div>
          )}
          {feedback && (
            <div
              className={`rounded-md px-3 py-2 text-xs ${
                feedback.tone === "success"
                  ? "border-emerald-800 bg-emerald-950/50 text-emerald-100"
                  : "border-amber-800 bg-amber-950/40 text-amber-100"
              }`}
            >
              {feedback.message}
            </div>
          )}
        </div>

        <Dialog open={Boolean(confirmRule)} onOpenChange={(open) => !open && setConfirmRule(null)}>
          <DialogContent className="bg-slate-950 text-slate-100">
            <DialogHeader>
              <DialogTitle>Remove port forward?</DialogTitle>
              <DialogDescription>
                This will stop external access to the target service. You can undo right after removal.
              </DialogDescription>
            </DialogHeader>
            <div className="rounded-md border border-slate-800 bg-slate-900/60 px-3 py-2 text-sm">
              {confirmRule?.name} — {confirmRule?.protocol.toUpperCase()} • Port {confirmRule?.port} →{" "}
              {confirmRule?.targetIp}
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="ghost" size="sm" onClick={() => setConfirmRule(null)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  if (confirmRule) removeRule(confirmRule.id);
                  setConfirmRule(null);
                }}
              >
                Remove
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-slate-400">{label}</label>
      {children}
    </div>
  );
}

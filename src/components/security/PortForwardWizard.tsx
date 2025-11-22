"use client";

import React, { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
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

  const addRule = () => {
    if (!draft.name || !draft.port || !draft.targetIp) return;
    onChange([...rules, { ...draft, id: `rule-${Date.now()}` }]);
    setDraft({ id: `rule-${Date.now()}`, name: "", port: 0, targetIp: "", protocol: "tcp" });
  };

  const removeRule = (id: string) => {
    onChange(rules.filter((r) => r.id !== id));
  };

  return (
    <Card className="border-slate-800 bg-slate-900/50">
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
            />
          </Field>
          <Field label="Target IP">
            <Input
              value={draft.targetIp}
              onChange={(e) => setDraft({ ...draft, targetIp: e.target.value })}
              placeholder="192.168.1.50"
              className="bg-slate-950/70 text-sm"
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
          >
            <Plus className="h-4 w-4" />
            Add rule
          </Button>
        </div>

        <div className="space-y-2">
          {rules.length === 0 && (
            <div className="rounded-md border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm text-slate-400">
              No port forwards configured.
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
                onClick={() => removeRule(rule.id)}
              >
                <Trash2 className="h-4 w-4" />
                Remove
              </Button>
            </div>
          ))}
        </div>
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

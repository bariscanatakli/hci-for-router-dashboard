"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Shield, Activity, ShieldCheck, ShieldOff } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FirewallLevelSlider } from "@/components/security/FirewallLevelSlider";
import { PortForwardWizard } from "@/components/security/PortForwardWizard";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { SecurityProfile, PortForwardRule } from "@/lib/types/security";
import { cn } from "@/lib/utils";
import { setAutoUpdateEnabled, toggleMode, useSettingsState } from "@/store/settingsStore";
import { fetchSecurityProfile, updateSecurityProfile } from "@/lib/api/security";
import { useFeedback, StatusChip } from "@/components/ui/feedback";
import { InfoBadge } from "@/components/ui/info-badge";

export default function SecurityPage() {
  const [profile, setProfile] = useState<SecurityProfile | null>(null);
  const [savedProfile, setSavedProfile] = useState<SecurityProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { autoUpdateEnabled, mode } = useSettingsState();
  const [feedback, setFeedback] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const savedProfileRef = useRef<SecurityProfile | null>(null);
  const [lastAttempt, setLastAttempt] = useState<number | null>(null);
  const [retryIn, setRetryIn] = useState<number | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);
  const [ipsSensitivity, setIpsSensitivity] = useState<"strict" | "balanced" | "relaxed">("balanced");
  const { notify } = useFeedback();

  // Fetch security profile on mount
  const loadProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    setRetryIn(null);
    setLastAttempt(Date.now());
    try {
      const data = await fetchSecurityProfile();
      if (data) {
        setProfile(data);
        setSavedProfile(data);
        savedProfileRef.current = data;
      } else {
        setError("Couldn't load security settings. Check connection and retry.");
        if (savedProfileRef.current) setProfile(savedProfileRef.current);
      }
    } catch (err) {
      console.error("[Security] Failed to load", err);
      setError("Couldn't load security settings. Check connection and retry.");
      if (savedProfileRef.current) setProfile(savedProfileRef.current);
      setRetryIn(15);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadProfile();
  }, [loadProfile]);

  useEffect(() => {
    if (retryIn === null) return;
    if (retryIn <= 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      loadProfile();
      return;
    }
    const t = setTimeout(() => setRetryIn((r) => (r === null ? null : r - 1)), 1000);
    return () => clearTimeout(t);
  }, [retryIn, loadProfile]);

  const hasChanges = useMemo(() => {
    if (!profile || !savedProfile) return false;
    return JSON.stringify(profile) !== JSON.stringify(savedProfile);
  }, [profile, savedProfile]);

  const riskMessage = useMemo(() => {
    if (!profile) return "";
    if (profile.firewallLevel >= 3) return "Strict: New services are blocked by default.";
    if (profile.firewallLevel === 2) return "Balanced: Most services allowed, risky ports blocked.";
    return "Relaxed: Only basic protections enabled. Consider raising level.";
  }, [profile]);

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    setSaveError(null);
    setFeedback("Saving security settings...");
    const success = await updateSecurityProfile(profile);
    setSaving(false);
    if (success) {
      setSavedProfile(profile);
      setFeedback("Security settings saved successfully.");
      setLastSavedAt(Date.now());
      notify({ title: "Security saved", description: "Settings updated", tone: "success" });
      setTimeout(() => setFeedback(null), 2200);
    } else {
      setSaveError("Failed to save security settings. Retry.");
      notify({ title: "Save failed", description: "Security settings not saved", tone: "warning" });
      setFeedback(null);
    }
  };

  const handleDiscard = () => {
    if (!savedProfile) return;
    setProfile(savedProfile);
    setFeedback("Changes discarded.");
    setTimeout(() => setFeedback(null), 2000);
    setSaveError(null);
  };

  if (loading) {
    return (
      <div className="space-y-8" data-tour="page-security">
        <header className="flex flex-col gap-2" data-tour="security-header">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500 text-white shadow-lg shadow-indigo-900/40">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-50">Security</h1>
              <p className="text-sm text-slate-400">Loading security settings...</p>
            </div>
          </div>
        </header>
        {error && (
          <Card className="border-amber-800/60 bg-amber-950/40">
            <CardContent className="space-y-3 p-4 text-sm text-amber-100">
              <p>{error}</p>
              <p className="text-xs text-amber-200">
                Last attempt: {lastAttempt ? new Date(lastAttempt).toLocaleTimeString() : "—"}
              </p>
              {retryIn !== null && retryIn > 0 && (
                <p className="text-xs text-amber-200">Auto-retrying in {retryIn}s…</p>
              )}
              <div className="flex flex-wrap gap-2">
                <Button size="sm" className="bg-indigo-500 text-white hover:bg-indigo-600" onClick={loadProfile} disabled={loading}>
                  Retry now
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="space-y-8">
        <header className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500 text-white shadow-lg shadow-indigo-900/40">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-50">Security</h1>
              <p className="text-sm text-slate-400">We couldn&apos;t load settings. Retry or use cached data.</p>
            </div>
          </div>
        </header>
        <Card className="border-amber-800/60 bg-amber-950/40">
          <CardContent className="flex flex-col gap-3 p-4 text-sm text-amber-100">
            <p>{error ?? "Unknown error."}</p>
            <p className="text-xs text-amber-200">
              Last attempt: {lastAttempt ? new Date(lastAttempt).toLocaleTimeString() : "—"}
            </p>
            {retryIn !== null && retryIn > 0 && (
              <p className="text-xs text-amber-200">Auto-retrying in {retryIn}s…</p>
            )}
            <div className="flex flex-wrap gap-2">
              <Button size="sm" className="bg-indigo-500 text-white hover:bg-indigo-600" onClick={loadProfile} disabled={loading}>
                Retry loading
              </Button>
              {savedProfile && (
                <Button
                  variant="outline"
                  size="sm"
                  className="border-slate-800 text-slate-100 hover:bg-slate-900"
                  onClick={() => setProfile(savedProfile)}
                >
                  Use last known settings
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8" data-tour="page-security">
      <header className="flex flex-col gap-2" data-tour="security-header">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500 text-white shadow-lg shadow-indigo-900/40">
            <Shield className="h-5 w-5" />
          </div>
          <div className="flex items-center gap-2">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-50" data-tour="security-heading">Security</h1>
              <p className="text-sm text-slate-400">
                Adjust firewall posture, manage port forwards, and oversee threat prevention.
              </p>
            </div>
            <InfoBadge
              content="HCI: Clear feedback for save states and destructive steps. Changes stay local until saved."
              aria-label="Security info"
              data-hci="info-security"
            >
              i
            </InfoBadge>
          </div>
        </div>
      </header>

      <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-slate-400" role="status" aria-live="polite">
        {saving ? (
          <StatusChip tone="info">Saving…</StatusChip>
        ) : lastSavedAt ? (
          <StatusChip tone="success">Saved {new Date(lastSavedAt).toLocaleTimeString()}</StatusChip>
        ) : (
          <StatusChip tone="info">No recent saves</StatusChip>
        )}
        {saveError && <StatusChip tone="warning">{saveError}</StatusChip>}
      </div>

      {hasChanges && (
        <div className="flex flex-col gap-2 rounded-md border border-indigo-800 bg-indigo-950/30 px-3 py-3 text-sm text-indigo-100 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col">
            <span className="font-semibold">Unsaved security changes</span>
            <span className="text-xs text-indigo-200">Save to apply or discard to revert.</span>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-indigo-100"
              onClick={handleDiscard}
              disabled={saving}
            >
              Discard
            </Button>
            <Button
              size="sm"
              className="bg-indigo-500 text-white hover:bg-indigo-600"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </div>
      )}

      <section className="grid gap-4 md:grid-cols-3">
        <StatusCard
          title="Firewall posture"
          description={riskMessage}
          value={`Level ${profile.firewallLevel}`}
          accent="indigo"
        />
        <StatusCard
          title="Threats blocked"
          description="Last 24 hours"
          value={`${profile.threatBlocks24h ?? 0}`}
          accent="emerald"
        />
        <StatusCard
          title="Last scan"
          description="Automatic vulnerability scan"
          value={profile.lastScan ?? "Unknown"}
          accent="blue"
        />
      </section>

      <div className="grid gap-4 lg:grid-cols-3 items-stretch">
        <div className="lg:col-span-2 flex flex-col space-y-4">
          <FirewallLevelSlider
            value={profile.firewallLevel}
            onChange={(level) => setProfile((p) => p ? { ...p, firewallLevel: level } : null)}
            intrusionPreventionEnabled={profile.intrusionPreventionEnabled}
            onToggleIps={(enabled) => setProfile((p) => p ? { ...p, intrusionPreventionEnabled: enabled } : null)}
          />

          {mode === "expert" && (
            <Card className="border-slate-800 bg-slate-900/60 flex-1" data-tour="security-expert">
              <CardHeader className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Activity className="h-4 w-4 text-indigo-400" />
                    Expert security controls
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Tune IDS/IPS, geo/IP blocking and export rules.
                  </CardDescription>
                </div>
                <StatusChip tone="info">Expert</StatusChip>
              </CardHeader>
              <CardContent className="space-y-4 flex-1 flex flex-col justify-evenly">
                <div className="flex items-center justify-between rounded-md border border-slate-800 bg-slate-950/50 px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-200">IPS sensitivity</p>
                    <p className="text-xs text-slate-500">Higher catches more threats but may false-positive.</p>
                  </div>
                  <div className="flex items-center gap-1 text-sm rounded-md border border-slate-700 p-0.5 bg-slate-900">
                    <Button
                      size="sm"
                      variant="ghost"
                      className={cn(
                        "px-3 py-1 h-7 transition-all",
                        ipsSensitivity === "strict"
                          ? "bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 hover:text-amber-200"
                          : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                      )}
                      onClick={() => {
                        setIpsSensitivity("strict");
                        notify({ title: "IPS sensitivity set to Strict", description: "More aggressive threat detection enabled", tone: "success" });
                      }}
                    >
                      Strict
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className={cn(
                        "px-3 py-1 h-7 transition-all",
                        ipsSensitivity === "balanced"
                          ? "bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 hover:text-indigo-200"
                          : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                      )}
                      onClick={() => {
                        setIpsSensitivity("balanced");
                        notify({ title: "IPS sensitivity set to Balanced", description: "Recommended setting for most users", tone: "success" });
                      }}
                    >
                      Balanced
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className={cn(
                        "px-3 py-1 h-7 transition-all",
                        ipsSensitivity === "relaxed"
                          ? "bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 hover:text-emerald-200"
                          : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                      )}
                      onClick={() => {
                        setIpsSensitivity("relaxed");
                        notify({ title: "IPS sensitivity set to Relaxed", description: "Fewer false positives, less strict detection", tone: "success" });
                      }}
                    >
                      Relaxed
                    </Button>
                  </div>
                </div>
                <div className="flex items-center justify-between rounded-md border border-slate-800 bg-slate-950/50 px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-200">Geo/IP blocking</p>
                    <p className="text-xs text-slate-500">Block high-risk regions or known bad IP lists.</p>
                  </div>
                  <Button
                    size="sm"
                    className="bg-indigo-500 text-white hover:bg-indigo-600"
                    onClick={() => notify({ title: "Geo/IP blocking updated", tone: "success" })}
                  >
                    Update list
                  </Button>
                </div>
                <div className="flex items-center justify-between rounded-md border border-slate-800 bg-slate-950/50 px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-200">Export ruleset</p>
                    <p className="text-xs text-slate-500">Download JSON backup of current firewall rules.</p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-slate-800 text-slate-200"
                    onClick={() => notify({ title: "Ruleset exported", tone: "success" })}
                  >
                    Export
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {mode !== "expert" && (
            <Card className="border-slate-800 bg-slate-900/60 flex-1">
              <CardHeader className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-base">Advanced controls hidden</CardTitle>
                  <CardDescription className="text-xs">
                    Port forwarding and deep firewall options are available in Expert mode.
                  </CardDescription>
                </div>
                <Button
                  size="sm"
                  className="bg-indigo-500 text-white hover:bg-indigo-600"
                  onClick={() => toggleMode()}
                >
                  Switch to Expert
                </Button>
              </CardHeader>
              <CardContent className="text-sm text-slate-300">
                Stay in Basic mode to prevent risky configuration changes. Toggle to Expert to add port forwards and
                expose services intentionally.
              </CardContent>
            </Card>
          )}
        </div>

        <div className="flex flex-col space-y-4">
          <Card className="border-slate-800 bg-slate-900/50">
            <CardHeader className="space-y-1">
              <CardTitle className="flex items-center gap-2 text-base">
                <Activity className="h-4 w-4 text-indigo-400" />
                Real-time alerts
              </CardTitle>
              <CardDescription className="text-xs">
                Mock feed for blocked threats and policy events.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-200">
              <AlertItem
                icon={<ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />}
                title="IPS blocked 5 port scans"
                time="5m ago"
              />
              <AlertItem
                icon={<ShieldOff className="h-3.5 w-3.5 text-amber-400" />}
                title="New IoT device detected on guest network"
                time="12m ago"
              />
              <AlertItem
                icon={<ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />}
                title="Firewall rules synced successfully"
                time="28m ago"
              />
            </CardContent>
          </Card>

          <Card className="border-slate-800 bg-slate-900/50">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base">Auto-updates</CardTitle>
                <CardDescription className="text-xs">
                  Keep security signatures fresh.
                </CardDescription>
              </div>
              <Switch
                checked={autoUpdateEnabled}
                onCheckedChange={setAutoUpdateEnabled}
                aria-label="Auto updates"
                onClick={() => {
                  setFeedback(autoUpdateEnabled ? "Auto-updates paused (mock)." : "Auto-updates enabled (mock).");
                  setTimeout(() => setFeedback(null), 2000);
                }}
              />
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-slate-300">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Status</span>
                <span className={cn("font-semibold", autoUpdateEnabled ? "text-emerald-300" : "text-amber-200")}>
                  {autoUpdateEnabled ? "Enabled" : "Paused"}
                </span>
              </div>
              <p>Updates run nightly at 03:00. You can trigger manual update in System.</p>
              <p className="text-xs text-slate-500">
                This toggle is local until API wiring; persist changes via System settings when available.
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-800 bg-slate-900/50 flex-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Update Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5 text-xs text-slate-300">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Latest Update</span>
                <span className="text-emerald-300 font-medium">26.11.2025 03:12</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Last Scan</span>
                <span className="text-blue-300 font-medium">27.11.2025 14:45</span>
              </div>
            </CardContent>
          </Card>

          {feedback && (
            <div className="rounded-md border border-slate-800 bg-slate-950/70 px-3 py-2 text-xs text-slate-100" role="status" aria-live="polite">
              {feedback}
            </div>
          )}
          {saveError && (
            <div className="rounded-md border border-amber-800 bg-amber-950/40 px-3 py-2 text-xs text-amber-100" role="alert">
              {saveError}
            </div>
          )}
        </div>
      </div>

      {/* Port Forwarding - Full width (Expert mode only) */}
      {mode === "expert" && (
        <PortForwardWizard
          rules={profile.portForwards}
          onChange={(rules: PortForwardRule[]) => setProfile((p) => p ? { ...p, portForwards: rules } : null)}
        />
      )}
    </div>
  );
}

function StatusCard({
  title,
  description,
  value,
  accent = "slate",
}: {
  title: string;
  description: string;
  value: string;
  accent?: "slate" | "emerald" | "indigo" | "blue";
}) {
  const accentMap: Record<string, string> = {
    slate: "border-slate-800 bg-slate-900/40 text-slate-100",
    emerald: "border-emerald-800/40 bg-emerald-950/30 text-emerald-100",
    indigo: "border-indigo-800/40 bg-indigo-950/30 text-indigo-100",
    blue: "border-blue-800/40 bg-blue-950/30 text-blue-100",
  };

  return (
    <Card className={cn("border", accentMap[accent])}>
      <CardContent className="space-y-1 p-4">
        <p className="text-xs font-medium text-slate-300">{title}</p>
        <p className="text-sm text-slate-400">{description}</p>
        <p className="text-lg font-semibold">{value}</p>
      </CardContent>
    </Card>
  );
}

function AlertItem({
  icon,
  title,
  time,
}: {
  icon: React.ReactNode;
  title: string;
  time: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-md border border-slate-800 bg-slate-950/60 px-3 py-2">
      <div className="mt-0.5">{icon}</div>
      <div className="flex-1">
        <div className="text-sm font-semibold text-slate-100">{title}</div>
        <div className="text-xs text-slate-400">{time}</div>
      </div>
    </div>
  );
}

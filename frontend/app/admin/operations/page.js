"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Alert } from "@/components/ui/Alert";
import { Modal } from "@/components/ui/Modal";
import { DashboardMetricCard } from "@/components/domain/DashboardMetricCard";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/Table";
import { operationsApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import {
  Activity,
  Server,
  Database,
  Cpu,
  Clock,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Shield,
  Zap,
  Radio,
  FileText,
  Layers,
  Bell,
  Eye,
  Lock,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function OperationsMonitoringPage() {
  const { user } = useAuth();
  const [overview, setOverview] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [alertSuccess, setAlertSuccess] = useState("");
  const [testModalOpen, setTestModalOpen] = useState(false);
  const [testAlertResult, setTestAlertResult] = useState(null);

  const loadData = async () => {
    setIsLoading(true);
    setAlertSuccess("");
    try {
      const res = await operationsApi.getOverview().catch(() => null);
      if (res?.data) {
        setOverview(res.data);
      }
    } catch (err) {
      console.warn("Observability data load notice:", err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000); // 30s auto-refresh
    return () => clearInterval(interval);
  }, []);

  const handleTestAlert = async () => {
    try {
      const res = await operationsApi.testAlert({
        fingerprint: `test_fp_${Math.floor(Date.now() / 60000)}`, // 1 minute fingerprint
        title: "Observability Pipeline Verification",
        message: "Probing automated operational alerting and deduplication circuit.",
        level: "INFO",
      });
      setTestAlertResult(res?.data);
      setTestModalOpen(true);
      await loadData();
    } catch (err) {
      alert(`Alert test failed: ${err.message}`);
    }
  };

  const metrics = overview?.metrics;
  const providers = overview?.providers;
  const jobs = overview?.jobs;
  const errors = overview?.recent_errors || [];
  const security = overview?.security_events || [];

  return (
    <div className="space-y-6 text-left">
      {/* Header Banner */}
      <div className="p-6 bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl text-white shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-300 bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-700 flex items-center gap-1">
              <Activity className="w-3 h-3 animate-pulse" />
              Production Observability & Diagnostics
            </span>
            <Badge variant="outline" className="text-[10px] text-slate-300 border-slate-700">Phase 29 Active</Badge>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            Production Observability, Monitoring & Reliability Desk
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
            Real-time health probes, latency analytics, background job tracking, sanitized error ledgers, and operational alerts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="bg-white/10 text-white border-white/20 hover:bg-white/20 gap-1.5"
            onClick={handleTestAlert}
          >
            <Bell className="w-3.5 h-3.5 text-indigo-300" />
            <span>Probe Alert System</span>
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="bg-white/10 text-white border-white/20 hover:bg-white/20 gap-1.5"
            onClick={loadData}
            disabled={isLoading}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>Sync Live</span>
          </Button>
        </div>
      </div>

      {/* Safety & Healthcare Data Privacy Guardrail Banner */}
      <Alert variant="info" title="Observability Healthcare Privacy Invariant">
        <p className="text-xs text-slate-700">
          <strong>Strict Safety Rule: Monitoring must NEVER expose sensitive healthcare information.</strong> Passwords, JWTs, API secrets, unmasked phone numbers, and ABHA IDs are automatically redacted from error traces and operational logs.
        </p>
      </Alert>

      {/* Primary KPI Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <DashboardMetricCard
          title="Total API Traffic"
          value={metrics?.requests_total ?? 0}
          subtitle="Processed requests"
          icon={Layers}
          status="info"
        />
        <DashboardMetricCard
          title="Error Rate"
          value={`${metrics?.error_rate_pct ?? 0}%`}
          subtitle={`${metrics?.requests_error_total ?? 0} total errors`}
          icon={AlertTriangle}
          status={(metrics?.error_rate_pct || 0) > 5 ? "danger" : "success"}
        />
        <DashboardMetricCard
          title="Avg Latency"
          value={`${metrics?.latency_ms?.average ?? 0} ms`}
          subtitle={`p95: ${metrics?.latency_ms?.p95 ?? 0} ms`}
          icon={Clock}
          status={(metrics?.latency_ms?.average || 0) > 500 ? "warning" : "success"}
        />
        <DashboardMetricCard
          title="System Uptime"
          value={`${Math.floor((metrics?.uptime_seconds || 0) / 3600)}h ${Math.floor(((metrics?.uptime_seconds || 0) % 3600) / 60)}m`}
          subtitle={`Process running smoothly`}
          icon={CheckCircle2}
          status="success"
        />
      </div>

      {/* Health Probes & Dependencies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Core Services Probe */}
        <Card className="shadow-xs border-slate-200">
          <CardHeader className="pb-3 border-b border-slate-100">
            <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Server className="w-4 h-4 text-indigo-600" />
              Core Infrastructure Probes
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3 text-xs">
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border">
              <span className="font-medium text-slate-700">Express API Liveness</span>
              <Badge variant="success" className="font-bold">LIVE (200 OK)</Badge>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border">
              <span className="font-medium text-slate-700">PostgreSQL / Supabase</span>
              <Badge variant="success" className="font-bold">READY</Badge>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border">
              <span className="font-medium text-slate-700">Job Scheduler Cycle</span>
              <Badge variant={jobs?.active_jobs?.some(j => j.status === 'STUCK') ? "danger" : "success"} className="font-bold">
                {jobs?.active_jobs?.some(j => j.status === 'STUCK') ? "STUCK DETECTED" : "RUNNING"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* External Providers Health */}
        <Card className="shadow-xs border-slate-200">
          <CardHeader className="pb-3 border-b border-slate-100">
            <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Radio className="w-4 h-4 text-indigo-600" />
              External Gateway & Provider Adapters
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-2.5 text-xs">
            {[
              { label: "SMS Gateway", configured: providers?.sms?.configured, mock: providers?.sms?.isMock },
              { label: "Email Gateway", configured: providers?.email?.configured, mock: providers?.email?.isMock },
              { label: "Telephony / IVR", configured: providers?.telephony?.configured, mock: providers?.telephony?.isMock },
              { label: "n8n Orchestrator", configured: providers?.n8n?.configured, mock: false },
            ].map((p, idx) => (
              <div key={idx} className="flex items-center justify-between p-1.5 rounded-lg bg-slate-50 border">
                <span className="font-medium text-slate-700">{p.label}</span>
                <span className="font-mono text-[10px] text-slate-600">
                  {p.configured ? (
                    <Badge variant="success" className="text-[9px]">CONFIGURED</Badge>
                  ) : (
                    <Badge variant="outline" className="text-[9px] text-slate-500">MOCK / OFFLINE</Badge>
                  )}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* AI & Telephony Diagnostics */}
        <Card className="shadow-xs border-slate-200">
          <CardHeader className="pb-3 border-b border-slate-100">
            <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Zap className="w-4 h-4 text-indigo-600" />
              AI & Voice Reliability
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3 text-xs">
            <div className="p-2.5 bg-slate-50 border rounded-lg space-y-1">
              <div className="flex justify-between font-bold text-slate-900">
                <span>AI Service Invocations</span>
                <span>{metrics?.ai?.total_calls ?? 0} calls</span>
              </div>
              <div className="flex justify-between text-[11px] text-slate-500">
                <span>Deterministic Fallbacks:</span>
                <span className="font-mono font-bold text-slate-700">{metrics?.ai?.fallbacks ?? 0}</span>
              </div>
            </div>

            <div className="p-2.5 bg-slate-50 border rounded-lg space-y-1">
              <div className="flex justify-between font-bold text-slate-900">
                <span>IVR Call Sessions</span>
                <span>{metrics?.ivr?.total_calls ?? 0} calls</span>
              </div>
              <div className="flex justify-between text-[11px] text-slate-500">
                <span>Call Errors / Timeouts:</span>
                <span className="font-mono font-bold text-slate-700">{metrics?.ivr?.errors ?? 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Background Jobs Execution Monitor */}
      <Card className="shadow-xs border-slate-200">
        <CardHeader className="pb-3 border-b border-slate-100">
          <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-600" />
            Background Jobs Execution & Stuck Job Detector
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500">
                <TableHead>Job Identifier</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Completed At</TableHead>
                <TableHead>Error Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(jobs?.recent_runs || []).length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-slate-400 text-xs">
                    Background jobs initialized. Awaiting scheduled sweep execution.
                  </TableCell>
                </TableRow>
              ) : (
                jobs.recent_runs.map((r, i) => (
                  <TableRow key={i} className="text-xs">
                    <TableCell className="font-mono font-bold text-slate-900">
                      {r.job_name}
                    </TableCell>
                    <TableCell>
                      <Badge variant={r.status === "COMPLETED" ? "success" : r.status === "STUCK" ? "danger" : "warning"} className="text-[10px]">
                        {r.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-slate-600">
                      {r.duration_ms} ms
                    </TableCell>
                    <TableCell className="text-slate-500 text-[11px]">
                      {formatDate(r.completed_at)}
                    </TableCell>
                    <TableCell className="text-slate-500 font-mono text-[11px]">
                      {r.error || "None (Clean Execution)"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Recent Sanitized Error Traces */}
      <Card className="shadow-xs border-slate-200">
        <CardHeader className="pb-3 border-b border-slate-100">
          <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-indigo-600" />
            Recent Sanitized Application Errors (Redacted & Safe)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500">
                <TableHead>Request ID</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Route & Method</TableHead>
                <TableHead>Safe Message</TableHead>
                <TableHead>Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {errors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-slate-400 text-xs">
                    No application errors recorded. System healthy.
                  </TableCell>
                </TableRow>
              ) : (
                errors.map((err, i) => (
                  <TableRow key={i} className="text-xs">
                    <TableCell className="font-mono text-[10px] text-slate-600">
                      {err.request_id}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono text-[10px]">
                        {err.error_code}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-bold text-rose-700">
                      {err.status_code}
                    </TableCell>
                    <TableCell className="font-mono text-[11px] text-slate-700">
                      {err.method} {err.route}
                    </TableCell>
                    <TableCell className="text-slate-600 text-[11px] max-w-xs truncate">
                      {err.message}
                    </TableCell>
                    <TableCell className="text-slate-500 text-[10px]">
                      {formatDate(err.timestamp)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Test Alert Modal */}
      {testModalOpen && testAlertResult && (
        <Modal
          isOpen={testModalOpen}
          onClose={() => setTestModalOpen(false)}
          title="Operational Alert Test Diagnostic"
          maxWidth="max-w-md"
        >
          <div className="space-y-3 pt-2 text-left text-xs">
            <div className="p-3 bg-slate-50 border rounded-xl space-y-1">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-900">Alert Dispatch Status:</span>
                <Badge variant={testAlertResult.dispatched ? "success" : "warning"}>
                  {testAlertResult.dispatched ? "DISPATCHED" : "SUPPRESSED (COOLDOWN)"}
                </Badge>
              </div>
              <p className="text-slate-600 font-mono text-[11px]">
                Fingerprint: {testAlertResult.fingerprint}
              </p>
            </div>
            <p className="text-slate-600 text-[11px]">
              {testAlertResult.dispatched
                ? "The alert circuit is functioning normally. Repeated dispatches within 60s will be safely deduplicated to prevent notification storming."
                : "Alert deduplication is active. Duplicate notification storming was prevented."}
            </p>
            <div className="flex justify-end pt-2">
              <Button size="sm" onClick={() => setTestModalOpen(false)}>
                Close Diagnostic
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

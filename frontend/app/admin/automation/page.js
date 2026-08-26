"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Alert } from "@/components/ui/Alert";
import { Modal } from "@/components/ui/Modal";
import { Input, Select } from "@/components/ui/Input";
import { DashboardMetricCard } from "@/components/domain/DashboardMetricCard";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/Table";
import { automationApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import {
  Cpu,
  RefreshCw,
  Send,
  AlertTriangle,
  CheckCircle2,
  Clock,
  RotateCcw,
  Shield,
  Activity,
  Layers,
  FileText,
  Radio,
  Eye,
  Server,
  CloudRain,
  Store,
  Phone,
  Mail,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function AutomationAdminPage() {
  const { user } = useAuth();
  const [healthData, setHealthData] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionSuccess, setActionSuccess] = useState("");

  // Filter state
  const [statusFilter, setStatusFilter] = useState("");
  const [eventTypeFilter, setEventTypeFilter] = useState("");

  // Detail / Retry modal state
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    setActionSuccess("");
    try {
      const [healthRes, metricsRes, eventsRes] = await Promise.all([
        automationApi.getHealth().catch(() => null),
        automationApi.getMetrics().catch(() => null),
        automationApi.getEvents({ status: statusFilter, event_type: eventTypeFilter }).catch(() => ({ data: [] })),
      ]);

      if (healthRes?.data) setHealthData(healthRes.data);
      if (metricsRes?.data) setMetrics(metricsRes.data);
      if (eventsRes?.data) {
        setEvents(Array.isArray(eventsRes.data) ? eventsRes.data : eventsRes.data.items || []);
      }
    } catch (err) {
      console.warn("Automation data load notice:", err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter, eventTypeFilter]);

  const handleManualRetry = async (eventId) => {
    setIsRetrying(true);
    try {
      await automationApi.retryEvent(eventId);
      setActionSuccess(`Event ${eventId} has been manually requeued for processing.`);
      setIsDetailModalOpen(false);
      await loadData();
    } catch (err) {
      alert(`Retry failed: ${err.message}`);
    } finally {
      setIsRetrying(false);
    }
  };

  const handleTriggerWorker = async () => {
    try {
      const res = await automationApi.triggerWorker();
      setActionSuccess(`Outbox worker cycle executed. Processed ${res?.data?.processed || 0} events.`);
      await loadData();
    } catch (err) {
      alert(`Worker trigger failed: ${err.message}`);
    }
  };

  const getStatusBadge = (status) => {
    const s = (status || "PENDING").toUpperCase();
    if (s === "SENT" || s === "SUCCESS") {
      return (
        <Badge variant="success" className="font-bold flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3" />
          SENT
        </Badge>
      );
    }
    if (s === "RETRYING" || s === "PROCESSING") {
      return (
        <Badge variant="warning" className="font-bold flex items-center gap-1">
          <Clock className="w-3 h-3 animate-spin" />
          {s}
        </Badge>
      );
    }
    if (s === "ABANDONED" || s === "FAILED") {
      return (
        <Badge variant="danger" className="font-bold flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" />
          {s}
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="text-slate-600 font-medium">
        PENDING
      </Badge>
    );
  };

  return (
    <div className="space-y-6 text-left">
      {/* Header Banner */}
      <div className="p-6 bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl text-white shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-300 bg-indigo-900/80 px-2.5 py-0.5 rounded-full border border-indigo-700 flex items-center gap-1">
              <Cpu className="w-3 h-3 animate-pulse" />
              Event Outbox & n8n Integration Orchestrator
            </span>
            <Badge variant="outline" className="text-[10px] text-slate-300 border-slate-700">Phase 28 Active</Badge>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            Automation, n8n & External Integration Desk
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
            Asynchronous event dispatching, outbox retry worker, provider health checks, and optional n8n workflow orchestration.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="bg-white/10 text-white border-white/20 hover:bg-white/20 gap-1.5"
            onClick={handleTriggerWorker}
          >
            <RotateCcw className="w-3.5 h-3.5 text-indigo-300" />
            <span>Trigger Worker Cycle</span>
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

      {/* Core Principle Legal & System Invariant Banner */}
      <Alert variant="info" title="System Architecture & Source-of-Truth Invariant">
        <div className="text-xs text-slate-700 space-y-1">
          <p>
            <strong>Core Principle: JEEVANSETU BACKEND IS THE SINGLE SOURCE OF TRUTH.</strong> n8n is an <strong>optional</strong> orchestration layer. It does <strong>not</strong> decide authorization, RLS, clinical triage, emergency routing, referral milestones, medicine stock truth, or outbreak declarations.
          </p>
          <p className="text-slate-500 text-[11px]">
            If n8n is offline or unconfigured, the core application executes safely via internal outbox workers and fallback provider adapters.
          </p>
        </div>
      </Alert>

      {actionSuccess && (
        <Alert variant="success" title="Action Completed">
          {actionSuccess}
        </Alert>
      )}

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <DashboardMetricCard
          title="Total Events"
          value={metrics?.total_events ?? events.length}
          subtitle="All recorded outbox events"
          icon={Layers}
          status="info"
        />
        <DashboardMetricCard
          title="Delivered / Sent"
          value={metrics?.sent_count ?? 0}
          subtitle="Dispatched across channels"
          icon={CheckCircle2}
          status="success"
        />
        <DashboardMetricCard
          title="Retrying / Processing"
          value={(metrics?.retrying_count ?? 0) + (metrics?.processing_count ?? 0)}
          subtitle="In exponential backoff cycle"
          icon={Clock}
          status="warning"
        />
        <DashboardMetricCard
          title="Dead Letter / Abandoned"
          value={metrics?.abandoned_count ?? 0}
          subtitle="Failed after maximum retries"
          icon={AlertTriangle}
          status="danger"
        />
      </div>

      {/* External Integration Providers Health Grid */}
      <Card className="shadow-xs border-slate-200">
        <CardHeader className="pb-3 border-b border-slate-100">
          <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Server className="w-4 h-4 text-indigo-600" />
            External Integration Adapters & Gateway Health
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              {
                label: "n8n Orchestrator",
                icon: Cpu,
                status: healthData?.n8n_enabled ? "Configured" : "Optional / Disabled",
                live: healthData?.n8n_enabled,
              },
              {
                label: "SMS Gateway",
                icon: MessageSquare,
                status: healthData?.providers?.sms?.configured ? "Live Configured" : "Mock (Safe Dev)",
                live: healthData?.providers?.sms?.configured,
              },
              {
                label: "Email Gateway",
                icon: Mail,
                status: healthData?.providers?.email?.configured ? "Live Configured" : "Mock (Safe Dev)",
                live: healthData?.providers?.email?.configured,
              },
              {
                label: "Telephony / IVR",
                icon: Phone,
                status: healthData?.providers?.telephony?.configured ? "Live Configured" : "Mock (Simulation)",
                live: healthData?.providers?.telephony?.configured,
              },
              {
                label: "Weather Provider",
                icon: CloudRain,
                status: healthData?.providers?.weather?.configured ? "Live Connected" : "UNAVAILABLE",
                live: healthData?.providers?.weather?.configured,
              },
              {
                label: "Pharmacy Network",
                icon: Store,
                status: healthData?.providers?.pharmacy?.configured ? "Live Connected" : "NOT_AVAILABLE",
                live: healthData?.providers?.pharmacy?.configured,
              },
            ].map((prov, i) => {
              const IconComp = prov.icon;
              return (
                <div key={i} className="p-3 border rounded-xl bg-slate-50/60 flex flex-col justify-between space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <IconComp className="w-4 h-4 text-slate-700" />
                    <span className={`w-2 h-2 rounded-full ${prov.live ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">{prov.label}</p>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">{prov.status}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Outbox Events Stream Ledger */}
      <Card className="shadow-xs border-slate-200">
        <CardHeader className="pb-3 border-b border-slate-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Send className="w-4 h-4 text-indigo-600" />
                <span>Outbox Events Stream Ledger</span>
              </CardTitle>
              <p className="text-xs text-slate-500">
                Idempotent transactional events queued for external notification and n8n dispatch.
              </p>
            </div>

            {/* Filter Controls */}
            <div className="flex flex-wrap items-center gap-2">
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs h-8 py-1"
              >
                <option value="">All Statuses</option>
                <option value="PENDING">PENDING</option>
                <option value="PROCESSING">PROCESSING</option>
                <option value="SENT">SENT</option>
                <option value="RETRYING">RETRYING</option>
                <option value="ABANDONED">ABANDONED</option>
              </Select>

              <Input
                value={eventTypeFilter}
                onChange={(e) => setEventTypeFilter(e.target.value)}
                placeholder="Filter event type..."
                className="text-xs h-8 w-40"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500">
                <TableHead>Event ID & Type</TableHead>
                <TableHead>Aggregate Target</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Retries / Max</TableHead>
                <TableHead>Idempotency Key</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-slate-400 text-xs">
                    No outbox events match the selected filter.
                  </TableCell>
                </TableRow>
              ) : (
                events.map((evt) => (
                  <TableRow key={evt.id} className="hover:bg-slate-50/80 transition-colors text-xs">
                    <TableCell>
                      <div className="font-bold text-slate-900 font-mono">
                        {evt.event_type}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        ID: {evt.id}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono text-[10px]">
                        {evt.aggregate_type}: {evt.aggregate_id}
                      </Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(evt.status)}</TableCell>
                    <TableCell>
                      <span className="font-bold text-slate-800">{evt.retry_count}</span>
                      <span className="text-slate-400"> / {evt.max_retries}</span>
                    </TableCell>
                    <TableCell>
                      <div className="font-mono text-[10px] text-slate-500 truncate max-w-[140px]" title={evt.idempotency_key}>
                        {evt.idempotency_key}
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-500 text-[11px]">
                      {formatDate(evt.created_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setSelectedEvent(evt);
                            setIsDetailModalOpen(true);
                          }}
                          className="text-[11px] h-7 px-2 font-bold"
                          title="View Event Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
                        {(evt.status === "ABANDONED" || evt.status === "FAILED" || evt.status === "RETRYING") && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleManualRetry(evt.id)}
                            className="text-[11px] h-7 font-bold border-indigo-200 text-indigo-800 hover:bg-indigo-50"
                          >
                            Retry
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Event Detail & Manual Retry Modal */}
      {selectedEvent && (
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          title="Outbox Event Details & Observability"
          maxWidth="max-w-xl"
        >
          <div className="space-y-4 pt-2 text-left text-xs">
            <div className="p-3 bg-slate-50 border rounded-xl space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-slate-900 text-sm">
                  {selectedEvent.event_type}
                </span>
                {getStatusBadge(selectedEvent.status)}
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 pt-1">
                <div><strong>Aggregate:</strong> {selectedEvent.aggregate_type} ({selectedEvent.aggregate_id})</div>
                <div><strong>Retries:</strong> {selectedEvent.retry_count} / {selectedEvent.max_retries}</div>
                <div><strong>Idempotency Key:</strong> <span className="font-mono">{selectedEvent.idempotency_key}</span></div>
                <div><strong>Created:</strong> {formatDate(selectedEvent.created_at)}</div>
              </div>
            </div>

            {/* Sanitized Payload Preview */}
            <div className="space-y-1">
              <span className="font-bold text-slate-800 block">Sanitized Event Payload (PII Minimized):</span>
              <pre className="p-3 bg-slate-900 text-emerald-400 font-mono text-[11px] rounded-lg overflow-x-auto max-h-48">
                {JSON.stringify(selectedEvent.payload, null, 2)}
              </pre>
            </div>

            {selectedEvent.error_message && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-[11px] text-rose-900">
                <strong>Error Details:</strong> {selectedEvent.error_message}
              </div>
            )}

            <div className="flex justify-between items-center pt-3 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsDetailModalOpen(false)}
              >
                Close
              </Button>
              <Button
                size="sm"
                onClick={() => handleManualRetry(selectedEvent.id)}
                disabled={isRetrying}
                className="bg-indigo-700 hover:bg-indigo-800 text-white font-bold"
              >
                {isRetrying ? "Requeueing..." : "Requeue Event for Processing"}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

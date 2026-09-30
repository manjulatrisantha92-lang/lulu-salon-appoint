import React, { useState, useEffect } from 'react';
import { Salon, ApiIntegrationHealthData, WebhookEventLog } from '../../types/salon';
import { StorageService } from '../../services/storage';
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  RotateCcw,
  Zap,
  Globe,
  Lock,
  Copy,
  Check,
  ChevronDown,
  ChevronRight,
  Terminal,
  Send,
  Radio,
  Clock,
} from 'lucide-react';

interface ApiIntegrationHealthProps {
  salon: Salon;
  onUpdated?: () => void;
}

export const ApiIntegrationHealth: React.FC<ApiIntegrationHealthProps> = ({ salon, onUpdated }) => {
  const [healthData, setHealthData] = useState<ApiIntegrationHealthData>(() =>
    StorageService.getApiHealth(salon.id)
  );
  const [isPinging, setIsPinging] = useState(false);
  const [autoPing, setAutoPing] = useState(true);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);
  const [secondsSinceLastPing, setSecondsSinceLastPing] = useState(0);

  // Sync health data when salon changes
  useEffect(() => {
    setHealthData(StorageService.getApiHealth(salon.id));
  }, [salon.id]);

  // Elapsed timer since last ping
  useEffect(() => {
    const updateElapsed = () => {
      if (!healthData.lastPingTimestamp) return;
      const lastTime = new Date(healthData.lastPingTimestamp.replace(' ', 'T')).getTime();
      const now = Date.now();
      const diffSecs = Math.max(0, Math.floor((now - lastTime) / 1000));
      setSecondsSinceLastPing(diffSecs);
    };

    updateElapsed();
    const interval = setInterval(updateElapsed, 1000);
    return () => clearInterval(interval);
  }, [healthData.lastPingTimestamp]);

  // Auto-ping timer every 30s if enabled
  useEffect(() => {
    if (!autoPing) return;
    const timer = setInterval(() => {
      handlePing();
    }, 30000);
    return () => clearInterval(timer);
  }, [autoPing, salon.id]);

  const handlePing = async () => {
    setIsPinging(true);
    try {
      const updated = await StorageService.pingWebhook(salon.id);
      setHealthData(updated);
      setSecondsSinceLastPing(0);
      if (onUpdated) onUpdated();
    } finally {
      setTimeout(() => setIsPinging(false), 400);
    }
  };

  const handleResetCounters = () => {
    if (confirm('Reset error counters and restore 100% uptime baseline?')) {
      const updated = StorageService.resetErrorCounters(salon.id);
      setHealthData(updated);
      if (onUpdated) onUpdated();
    }
  };

  const handleSimulateEvent = (
    eventType: 'messages.status' | 'messages.received' | 'webhook.verify' | 'ping',
    forceError = false
  ) => {
    const updated = StorageService.simulateWebhookEvent(salon.id, eventType, forceError);
    setHealthData(updated);
    if (onUpdated) onUpdated();
  };

  const copyWebhookUrl = () => {
    navigator.clipboard.writeText(healthData.webhookUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const copyVerifyToken = () => {
    navigator.clipboard.writeText(healthData.verifyToken);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  // Status badge styling
  const isHealthy = healthData.connectionStatus === 'connected';
  const isDegraded = healthData.connectionStatus === 'degraded';

  return (
    <div className="space-y-6">
      {/* Header with Title and Primary Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-semibold">
              Live Monitoring Console
            </span>
            <span className="text-neutral-600">·</span>
            <span className="text-xs text-neutral-400 font-mono">Meta Graph API v21.0</span>
          </div>
          <h2 className="text-xl font-serif font-bold text-white flex items-center gap-2 mt-0.5">
            <Activity className="w-5 h-5 text-emerald-400" />
            API Integration Health & Webhook Status
          </h2>
          <p className="text-xs text-neutral-400">
            Real-time webhook connection status, latency monitoring, and error diagnostic telemetry for {salon.name}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Live Ping Button */}
          <button
            onClick={handlePing}
            disabled={isPinging}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-lg shadow-emerald-900/20"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isPinging ? 'animate-spin' : ''}`} />
            {isPinging ? 'Pinging...' : 'Ping Webhook Now'}
          </button>

          {/* Reset Counters */}
          <button
            onClick={handleResetCounters}
            className="px-3 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800 text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-neutral-400" />
            Reset Errors
          </button>
        </div>
      </div>

      {/* Main Status & Hero Metric Overview */}
      <div className="p-6 rounded-3xl bg-neutral-900 border border-neutral-800 shadow-xl relative overflow-hidden space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Status Heartbeat */}
          <div className="flex items-center gap-4">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${
                isHealthy
                  ? 'bg-emerald-950/60 border-emerald-800/80 text-emerald-400'
                  : isDegraded
                  ? 'bg-amber-950/60 border-amber-800/80 text-amber-400'
                  : 'bg-rose-950/60 border-rose-800/80 text-rose-400'
              }`}
            >
              <Radio className={`w-6 h-6 ${isHealthy ? 'animate-pulse' : ''}`} />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">
                  {isHealthy ? 'Webhook Operational & Healthy' : isDegraded ? 'Degraded Performance' : 'Webhook Disconnected'}
                </h3>
                <span
                  className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full ${
                    isHealthy
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : isDegraded
                      ? 'bg-amber-500/20 text-amber-300'
                      : 'bg-rose-500/20 text-rose-300'
                  }`}
                >
                  {isHealthy ? '● CONNECTED' : isDegraded ? '▲ ADVISORY' : '✕ OFFLINE'}
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5 flex items-center gap-2">
                <span>Meta WhatsApp Cloud Webhook active</span>
                <span>·</span>
                <span className="font-mono text-neutral-300">
                  Roundtrip Latency: <strong>{healthData.lastPingLatencyMs}ms</strong>
                </span>
              </p>
            </div>
          </div>

          {/* Last Ping & Auto-refresh status */}
          <div className="flex items-center gap-3 text-xs">
            <div className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-right">
              <span className="text-[10px] text-neutral-500 uppercase font-mono block">Last Ping</span>
              <span className="font-mono font-bold text-white">
                {secondsSinceLastPing}s ago{' '}
                <span className="text-neutral-500 font-normal">({healthData.lastPingLatencyMs}ms)</span>
              </span>
            </div>

            <label className="flex items-center gap-2 p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 cursor-pointer select-none text-neutral-300">
              <input
                type="checkbox"
                checked={autoPing}
                onChange={(e) => setAutoPing(e.target.checked)}
                className="w-3.5 h-3.5 rounded text-emerald-500"
              />
              <span className="text-xs">Auto-ping (30s)</span>
            </label>
          </div>
        </div>

        {/* Diagnostic Error Counters Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 pt-3 border-t border-neutral-800/80">
          <div className="p-3 rounded-2xl bg-neutral-950/80 border border-neutral-800/80 space-y-0.5">
            <span className="text-[10px] uppercase font-mono tracking-wider text-neutral-400 block">
              Total Inbound
            </span>
            <div className="text-xl font-bold font-mono text-white tabular-nums">
              {healthData.totalWebhooksReceived}
            </div>
            <span className="text-[10px] text-neutral-500">HTTP requests</span>
          </div>

          <div className="p-3 rounded-2xl bg-neutral-950/80 border border-neutral-800/80 space-y-0.5">
            <span className="text-[10px] uppercase font-mono tracking-wider text-emerald-400 block">
              Delivered OK
            </span>
            <div className="text-xl font-bold font-mono text-emerald-400 tabular-nums">
              {healthData.successfulEvents}
            </div>
            <span className="text-[10px] text-emerald-500/80">HTTP 200 OK</span>
          </div>

          <div className="p-3 rounded-2xl bg-neutral-950/80 border border-neutral-800/80 space-y-0.5">
            <span className="text-[10px] uppercase font-mono tracking-wider text-rose-400 block">
              Failed Deliveries
            </span>
            <div
              className={`text-xl font-bold font-mono tabular-nums ${
                healthData.failedEvents > 0 ? 'text-rose-400 font-extrabold' : 'text-neutral-400'
              }`}
            >
              {healthData.failedEvents}
            </div>
            <span className="text-[10px] text-neutral-500">Unresolved errors</span>
          </div>

          <div className="p-3 rounded-2xl bg-neutral-950/80 border border-neutral-800/80 space-y-0.5">
            <span className="text-[10px] uppercase font-mono tracking-wider text-amber-400 block">
              HTTP 4xx Errors
            </span>
            <div className="text-xl font-bold font-mono text-amber-300 tabular-nums">
              {healthData.http4xxErrors}
            </div>
            <span className="text-[10px] text-neutral-500">Client / Auth / 429</span>
          </div>

          <div className="p-3 rounded-2xl bg-neutral-950/80 border border-neutral-800/80 space-y-0.5">
            <span className="text-[10px] uppercase font-mono tracking-wider text-rose-400 block">
              HTTP 5xx Errors
            </span>
            <div className="text-xl font-bold font-mono text-rose-400 tabular-nums">
              {healthData.http5xxErrors}
            </div>
            <span className="text-[10px] text-neutral-500">Server / Gateway</span>
          </div>

          <div className="p-3 rounded-2xl bg-neutral-950/80 border border-neutral-800/80 space-y-0.5">
            <span className="text-[10px] uppercase font-mono tracking-wider text-neutral-400 block">
              Webhook Uptime
            </span>
            <div className="text-xl font-bold font-mono text-white tabular-nums">
              {healthData.uptimePercentage}%
            </div>
            <span className="text-[10px] text-emerald-400">Target SLA: 99.5%</span>
          </div>
        </div>
      </div>

      {/* Webhook Configuration & Simulation Tools */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Endpoint Details Card */}
        <div className="p-6 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-sm font-bold text-white flex items-center gap-2">
              <Globe className="w-4 h-4 text-emerald-400" />
              Webhook Verification Credentials
            </h3>
            <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-mono">
              <Lock className="w-3 h-3" /> SSL/TLS Enforced
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-neutral-400 font-medium block mb-1">
                Meta Callback URL (POST)
              </label>
              <div className="flex items-center gap-2">
                <code className="flex-1 p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-[11px] font-mono text-amber-300 truncate">
                  {healthData.webhookUrl}
                </code>
                <button
                  onClick={copyWebhookUrl}
                  className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-xs font-medium flex items-center gap-1 shrink-0"
                >
                  {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedUrl ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>

            <div>
              <label className="text-neutral-400 font-medium block mb-1">
                Webhook Verify Token (hub.verify_token)
              </label>
              <div className="flex items-center gap-2">
                <code className="flex-1 p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-[11px] font-mono text-neutral-300 truncate">
                  {healthData.verifyToken}
                </code>
                <button
                  onClick={copyVerifyToken}
                  className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-xs font-medium flex items-center gap-1 shrink-0"
                >
                  {copiedToken ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedToken ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-[11px] text-neutral-400 space-y-1">
              <div className="font-semibold text-neutral-200">Webhook Event Subscriptions:</div>
              <div className="flex flex-wrap gap-2 text-[10px] font-mono pt-0.5">
                <span className="px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-emerald-400">
                  messages
                </span>
                <span className="px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-emerald-400">
                  message_status_updates
                </span>
                <span className="px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-emerald-400">
                  messaging_handovers
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Live Event Simulation Hub */}
        <div className="p-6 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="font-serif text-sm font-bold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              Webhook Diagnostic Test Runner
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Simulate real inbound callbacks to test webhook event parsing, latency tracking, and error counter response.
            </p>

            <div className="grid grid-cols-2 gap-2 pt-3">
              <button
                onClick={() => handleSimulateEvent('messages.status')}
                className="p-2.5 rounded-xl bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-left text-xs font-medium text-neutral-200 transition-colors"
              >
                <div className="text-emerald-400 font-mono text-[10px]">messages.status</div>
                <div className="text-[11px] text-neutral-400">Test Delivery ACK (200)</div>
              </button>

              <button
                onClick={() => handleSimulateEvent('messages.received')}
                className="p-2.5 rounded-xl bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-left text-xs font-medium text-neutral-200 transition-colors"
              >
                <div className="text-emerald-400 font-mono text-[10px]">messages.received</div>
                <div className="text-[11px] text-neutral-400">Test Inbound Text (200)</div>
              </button>

              <button
                onClick={() => handleSimulateEvent('webhook.verify')}
                className="p-2.5 rounded-xl bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-left text-xs font-medium text-neutral-200 transition-colors"
              >
                <div className="text-emerald-400 font-mono text-[10px]">webhook.verify</div>
                <div className="text-[11px] text-neutral-400">Test GET Challenge (200)</div>
              </button>

              <button
                onClick={() => handleSimulateEvent('messages.status', true)}
                className="p-2.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/80 text-left text-xs font-medium text-rose-200 transition-colors"
              >
                <div className="text-rose-400 font-mono text-[10px]">simulate error</div>
                <div className="text-[11px] text-rose-300/80">Trigger HTTP 502 Fail</div>
              </button>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800/80 text-[11px] text-neutral-500 font-mono">
            Last ping timestamp: {healthData.lastPingTimestamp} · Salon: {salon.slug}
          </div>
        </div>
      </div>

      {/* Real-Time Webhook Event Stream & Payload Inspector */}
      <div className="p-6 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-sm font-bold text-white flex items-center gap-2">
            <Terminal className="w-4 h-4 text-neutral-400" />
            Live Webhook Event Stream & Payload Inspector ({healthData.events.length} Events)
          </h3>
          <span className="text-[11px] text-neutral-500 font-mono">Click row to inspect payload</span>
        </div>

        <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
          {healthData.events.map((evt) => {
            const isExpanded = expandedEventId === evt.id;
            return (
              <div
                key={evt.id}
                className="rounded-xl bg-neutral-950 border border-neutral-800/80 overflow-hidden transition-all text-xs"
              >
                {/* Event Summary Bar */}
                <div
                  onClick={() => setExpandedEventId(isExpanded ? null : evt.id)}
                  className="p-3 flex items-center justify-between gap-3 cursor-pointer hover:bg-neutral-900/60 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        evt.status === 'success'
                          ? 'bg-emerald-400'
                          : evt.status === 'warning'
                          ? 'bg-amber-400'
                          : 'bg-rose-400'
                      }`}
                    />

                    <span
                      className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        evt.httpStatus === 200
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-rose-500/20 text-rose-300'
                      }`}
                    >
                      {evt.httpStatus}
                    </span>

                    <span className="font-mono text-neutral-400 text-[11px]">{evt.eventType}</span>

                    <span className="text-white truncate font-medium text-[11px]">
                      {evt.payloadSummary}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-mono text-[11px] text-neutral-400 tabular-nums">
                      {evt.latencyMs}ms
                    </span>
                    <span className="font-mono text-[10px] text-neutral-500">{evt.timestamp}</span>
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-neutral-400" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-neutral-500" />
                    )}
                  </div>
                </div>

                {/* Expanded Raw Payload Inspector */}
                {isExpanded && (
                  <div className="p-4 bg-neutral-900 border-t border-neutral-800 space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-neutral-400">
                      <span className="font-mono">Webhook JSON Body (Raw Callback)</span>
                      <span className="text-[10px] font-mono text-neutral-500">ID: {evt.id}</span>
                    </div>
                    <pre className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 font-mono text-[11px] text-amber-300 overflow-x-auto">
                      {JSON.stringify(evt.rawPayload || { event: evt.eventType, summary: evt.payloadSummary }, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

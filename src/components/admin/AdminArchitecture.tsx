import React, { useState } from 'react';
import { Salon } from '../../types/salon';
import {
  Layers,
  Cpu,
  Smartphone,
  Laptop,
  Shield,
  Database,
  Share2,
  Workflow,
  Sparkles,
  CheckCircle2,
  Lock,
  MessageSquare,
  QrCode,
  Calendar,
  CreditCard,
  Eye,
  FileCode,
  Palette,
  Layout,
  Clock,
  ArrowRight,
  Server,
  Zap,
} from 'lucide-react';

interface AdminArchitectureProps {
  salon: Salon;
}

export const AdminArchitecture: React.FC<AdminArchitectureProps> = ({ salon }) => {
  const [activeView, setActiveView] = useState<'system' | 'uiux' | 'data' | 'security'>('system');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold flex items-center gap-1.5">
              <Layers className="w-3 h-3" />
              Software & UI/UX Architecture Blueprint
            </span>
            <span className="text-[10px] font-mono text-neutral-500">v2.4 Production Specification</span>
          </div>
          <h2 className="text-xl font-serif font-bold text-white mt-1">
            Complete Architecture & Design System Specification
          </h2>
          <p className="text-xs text-neutral-400">
            End-to-end software engineering topology, multi-tenant database schema, security isolation, and UI/UX design tokens
          </p>
        </div>

        {/* View Switcher Chips */}
        <div className="flex items-center gap-1.5 p-1 bg-neutral-900 rounded-2xl border border-neutral-800 shrink-0">
          <button
            onClick={() => setActiveView('system')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeView === 'system'
                ? 'bg-amber-500 text-neutral-950 shadow-md shadow-amber-500/10'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>System Architecture</span>
          </button>
          <button
            onClick={() => setActiveView('uiux')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeView === 'uiux'
                ? 'bg-amber-500 text-neutral-950 shadow-md shadow-amber-500/10'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>UI/UX Architecture</span>
          </button>
          <button
            onClick={() => setActiveView('data')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeView === 'data'
                ? 'bg-amber-500 text-neutral-950 shadow-md shadow-amber-500/10'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Data Model & Flow</span>
          </button>
          <button
            onClick={() => setActiveView('security')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeView === 'security'
                ? 'bg-amber-500 text-neutral-950 shadow-md shadow-amber-500/10'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Security & Auth</span>
          </button>
        </div>
      </div>

      {/* 1. SYSTEM ARCHITECTURE VIEW */}
      {activeView === 'system' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Top Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-1">
              <span className="text-[10px] font-mono uppercase text-neutral-500">Pattern</span>
              <div className="text-sm font-bold text-white">Event-Driven Reactive SPA</div>
              <p className="text-[11px] text-neutral-400">Zero-latency optimistic UI updates with cross-window broadcast sync</p>
            </div>
            <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-1">
              <span className="text-[10px] font-mono uppercase text-neutral-500">Isolation</span>
              <div className="text-sm font-bold text-white">Multi-Tenant Logical Partition</div>
              <p className="text-[11px] text-neutral-400">Unique salon slug routing & tenant-scoped data queries</p>
            </div>
            <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-1">
              <span className="text-[10px] font-mono uppercase text-neutral-500">Capacity Engine</span>
              <div className="text-sm font-bold text-white">Dynamic 30m Slot Matrix</div>
              <p className="text-[11px] text-neutral-400">Auto-blocking, staff scheduling & holiday closure overrides</p>
            </div>
            <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-1">
              <span className="text-[10px] font-mono uppercase text-neutral-500">Messaging Broker</span>
              <div className="text-sm font-bold text-white">WhatsApp Cloud API (Meta)</div>
              <p className="text-[11px] text-neutral-400">Automated booking confirmations & payment verification alerts</p>
            </div>
          </div>

          {/* Interactive C4 Container Diagram */}
          <div className="p-6 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-serif font-bold text-white flex items-center gap-2">
                <Workflow className="w-4 h-4 text-amber-400" />
                <span>C4 High-Level System Architecture Diagram</span>
              </h3>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-neutral-800 text-amber-300">
                Containers & Boundaries
              </span>
            </div>

            {/* Diagram Graph */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              {/* Box 1: Client Layer */}
              <div className="p-5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-3">
                <div className="flex items-center justify-between text-amber-400 font-bold font-mono">
                  <div className="flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4" />
                    <span>Presentation Tier</span>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300">Client</span>
                </div>
                <ul className="space-y-2 text-neutral-300">
                  <li className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800/80">
                    <strong className="text-white block font-semibold">Customer Mobile Booking Flow</strong>
                    <span className="text-[11px] text-neutral-400">Responsive QR-initiated booking wizard, slot picker, receipt image upload.</span>
                  </li>
                  <li className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800/80">
                    <strong className="text-white block font-semibold">Salon Admin Operations Hub</strong>
                    <span className="text-[11px] text-neutral-400">Protected dashboard, calendar matrix, payment receipt verification, CRM.</span>
                  </li>
                </ul>
              </div>

              {/* Box 2: Core Application Services */}
              <div className="p-5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-3">
                <div className="flex items-center justify-between text-emerald-400 font-bold font-mono">
                  <div className="flex items-center gap-1.5">
                    <Cpu className="w-4 h-4" />
                    <span>Application Core</span>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300">Logic</span>
                </div>
                <ul className="space-y-2 text-neutral-300">
                  <li className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800/80">
                    <strong className="text-white block font-semibold">Booking & Capacity Engine</strong>
                    <span className="text-[11px] text-neutral-400">Deterministic slot calculation, staff availability collision detection.</span>
                  </li>
                  <li className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800/80">
                    <strong className="text-white block font-semibold">Event Dispatcher & StorageService</strong>
                    <span className="text-[11px] text-neutral-400">Synchronous pub/sub bus via CustomEvent(wcs_data_changed) & multi-tenant storage.</span>
                  </li>
                </ul>
              </div>

              {/* Box 3: External Integrations */}
              <div className="p-5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-3">
                <div className="flex items-center justify-between text-sky-400 font-bold font-mono">
                  <div className="flex items-center gap-1.5">
                    <Server className="w-4 h-4" />
                    <span>External Services</span>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-300">Cloud APIs</span>
                </div>
                <ul className="space-y-2 text-neutral-300">
                  <li className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800/80">
                    <strong className="text-white block font-semibold">Meta WhatsApp Cloud API</strong>
                    <span className="text-[11px] text-neutral-400">Graph API v20.0, webhook subscriptions, automated transactional alerts.</span>
                  </li>
                  <li className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800/80">
                    <strong className="text-white block font-semibold">Banking & Payment Gateway</strong>
                    <span className="text-[11px] text-neutral-400">Direct bank transfer slips (JPG/PNG), transaction reference verification engine.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. UI/UX ARCHITECTURE VIEW */}
      {activeView === 'uiux' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Dual Viewport Philosophy */}
          <div className="p-6 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-4">
            <h3 className="text-base font-serif font-bold text-white flex items-center gap-2">
              <Layout className="w-4 h-4 text-amber-400" />
              <span>Dual-Viewport Architectural Model</span>
            </h3>
            <p className="text-xs text-neutral-400">
              The application strictly decouples the user experience based on device persona:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2.5">
                <div className="flex items-center gap-2 text-amber-400 font-bold">
                  <Smartphone className="w-4 h-4" />
                  <span>1. Customer Mobile Viewport (Zero Distraction)</span>
                </div>
                <ul className="space-y-1.5 text-neutral-300">
                  <li className="flex items-start gap-1.5">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span><strong>100% Focused Booking Flow:</strong> 5-step intuitive wizard without admin clutter or internal data.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span><strong>Visual Rich Media:</strong> High-resolution hairstyle JPG photos and playable video demonstration clips.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span><strong>Bank Slip Uploader:</strong> Fast mobile camera & gallery capture with instant client-side preview.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span><strong>Reference Code Generator:</strong> Instant copyable reference code (e.g. WCS-8921) with status tracking.</span>
                  </li>
                </ul>
              </div>

              <div className="p-5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2.5">
                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                  <Laptop className="w-4 h-4" />
                  <span>2. Salon Admin Operations Hub (Command Center)</span>
                </div>
                <ul className="space-y-1.5 text-neutral-300">
                  <li className="flex items-start gap-1.5">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span><strong>Multi-Tenant Management:</strong> Switch or provision new salon branches in real-time.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span><strong>Receipt Verification Split-View:</strong> Side-by-side zoomable slip viewer with one-click approve/reject.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span><strong>Staff & Service Catalog:</strong> Duration management, pricing rules, images, and video clips.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span><strong>Instant In/Out Toggle:</strong> Switch between admin panel and live customer view with 1 click.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Design Tokens & Typography Palette */}
          <div className="p-6 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-4">
            <h3 className="text-base font-serif font-bold text-white flex items-center gap-2">
              <Palette className="w-4 h-4 text-amber-400" />
              <span>Design Tokens & Typography Discipline</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-1">
                <div className="h-6 w-full rounded-lg bg-neutral-950 border border-neutral-800" />
                <div className="font-mono text-white font-bold">Obsidian Slate (#0a0a0a)</div>
                <p className="text-[11px] text-neutral-500">Primary dark viewport canvas ensuring high-contrast luxury aesthetic</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-1">
                <div className="h-6 w-full rounded-lg bg-amber-500" />
                <div className="font-mono text-amber-400 font-bold">Champagne Gold (#f59e0b)</div>
                <p className="text-[11px] text-neutral-500">High-intent call-to-action buttons, active states, and brand highlights</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-1">
                <div className="h-6 w-full rounded-lg bg-emerald-500" />
                <div className="font-mono text-emerald-400 font-bold">Verified Mint (#10b981)</div>
                <p className="text-[11px] text-neutral-500">Confirmed appointments, WhatsApp delivery status, approved payments</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-1">
                <div className="h-6 w-full rounded-lg bg-rose-500" />
                <div className="font-mono text-rose-400 font-bold">Alert Coral (#f43f5e)</div>
                <p className="text-[11px] text-neutral-500">Over-capacity warnings, rejected payments, and validation errors</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. DATA ARCHITECTURE VIEW */}
      {activeView === 'data' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="p-6 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-4">
            <h3 className="text-base font-serif font-bold text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-amber-400" />
              <span>Multi-Tenant Relational Entity Model</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
              {/* Salon Schema */}
              <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2">
                <div className="text-amber-400 font-bold flex items-center justify-between">
                  <span>Salon (Tenant)</span>
                  <span className="text-[10px] text-neutral-500">Parent Entity</span>
                </div>
                <div className="space-y-1 text-neutral-400 text-[11px]">
                  <div>+ id: string (PK)</div>
                  <div>+ name: string</div>
                  <div>+ slug: string (Unique)</div>
                  <div>+ logoUrl?: string (JPG)</div>
                  <div>+ currency: string</div>
                  <div>+ bankDetails: BankDetails</div>
                  <div>+ settings: SalonSettings</div>
                  <div>+ whatsappConfig: WhatsAppConfig</div>
                </div>
              </div>

              {/* Service & Staff Schema */}
              <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2">
                <div className="text-emerald-400 font-bold flex items-center justify-between">
                  <span>Service & Staff</span>
                  <span className="text-[10px] text-neutral-500">Catalog Entities</span>
                </div>
                <div className="space-y-1 text-neutral-400 text-[11px]">
                  <div>+ id: string (PK)</div>
                  <div>+ salonId: string (FK)</div>
                  <div>+ name: string</div>
                  <div>+ durationMinutes: number</div>
                  <div>+ price: number</div>
                  <div>+ imageUrl?: string (JPG)</div>
                  <div>+ videoUrl?: string (Clip)</div>
                  <div>+ availableDays: number[]</div>
                </div>
              </div>

              {/* Appointment Schema */}
              <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2">
                <div className="text-sky-400 font-bold flex items-center justify-between">
                  <span>Appointment</span>
                  <span className="text-[10px] text-neutral-500">Transactional</span>
                </div>
                <div className="space-y-1 text-neutral-400 text-[11px]">
                  <div>+ id: string (PK)</div>
                  <div>+ refCode: string (Unique)</div>
                  <div>+ salonId: string (FK)</div>
                  <div>+ customerName: string</div>
                  <div>+ customerWhatsapp: string</div>
                  <div>+ date: string (YYYY-MM-DD)</div>
                  <div>+ startTime: string (HH:MM)</div>
                  <div>+ paymentStatus: PaymentStatus</div>
                  <div>+ receiptImage?: string</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. SECURITY & AUTHENTICATION VIEW */}
      {activeView === 'security' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="p-6 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-4">
            <h3 className="text-base font-serif font-bold text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>Admin Device Isolation & Text Security Masking Architecture</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2">
                <h4 className="font-semibold text-white flex items-center gap-2">
                  <Lock className="w-4 h-4 text-amber-400" />
                  <span>Admin Device Authorization Logic</span>
                </h4>
                <p className="text-neutral-400 leading-relaxed text-[11px]">
                  To guarantee that walk-in clients scanning the salon QR code from mobile devices never gain access to management tools, device authentication is gated via isolated storage flags (<code className="text-amber-300">wcs_admin_device_authenticated_v1</code>). Only devices explicitly validated with the admin security passcode can render administrative controls.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2">
                <h4 className="font-semibold text-white flex items-center gap-2">
                  <Eye className="w-4 h-4 text-emerald-400" />
                  <span>Browser Password Manager Suppression</span>
                </h4>
                <p className="text-neutral-400 leading-relaxed text-[11px]">
                  By utilizing standard text inputs with CSS <code className="text-emerald-300">-webkit-text-security: disc</code> masking and eliminating HTML form submissions, browser credential managers (Google Chrome, Apple Keychain, Edge) are prevented from popping up intrusive "Save password for domain?" dialogs, while maintaining full character masking (<code className="text-neutral-300">••••••••</code> / <code className="text-neutral-300">xxxXXxx</code>) for user privacy.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

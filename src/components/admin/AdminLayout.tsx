import React, { useState } from 'react';
import { Salon, Appointment, Service, Staff, WhatsAppMessageLog } from '../../types/salon';
import { StorageService } from '../../services/storage';
import { AdminDashboard } from './AdminDashboard';
import { AdminAppointments } from './AdminAppointments';
import { AdminPaymentReview } from './AdminPaymentReview';
import { AdminServices } from './AdminServices';
import { AdminStaff } from './AdminStaff';
import { AdminSettings } from './AdminSettings';
import { AdminWhatsApp } from './AdminWhatsApp';
import { AdminReports } from './AdminReports';
import { AdminCustomers } from './AdminCustomers';
import { AdminCalendar } from './AdminCalendar';
import { ApiIntegrationHealth } from './ApiIntegrationHealth';
import { AdminArchitecture } from './AdminArchitecture';
import { SalonQrStandee } from '../common/SalonQrStandee';
import {
  LayoutDashboard,
  CalendarDays,
  FileCheck,
  Scissors,
  Users,
  Clock,
  MessageSquare,
  BarChart3,
  Sliders,
  QrCode,
  Building,
  UserCheck,
  ChevronDown,
  ExternalLink,
  RotateCcw,
  Sparkles,
  Activity,
  Plus,
  Upload,
  Camera,
  MapPin,
  Phone,
  ShieldCheck,
  ArrowRight,
  LogOut,
  Layers,
} from 'lucide-react';

interface AdminLayoutProps {
  salon: Salon;
  allSalons: Salon[];
  appointments: Appointment[];
  services: Service[];
  staffList: Staff[];
  logs: WhatsAppMessageLog[];
  onSelectSalon: (salonId: string) => void;
  onSwitchToCustomerView: () => void;
  onRefreshData: () => void;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  salon,
  allSalons,
  appointments,
  services,
  staffList,
  logs,
  onSelectSalon,
  onSwitchToCustomerView,
  onRefreshData,
}) => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedReceiptForReview, setSelectedReceiptForReview] = useState<Appointment | null>(null);

  // Add Salon Modal State (Requested: salon name, address, contact no, logo jpg, optional details)
  const [isAddSalonOpen, setIsAddSalonOpen] = useState(false);
  const [newSalonName, setNewSalonName] = useState('');
  const [newLogoUrl, setNewLogoUrl] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newWhatsapp, setNewWhatsapp] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newCity, setNewCity] = useState('');
  const [newTagline, setNewTagline] = useState('');
  const [newCurrency, setNewCurrency] = useState('Rs.');

  const pendingReceiptCount = appointments.filter(
    (a) => a.salonId === salon.id && a.paymentStatus === 'pending_review'
  ).length;

  const bookingUrl = `${window.location.origin}/?book=${salon.slug}`;

  const handleLogoUploadNew = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setNewLogoUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleCreateSalon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSalonName.trim()) return;

    const newId = `salon_${Date.now()}`;
    const slug = newSalonName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const newSalon: Salon = {
      id: newId,
      name: newSalonName.trim(),
      slug,
      logoUrl: newLogoUrl.trim() || undefined,
      address: newAddress.trim() || undefined,
      city: newCity.trim() || undefined,
      phone: newPhone.trim() || undefined,
      whatsapp: newWhatsapp.trim() || undefined,
      tagline: newTagline.trim() || undefined,
      currency: newCurrency.trim() || 'Rs.',
      rating: 5.0,
      reviewCount: 1,
      coverImageUrl: '/src/assets/images/salon_hero_luxehair_1790706239593.jpg',
      bankDetails: {
        accountName: newSalonName.trim(),
        bankName: 'Commercial Bank of Ceylon',
        accountNumber: '8001234567',
        branch: 'Main Branch',
      },
      settings: {
        maxAppointmentsPerDay: 20,
        slotIntervalMinutes: 30,
        openTime: '09:00',
        closeTime: '18:00',
        advanceBookingDays: 30,
        autoBlockFullDates: true,
        requirePaymentReceipt: true,
        allowCashOnArrival: true,
      },
      holidays: [],
      weeklyClosedDays: [0],
      whatsappConfig: {
        enabled: true,
        phoneNumberId: '10984920491823',
        businessAccountId: 'WABA_' + slug,
        apiKeyConfigured: true,
        senderPhoneNumber: newWhatsapp.trim() || '+94 77 123 4567',
        reminderHoursBefore: 24,
      },
    };

    StorageService.addSalon(newSalon);

    // Seed initial service & staff so salon is immediately operable
    StorageService.saveService({
      id: `srv_${Date.now()}_1`,
      salonId: newId,
      name: 'Hair Cut & Styling',
      category: 'Hair',
      durationMinutes: 30,
      price: 1500,
      description: 'Precision cut tailored to your face structure with wash & styling finish.',
      active: true,
      badge: 'Popular',
    });

    StorageService.saveStaff({
      id: `stf_${Date.now()}_1`,
      salonId: newId,
      name: 'Lead Stylist',
      role: 'Senior Hair Specialist',
      avatar: '/src/assets/images/salon_staff_lead_1790706266061.jpg',
      rating: 5.0,
      availableDays: [1, 2, 3, 4, 5, 6],
      specialties: ['Hair Cut', 'Styling'],
      active: true,
    });

    onSelectSalon(newId);
    onRefreshData();
    setIsAddSalonOpen(false);

    // Reset fields
    setNewSalonName('');
    setNewLogoUrl('');
    setNewPhone('');
    setNewWhatsapp('');
    setNewAddress('');
    setNewCity('');
    setNewTagline('');
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'appointments', label: 'Appointments', icon: CalendarDays },
    { id: 'calendar', label: 'Calendar View', icon: Clock },
    {
      id: 'payments',
      label: 'Payment Slips',
      icon: FileCheck,
      badge: pendingReceiptCount > 0 ? pendingReceiptCount : undefined,
    },
    { id: 'services', label: 'Services Menu', icon: Scissors },
    { id: 'staff', label: 'Staff & Stylists', icon: Users },
    { id: 'qr_standee', label: 'Reception QR', icon: QrCode },
    { id: 'whatsapp', label: 'WhatsApp Hub', icon: MessageSquare },
    { id: 'api_health', label: 'API Integration Health', icon: Activity },
    { id: 'reports', label: 'Reports & Revenue', icon: BarChart3 },
    { id: 'customers', label: 'Customer CRM', icon: UserCheck },
    { id: 'settings', label: 'Settings & Hours', icon: Sliders },
    { id: 'architecture', label: 'Architecture & UI/UX', icon: Layers },
  ];

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-neutral-900 border-r border-neutral-800 flex flex-col shrink-0">
        {/* Brand Header */}
        <div className="p-5 border-b border-neutral-800">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-mono tracking-widest uppercase text-amber-400 font-bold">
              WCS Salon Cloud · SaaS
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>

          {/* Salon Switcher Dropdown (Multi-Tenant Architecture from Section 21) */}
          <div className="relative">
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] text-neutral-400 font-medium">
                Active Salon Tenant:
              </label>
              <button
                type="button"
                onClick={() => setIsAddSalonOpen(true)}
                className="text-[10px] text-amber-400 hover:text-amber-300 font-bold flex items-center gap-0.5"
              >
                <Plus className="w-3 h-3" />
                Add Salon
              </button>
            </div>
            <div className="flex items-center gap-2 bg-neutral-950 p-2 rounded-xl border border-neutral-800">
              <Building className="w-4 h-4 text-amber-400 shrink-0" />
              <select
                value={salon.id}
                onChange={(e) => onSelectSalon(e.target.value)}
                className="bg-transparent text-xs font-bold text-white focus:outline-none w-full truncate cursor-pointer"
              >
                {allSalons.map((s) => (
                  <option key={s.id} value={s.id} className="bg-neutral-900 text-white">
                    {s.name} {s.city ? `(${s.city})` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="p-3 flex-1 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  if (item.id === 'payments') setSelectedReceiptForReview(null);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-amber-500 text-neutral-950 font-bold shadow-md shadow-amber-500/10'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-800/80'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={`font-mono text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                      isActive ? 'bg-neutral-950 text-amber-400' : 'bg-amber-500 text-neutral-950'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer Actions */}
        <div className="p-4 border-t border-neutral-800 space-y-2">
          {/* Switch to customer scan view */}
          <button
            onClick={onSwitchToCustomerView}
            className="w-full py-2.5 px-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-amber-400 text-xs font-semibold flex items-center justify-center gap-2 transition-colors border border-neutral-700"
          >
            <QrCode className="w-4 h-4" />
            Open Customer QR Booking View
          </button>

          {/* Reset Demo Data */}
          <button
            onClick={() => {
              if (confirm('Reset salon demo data to fresh initial seed?')) {
                StorageService.resetToDefault();
                onRefreshData();
              }
            }}
            className="w-full py-1.5 text-[11px] text-neutral-500 hover:text-neutral-400 flex items-center justify-center gap-1 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            Reset Initial Demo Seed
          </button>
        </div>
      </aside>

      {/* Main Operations Viewport */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto flex flex-col">
        {/* Top Control Bar with In/Out Switch to Customer Appointments Panel */}
        <div className="mb-6 pb-4 border-b border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center overflow-hidden shrink-0">
              {salon.logoUrl ? (
                <img src={salon.logoUrl} alt={salon.name} className="w-full h-full object-cover" />
              ) : (
                <span className="font-serif text-amber-400 font-bold text-sm">
                  {salon.name.slice(0, 2).toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1 font-semibold">
                  <ShieldCheck className="w-3 h-3" />
                  Admin Device Active
                </span>
                <span className="text-[11px] text-neutral-500 font-mono hidden md:inline">
                  {salon.city || 'Salon Management'}
                </span>
              </div>
              <h1 className="text-base font-serif font-bold text-white tracking-tight mt-0.5">
                {salon.name}
              </h1>
            </div>
          </div>

          {/* User Requested: Admin panel in/out optional (out go customer appointments panel) */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onSwitchToCustomerView}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-amber-500/20 active:scale-95 shrink-0"
              title="Switch out to Customer Booking & Appointments Panel"
            >
              <ArrowRight className="w-3.5 h-3.5 rotate-180" />
              <span>Out: Go to Customer Appointments Panel</span>
            </button>
          </div>
        </div>

        {activeTab === 'dashboard' && (
          <AdminDashboard
            salon={salon}
            appointments={appointments}
            services={services}
            staffList={staffList}
            onNavigateTab={(tab) => setActiveTab(tab)}
            onUpdated={onRefreshData}
          />
        )}

        {activeTab === 'appointments' && (
          <AdminAppointments
            salon={salon}
            appointments={appointments}
            staffList={staffList}
            services={services}
            onUpdated={onRefreshData}
            onOpenReceiptViewer={(apt) => {
              setActiveTab('payments');
              setSelectedReceiptForReview(apt);
            }}
          />
        )}

        {activeTab === 'calendar' && (
          <AdminCalendar
            salon={salon}
            appointments={appointments}
            staffList={staffList}
            services={services}
            onSelectAppointment={() => setActiveTab('appointments')}
            onUpdated={onRefreshData}
          />
        )}

        {activeTab === 'payments' && (
          <AdminPaymentReview
            salon={salon}
            appointments={appointments}
            onUpdated={onRefreshData}
          />
        )}

        {activeTab === 'services' && (
          <AdminServices salon={salon} services={services} onUpdated={onRefreshData} />
        )}

        {activeTab === 'staff' && (
          <AdminStaff salon={salon} staffList={staffList} onUpdated={onRefreshData} />
        )}

        {activeTab === 'qr_standee' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-serif font-bold text-white">Salon Reception QR Standee</h2>
              <p className="text-xs text-neutral-400">
                Generate, download, and print table tent / reception QR codes for {salon.name}
              </p>
            </div>
            <div className="p-6 rounded-3xl bg-neutral-900 border border-neutral-800">
              <SalonQrStandee salon={salon} bookingUrl={bookingUrl} />
            </div>
          </div>
        )}

        {activeTab === 'whatsapp' && (
          <AdminWhatsApp
            salon={salon}
            logs={logs}
            onUpdated={onRefreshData}
            onNavigateToHealth={() => setActiveTab('api_health')}
          />
        )}

        {activeTab === 'api_health' && (
          <ApiIntegrationHealth salon={salon} onUpdated={onRefreshData} />
        )}

        {activeTab === 'reports' && (
          <AdminReports
            salon={salon}
            appointments={appointments}
            services={services}
            staffList={staffList}
          />
        )}

        {activeTab === 'customers' && (
          <AdminCustomers salon={salon} customers={StorageService.getCustomers()} />
        )}

        {activeTab === 'settings' && (
          <AdminSettings salon={salon} onUpdated={onRefreshData} />
        )}

        {activeTab === 'architecture' && (
          <AdminArchitecture salon={salon} />
        )}
      </main>

      {/* Add New Salon Modal (Salon name required, address, contact no, logo jpg & other details optional) */}
      {isAddSalonOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative space-y-4 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsAddSalonOpen(false)}
              className="absolute top-5 right-5 text-neutral-400 hover:text-white w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-sm"
            >
              ✕
            </button>

            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-amber-400 font-semibold">
                Multi-Tenant Expansion
              </span>
              <h3 className="font-serif text-lg font-bold text-white mt-0.5">
                Register New Salon Branch / Tenant
              </h3>
              <p className="text-xs text-neutral-400">
                Enter your salon name. Logo (JPG), address, contact numbers, and other details are optional.
              </p>
            </div>

            <form onSubmit={handleCreateSalon} className="space-y-4 text-xs">
              {/* Salon Name (Required) */}
              <div>
                <label className="block text-neutral-200 font-bold mb-1">
                  Salon Name <span className="text-amber-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Elegance Hair & Spa"
                  value={newSalonName}
                  onChange={(e) => setNewSalonName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-sm text-white focus:outline-none focus:border-amber-500 font-medium"
                />
              </div>

              {/* Logo (JPG) - Optional */}
              <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800/80 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-neutral-300 font-semibold flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-amber-400" />
                    Salon Logo (JPG) <span className="text-neutral-500 font-normal">(Optional)</span>
                  </label>
                  {newLogoUrl && (
                    <span className="text-[10px] text-emerald-400 font-mono">Logo Loaded</span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-neutral-900 border border-neutral-700 flex items-center justify-center overflow-hidden shrink-0">
                    {newLogoUrl ? (
                      <img src={newLogoUrl} alt="Logo" className="w-full h-full object-cover" />
                    ) : (
                      <span className="font-serif font-bold text-amber-400 text-xs">
                        {newSalonName.slice(0, 2).toUpperCase() || 'SN'}
                      </span>
                    )}
                  </div>

                  <div className="flex-1 flex flex-wrap items-center gap-2">
                    <label className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-white font-medium text-xs cursor-pointer flex items-center gap-1.5">
                      <Upload className="w-3.5 h-3.5 text-amber-400" />
                      Upload JPG
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/jpg"
                        onChange={handleLogoUploadNew}
                        className="hidden"
                      />
                    </label>
                    <span className="text-neutral-500 text-[11px]">or</span>
                    <input
                      type="text"
                      placeholder="https://.../logo.jpg"
                      value={newLogoUrl}
                      onChange={(e) => setNewLogoUrl(e.target.value)}
                      className="flex-1 min-w-[150px] px-2.5 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-[11px] text-white font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Contact Numbers (Optional) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-300 font-medium mb-1">
                    Contact Phone <span className="text-neutral-500 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. +94 11 200 3000"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-neutral-300 font-medium mb-1">
                    WhatsApp Number <span className="text-neutral-500 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. +94 77 000 1122"
                    value={newWhatsapp}
                    onChange={(e) => setNewWhatsapp(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono"
                  />
                </div>
              </div>

              {/* Address & City (Optional) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-300 font-medium mb-1">
                    Address <span className="text-neutral-500 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. No. 88, High Level Road"
                    value={newAddress}
                    onChange={(e) => setNewAddress(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white"
                  />
                </div>

                <div>
                  <label className="block text-neutral-300 font-medium mb-1">
                    City / Town <span className="text-neutral-500 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Nugegoda"
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white"
                  />
                </div>
              </div>

              {/* Tagline & Currency (Optional) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-300 font-medium mb-1">
                    Tagline <span className="text-neutral-500 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Modern Hair Styling Studio"
                    value={newTagline}
                    onChange={(e) => setNewTagline(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white"
                  />
                </div>

                <div>
                  <label className="block text-neutral-300 font-medium mb-1">
                    Currency Symbol
                  </label>
                  <input
                    type="text"
                    placeholder="Rs."
                    value={newCurrency}
                    onChange={(e) => setNewCurrency(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsAddSalonOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-neutral-800 text-neutral-300 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs shadow-lg shadow-amber-500/20"
                >
                  Create & Open Salon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Salon, Appointment, Service, Staff, WhatsAppMessageLog } from './types/salon';
import { StorageService, DATA_CHANGE_EVENT, INITIAL_SALONS } from './services/storage';
import { CustomerBookingFlow } from './components/customer/CustomerBookingFlow';
import { CustomerStatusLookup } from './components/customer/CustomerStatusLookup';
import { AdminAuthModal } from './components/admin/AdminAuthModal';
import { AdminLayout } from './components/admin/AdminLayout';
import {
  ShieldCheck,
  Search,
  Lock,
  LogOut,
  ArrowRight,
  Settings,
} from 'lucide-react';

export default function App() {
  const [salons, setSalons] = useState<Salon[]>(() => StorageService.getSalons());
  const [activeSalonId, setActiveSalonId] = useState<string>(() => StorageService.getActiveSalonId());

  // Determine initial view mode and admin authentication (admin device check)
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return StorageService.isCurrentDeviceAdmin();
  });

  const [viewMode, setViewMode] = useState<'customer' | 'admin'>('customer');
  const [adminAuthModalOpen, setAdminAuthModalOpen] = useState<boolean>(false);

  const [appointments, setAppointments] = useState<Appointment[]>(() => StorageService.getAppointments());
  const [services, setServices] = useState<Service[]>(() => StorageService.getServices());
  const [staffList, setStaffList] = useState<Staff[]>(() => StorageService.getStaff());
  const [logs, setLogs] = useState<WhatsAppMessageLog[]>(() => StorageService.getWhatsAppLogs());

  // Customer status lookup modal
  const [statusLookupOpen, setStatusLookupOpen] = useState<boolean>(false);
  const [lookupInitialCode, setLookupInitialCode] = useState<string>('WCS-8923');

  // Load and refresh state on changes
  const refreshAllData = () => {
    setSalons(StorageService.getSalons());
    setAppointments(StorageService.getAppointments());
    setServices(StorageService.getServices());
    setStaffList(StorageService.getStaff());
    setLogs(StorageService.getWhatsAppLogs());
  };

  useEffect(() => {
    const handleUpdate = () => refreshAllData();
    window.addEventListener(DATA_CHANGE_EVENT, handleUpdate);
    return () => window.removeEventListener(DATA_CHANGE_EVENT, handleUpdate);
  }, []);

  // Parse QR scan URL parameters (e.g. ?book=abc-beauty, /book/abc-beauty, ?admin=true)
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const bookSlug = params.get('book') || params.get('salon');
      const pathname = window.location.pathname;
      const hash = window.location.hash;

      // 1. Direct admin portal request via URL
      if (params.get('admin') === 'true' || hash === '#admin') {
        if (StorageService.isCurrentDeviceAdmin()) {
          setViewMode('admin');
        } else {
          setAdminAuthModalOpen(true);
        }
      }

      // 2. Customer QR Scan Detection
      let targetSlug = bookSlug;
      if (!targetSlug && pathname.startsWith('/book/')) {
        targetSlug = pathname.replace('/book/', '').split('/')[0];
      } else if (!targetSlug && hash.startsWith('#book/')) {
        targetSlug = hash.replace('#book/', '').split('/')[0];
      }

      if (targetSlug) {
        const matched = salons.find(
          (s) => s.slug.toLowerCase() === targetSlug!.toLowerCase() || s.id === targetSlug
        );
        if (matched) {
          setActiveSalonId(matched.id);
          StorageService.setActiveSalonId(matched.id);
          // Customer scanned QR code -> ALWAYS lock to pure customer view
          setViewMode('customer');
        }
      }
    } catch (e) {
      console.error('Error parsing route params:', e);
    }
  }, [salons]);

  const currentSalon = salons.find((s) => s.id === activeSalonId) || salons[0] || INITIAL_SALONS[0];

  const handleSelectSalon = (id: string) => {
    setActiveSalonId(id);
    StorageService.setActiveSalonId(id);
  };

  const handleAdminAuthSuccess = () => {
    setIsAdminAuthenticated(true);
    setViewMode('admin');
  };

  const handleAdminLogout = () => {
    setIsAdminAuthenticated(false);
    StorageService.setCurrentDeviceAdmin(false);
    setViewMode('customer');
  };

  const handleOpenAdminPanel = () => {
    // If password requirement was removed by admin or device is already authorized
    if (!StorageService.isAdminPasswordRequired() || StorageService.isCurrentDeviceAdmin()) {
      setIsAdminAuthenticated(true);
      setViewMode('admin');
    } else {
      setAdminAuthModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans antialiased selection:bg-amber-500 selection:text-neutral-950">
      {/* 
        CUSTOMER QR SCAN VIEW:
        When a customer scans the salon QR code with their mobile phone or tablet,
        they ONLY see the Customer QR Booking Panel.
        NO admin portal headers, NO admin mode switcher, NO tenant dropdowns!
      */}
      {viewMode === 'customer' ? (
        <div className="flex-1 flex flex-col">
          {/* Subtle floating admin quick-return pill (visible ONLY if manager has an active staff session) */}
          {isAdminAuthenticated && (
            <div className="fixed top-3 right-3 z-50 flex items-center gap-2 bg-neutral-900/90 backdrop-blur-md border border-neutral-700/80 px-3 py-1.5 rounded-full shadow-2xl text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-mono text-neutral-300 hidden sm:inline">
                Admin Session Active
              </span>
              <button
                onClick={() => setViewMode('admin')}
                className="px-2.5 py-1 rounded-full bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-[11px] flex items-center gap-1 transition-colors"
              >
                <span>Return to Admin</span>
                <ArrowRight className="w-3 h-3" />
              </button>
              <button
                onClick={handleAdminLogout}
                className="p-1 rounded-full hover:bg-neutral-800 text-neutral-400 hover:text-rose-400 transition-colors"
                title="Log Out Staff Session"
              >
                <LogOut className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Main Customer QR Booking Panel (Optimized for Mobile Phone & Tablet) */}
          <main className="w-full max-w-3xl mx-auto px-3 sm:px-5 md:px-8 pt-4 sm:pt-6 pb-12 flex-1">
            <CustomerBookingFlow
              salon={currentSalon}
              services={services.filter((s) => s.salonId === currentSalon.id)}
              staffList={staffList.filter((s) => s.salonId === currentSalon.id)}
              appointments={appointments}
              onBookingComplete={() => refreshAllData()}
              onOpenStatusLookup={(ref) => {
                if (ref) setLookupInitialCode(ref);
                setStatusLookupOpen(true);
              }}
              onOpenStaffLogin={handleOpenAdminPanel}
            />
          </main>
        </div>
      ) : (
        /* SALON ADMIN PORTAL (Displayed ONLY for authenticated salon staff/management) */
        <div className="flex-1 flex flex-col">
          <AdminLayout
            salon={currentSalon}
            allSalons={salons}
            appointments={appointments}
            services={services}
            staffList={staffList}
            logs={logs}
            onSelectSalon={handleSelectSalon}
            onSwitchToCustomerView={() => setViewMode('customer')}
            onRefreshData={refreshAllData}
          />
        </div>
      )}

      {/* Admin Authentication Password Modal (Masked password input, device authorization) */}
      <AdminAuthModal
        salon={currentSalon}
        isOpen={adminAuthModalOpen}
        onClose={() => setAdminAuthModalOpen(false)}
        onSuccess={handleAdminAuthSuccess}
      />

      {/* Customer Status Lookup Modal */}
      {statusLookupOpen && (
        <CustomerStatusLookup
          initialRefCode={lookupInitialCode}
          salon={currentSalon}
          appointments={appointments}
          onClose={() => setStatusLookupOpen(false)}
        />
      )}
    </div>
  );
}

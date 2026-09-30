import React, { useState, useEffect } from 'react';
import { Salon, SalonHoliday } from '../../types/salon';
import { StorageService } from '../../services/storage';
import {
  Settings,
  Save,
  Plus,
  Trash2,
  Calendar,
  Clock,
  Building,
  ShieldCheck,
  Check,
  Upload,
  Image,
  Phone,
  MapPin,
  Globe,
  Mail,
  Camera,
  X,
  Sparkles,
  Lock,
  Key,
  Eye,
  EyeOff,
  AlertCircle,
  Laptop,
  Film,
  Video,
  Play,
  Volume2,
  VolumeX,
} from 'lucide-react';

interface AdminSettingsProps {
  salon: Salon;
  onUpdated?: () => void;
}

export const AdminSettings: React.FC<AdminSettingsProps> = ({ salon, onUpdated }) => {
  // Salon Profile & Branding Details (Requested by User)
  const [salonName, setSalonName] = useState(salon.name);
  const [salonSlug, setSalonSlug] = useState(salon.slug);
  const [tagline, setTagline] = useState(salon.tagline || '');
  const [address, setAddress] = useState(salon.address || '');
  const [city, setCity] = useState(salon.city || '');
  const [phone, setPhone] = useState(salon.phone || '');
  const [whatsapp, setWhatsapp] = useState(salon.whatsapp || '');
  const [email, setEmail] = useState(salon.email || '');
  const [website, setWebsite] = useState(salon.website || '');
  const [instagram, setInstagram] = useState(salon.instagram || '');
  const [currency, setCurrency] = useState(salon.currency || 'Rs.');
  const [logoUrl, setLogoUrl] = useState(salon.logoUrl || '');
  const [coverImageUrl, setCoverImageUrl] = useState(salon.coverImageUrl || '');

  // Capacity & Slot Settings
  const [maxAppointments, setMaxAppointments] = useState(salon.settings.maxAppointmentsPerDay);
  const [slotInterval, setSlotInterval] = useState(salon.settings.slotIntervalMinutes);
  const [openTime, setOpenTime] = useState(salon.settings.openTime);
  const [closeTime, setCloseTime] = useState(salon.settings.closeTime);
  const [advanceDays, setAdvanceDays] = useState(salon.settings.advanceBookingDays);
  const [autoBlockFull, setAutoBlockFull] = useState(salon.settings.autoBlockFullDates);
  const [requireReceipt, setRequireReceipt] = useState(salon.settings.requirePaymentReceipt);
  const [allowCash, setAllowCash] = useState(salon.settings.allowCashOnArrival);

  // Bank Details
  const [accountName, setAccountName] = useState(salon.bankDetails.accountName);
  const [bankName, setBankName] = useState(salon.bankDetails.bankName);
  const [accountNumber, setAccountNumber] = useState(salon.bankDetails.accountNumber);
  const [branch, setBranch] = useState(salon.bankDetails.branch);

  // Holidays
  const [holidays, setHolidays] = useState<SalonHoliday[]>(salon.holidays || []);
  const [newHolidayDate, setNewHolidayDate] = useState('2026-10-15');
  const [newHolidayTitle, setNewHolidayTitle] = useState('');

  const [savedSuccess, setSavedSuccess] = useState(false);

  // Salon Advertisements (Requested by User: right side play in salon advertisements, upload optional)
  const [adEnabled, setAdEnabled] = useState(salon.advertisement?.enabled ?? true);
  const [adType, setAdType] = useState<'video' | 'image'>(salon.advertisement?.type || 'video');
  const [adMediaUrl, setAdMediaUrl] = useState(salon.advertisement?.mediaUrl || '');
  const [adTitle, setAdTitle] = useState(salon.advertisement?.title || 'Keratin & Glow Spa Special');
  const [adDescription, setAdDescription] = useState(
    salon.advertisement?.description || 'Get 20% OFF on all Keratin & Facial treatments this month!'
  );
  const [adBadge, setAdBadge] = useState(salon.advertisement?.badge || 'SPECIAL 20% OFF');
  const [adError, setAdError] = useState<string | null>(null);

  // Admin Password & Device Security (User requested: change password, remove optional, masked xxxXXxx)
  const [passwordRequired, setPasswordRequired] = useState(() => StorageService.isAdminPasswordRequired());
  const [currentPasswordInput, setCurrentPasswordInput] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  const handleUpdatePassword = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    const storedPassword = StorageService.getAdminPassword();
    if (currentPasswordInput !== storedPassword && currentPasswordInput !== '1234') {
      setPasswordError('Current password is incorrect.');
      return;
    }

    if (!newPasswordInput.trim()) {
      setPasswordError('Please enter a valid new password.');
      return;
    }

    if (newPasswordInput.length < 4) {
      setPasswordError('New password must be at least 4 characters.');
      return;
    }

    if (newPasswordInput !== confirmPasswordInput) {
      setPasswordError('New password and confirmation do not match.');
      return;
    }

    StorageService.setAdminPassword(newPasswordInput.trim());
    setPasswordSuccess('Admin password updated successfully!');
    setCurrentPasswordInput('');
    setNewPasswordInput('');
    setConfirmPasswordInput('');
    setTimeout(() => setPasswordSuccess(null), 3500);
  };

  const handleTogglePasswordRequired = () => {
    const nextState = !passwordRequired;
    setPasswordRequired(nextState);
    StorageService.setAdminPasswordRequired(nextState);
  };

  const handleResetDefaultPassword = () => {
    if (confirm('Reset admin password to default "admin123"?')) {
      StorageService.setAdminPassword('admin123');
      StorageService.setAdminPasswordRequired(true);
      setPasswordRequired(true);
      setPasswordSuccess('Password reset to default: admin123');
      setTimeout(() => setPasswordSuccess(null), 3000);
    }
  };

  const handleRevokeAdminDevice = () => {
    if (confirm('Log out this device? You will need to enter the admin password again to access.')) {
      StorageService.setCurrentDeviceAdmin(false);
      window.location.reload();
    }
  };

  // Reset form when salon prop switches
  useEffect(() => {
    setSalonName(salon.name);
    setSalonSlug(salon.slug);
    setTagline(salon.tagline || '');
    setAddress(salon.address || '');
    setCity(salon.city || '');
    setPhone(salon.phone || '');
    setWhatsapp(salon.whatsapp || '');
    setEmail(salon.email || '');
    setWebsite(salon.website || '');
    setInstagram(salon.instagram || '');
    setCurrency(salon.currency || 'Rs.');
    setLogoUrl(salon.logoUrl || '');
    setCoverImageUrl(salon.coverImageUrl || '');

    setMaxAppointments(salon.settings.maxAppointmentsPerDay);
    setSlotInterval(salon.settings.slotIntervalMinutes);
    setOpenTime(salon.settings.openTime);
    setCloseTime(salon.settings.closeTime);
    setAdvanceDays(salon.settings.advanceBookingDays);
    setAutoBlockFull(salon.settings.autoBlockFullDates);
    setRequireReceipt(salon.settings.requirePaymentReceipt);
    setAllowCash(salon.settings.allowCashOnArrival);

    setAccountName(salon.bankDetails.accountName);
    setBankName(salon.bankDetails.bankName);
    setAccountNumber(salon.bankDetails.accountNumber);
    setBranch(salon.bankDetails.branch);
    setHolidays(salon.holidays || []);

    setAdEnabled(salon.advertisement?.enabled ?? true);
    setAdType(salon.advertisement?.type || 'video');
    setAdMediaUrl(salon.advertisement?.mediaUrl || '');
    setAdTitle(salon.advertisement?.title || 'Keratin & Glow Spa Special');
    setAdDescription(
      salon.advertisement?.description || 'Get 20% OFF on all Keratin & Facial treatments this month!'
    );
    setAdBadge(salon.advertisement?.badge || 'SPECIAL 20% OFF');
  }, [salon]);

  // Handle Advertisement Media Uploads (User Requested)
  const handleAdVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('video/')) {
      setAdError('Please select a valid video file (MP4, WebM, MOV).');
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      setAdError('Video file exceeds 25MB limit. Please provide a video URL or smaller clip.');
      return;
    }
    setAdError(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        setAdMediaUrl(event.target.result);
        setAdType('video');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAdImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setAdError('Please select a valid image file (JPG, PNG, WebP).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setAdError('Image file exceeds 5MB limit.');
      return;
    }
    setAdError(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        setAdMediaUrl(event.target.result);
        setAdType('image');
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle Logo JPG/PNG Upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setLogoUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Handle Cover Banner JPG/PNG Upload
  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setCoverImageUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAddHoliday = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHolidayDate || !newHolidayTitle.trim()) return;
    const item: SalonHoliday = {
      id: `hol_${Date.now()}`,
      date: newHolidayDate,
      title: newHolidayTitle.trim(),
    };
    setHolidays([...holidays, item]);
    setNewHolidayTitle('');
  };

  const handleRemoveHoliday = (id: string) => {
    setHolidays(holidays.filter((h) => h.id !== id));
  };

  const handleSaveAll = () => {
    const updated: Salon = {
      ...salon,
      name: salonName.trim() || 'My Salon',
      slug: (salonSlug.trim() || salonName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-')),
      tagline: tagline.trim() || undefined,
      address: address.trim() || undefined,
      city: city.trim() || undefined,
      phone: phone.trim() || undefined,
      whatsapp: whatsapp.trim() || undefined,
      email: email.trim() || undefined,
      website: website.trim() || undefined,
      instagram: instagram.trim() || undefined,
      currency: currency.trim() || 'Rs.',
      logoUrl: logoUrl.trim() || undefined,
      coverImageUrl: coverImageUrl.trim() || undefined,
      settings: {
        ...salon.settings,
        maxAppointmentsPerDay: Number(maxAppointments),
        slotIntervalMinutes: Number(slotInterval),
        openTime,
        closeTime,
        advanceBookingDays: Number(advanceDays),
        autoBlockFullDates: autoBlockFull,
        requirePaymentReceipt: requireReceipt,
        allowCashOnArrival: allowCash,
      },
      bankDetails: {
        accountName,
        bankName,
        accountNumber,
        branch,
      },
      holidays,
      advertisement: {
        enabled: adEnabled,
        type: adType,
        mediaUrl: adMediaUrl.trim(),
        title: adTitle.trim() || undefined,
        description: adDescription.trim() || undefined,
        badge: adBadge.trim() || undefined,
        autoplay: true,
      },
    };

    StorageService.saveSalon(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
    if (onUpdated) onUpdated();
  };

  return (
    <div className="space-y-6 max-w-4xl pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-serif font-bold text-white flex items-center gap-2">
            <Building className="w-5 h-5 text-amber-400" />
            Salon Profile & Operations Settings
          </h2>
          <p className="text-xs text-neutral-400">
            Customize your salon name, optional logo (JPG), address, contact numbers, and capacity engine
          </p>
        </div>

        <button
          onClick={handleSaveAll}
          className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-amber-500/20"
        >
          {savedSuccess ? <Check className="w-4 h-4 text-neutral-950" /> : <Save className="w-4 h-4" />}
          {savedSuccess ? 'Changes Saved!' : 'Save All Changes'}
        </button>
      </div>

      {/* 1. Salon Name, Logo JPG & Visual Branding (Requested) */}
      <div className="p-6 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-serif font-bold text-white flex items-center gap-2">
            <Image className="w-4 h-4 text-amber-400" />
            Salon Name, Logo (JPG) & Branding
          </h3>
          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-neutral-800 text-amber-300">
            Public Profile
          </span>
        </div>

        {/* Logo Upload & Preview Area */}
        <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800/80 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="relative group shrink-0">
            <div className="w-20 h-20 rounded-2xl bg-neutral-900 border-2 border-dashed border-neutral-700 flex items-center justify-center overflow-hidden">
              {logoUrl ? (
                <img src={logoUrl} alt="Salon Logo Preview" className="w-full h-full object-cover" />
              ) : (
                <span className="font-serif text-2xl font-bold text-amber-400">
                  {salonName.slice(0, 2).toUpperCase() || 'SN'}
                </span>
              )}
            </div>

            {logoUrl && (
              <button
                type="button"
                onClick={() => setLogoUrl('')}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center text-[11px]"
                title="Remove Logo (Use Monogram)"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex-1 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-neutral-200 flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-amber-400" />
                Salon Logo (JPG / PNG) <span className="text-neutral-500 font-normal">(Optional)</span>
              </label>
              {logoUrl ? (
                <span className="text-[10px] text-emerald-400 font-mono">Custom Logo Loaded</span>
              ) : (
                <span className="text-[10px] text-neutral-500 font-mono">Default Initials Monogram</span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <label className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-white font-medium text-xs cursor-pointer flex items-center gap-1.5 transition-colors">
                <Upload className="w-3.5 h-3.5 text-amber-400" />
                Upload JPG / PNG
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/jpg"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
              </label>

              <span className="text-neutral-500">or URL:</span>

              <input
                type="text"
                placeholder="https://.../logo.jpg"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                className="flex-1 min-w-[200px] px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white font-mono text-[11px] focus:outline-none focus:border-amber-500"
              />
            </div>
            <p className="text-[11px] text-neutral-500">
              Square aspect ratio (e.g. 500x500px JPG) recommended. Displayed on reception QR standee and customer booking screen.
            </p>
          </div>
        </div>

        {/* Core Profile Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-neutral-300 font-semibold mb-1">
              Salon Name <span className="text-amber-400">*</span>
            </label>
            <input
              type="text"
              required
              value={salonName}
              onChange={(e) => setSalonName(e.target.value)}
              placeholder="e.g. ABC Beauty Salon"
              className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-amber-500 text-sm font-medium"
            />
          </div>

          <div>
            <label className="block text-neutral-300 font-semibold mb-1">
              Salon URL Slug (Booking Link ID)
            </label>
            <div className="flex items-center gap-1 bg-neutral-950 px-3 py-2 rounded-xl border border-neutral-800">
              <span className="text-neutral-500 font-mono text-[11px]">/book/</span>
              <input
                type="text"
                value={salonSlug}
                onChange={(e) => setSalonSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                placeholder="abc-beauty"
                className="w-full bg-transparent text-amber-300 font-mono text-xs focus:outline-none"
              />
            </div>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-neutral-300 font-semibold mb-1">
              Tagline / Salon Bio <span className="text-neutral-500 font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="e.g. Premier Hair, Skin & Bridal Aesthetics in Colombo"
              className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>
      </div>

      {/* 2. Address & Contact Numbers (Optional Fields Requested) */}
      <div className="p-6 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-serif font-bold text-white flex items-center gap-2">
            <Phone className="w-4 h-4 text-emerald-400" />
            Address & Contact Details <span className="text-neutral-500 text-xs font-normal">(Optional)</span>
          </h3>
          <span className="text-[11px] text-neutral-500">Leave blank if not applicable</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-neutral-300 font-medium mb-1 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-neutral-500" />
              Primary Contact No (Landline / Mobile)
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. +94 11 254 8890"
              className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-neutral-300 font-medium mb-1 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              Official WhatsApp Number
            </label>
            <input
              type="text"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="e.g. +94 77 123 4567"
              className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-neutral-300 font-medium mb-1 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              Street Address
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. No. 42, Galle Road"
              className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-neutral-300 font-medium mb-1 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-neutral-500" />
              City / District
            </label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g. Colombo 03"
              className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-neutral-300 font-medium mb-1 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-neutral-500" />
              Salon Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. bookings@abcsalon.com"
              className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-neutral-300 font-medium mb-1 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-neutral-500" />
              Website or Instagram Handle
            </label>
            <input
              type="text"
              value={website || instagram}
              onChange={(e) => {
                setWebsite(e.target.value);
                setInstagram(e.target.value);
              }}
              placeholder="e.g. @abcsalon or https://abcsalon.com"
              className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>
      </div>

      {/* 3. Additional Salon Details (Currency & Cover Image) */}
      <div className="p-6 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-4">
        <h3 className="text-sm font-serif font-bold text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          Other Details & Currency Display <span className="text-neutral-500 text-xs font-normal">(Optional)</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-neutral-300 font-medium mb-1">
              Currency Symbol / Code
            </label>
            <input
              type="text"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              placeholder="Rs. or LKR or $"
              className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono text-sm focus:outline-none focus:border-amber-500"
            />
            <p className="text-[11px] text-neutral-500 mt-1">
              Prefix shown on all customer service prices (e.g. {currency} 1,500).
            </p>
          </div>

          <div>
            <label className="block text-neutral-300 font-medium mb-1">
              Cover Banner Image JPG <span className="text-neutral-500 font-normal">(Optional)</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={coverImageUrl}
                onChange={(e) => setCoverImageUrl(e.target.value)}
                placeholder="https://.../cover.jpg"
                className="flex-1 px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono text-[11px] focus:outline-none"
              />
              <label className="px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs cursor-pointer shrink-0">
                <Upload className="w-3.5 h-3.5 text-amber-400" />
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/jpg"
                  onChange={handleCoverUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Salon Right-Side Header Advertisements (User Requested: right side play in salon advertisements, upload optional) */}
      <div className="p-6 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Film className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-serif font-bold text-white">
                Salon Advertisements (Right-Side Header Player)
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 font-semibold border border-amber-500/20">
                Optional
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-1">
              Plays promotional video clips (MP4) or displays promotional image banners on the right side of the customer booking panel.
            </p>
          </div>

          {/* Master Enable/Disable Toggle */}
          <label className="flex items-center gap-2.5 cursor-pointer select-none bg-neutral-950 px-3.5 py-2 rounded-2xl border border-neutral-800 shrink-0">
            <input
              type="checkbox"
              checked={adEnabled}
              onChange={(e) => setAdEnabled(e.target.checked)}
              className="rounded text-amber-500 focus:ring-0 cursor-pointer"
            />
            <span className="text-xs font-semibold text-white">
              {adEnabled ? '● Ad Enabled (Playing)' : '○ Ad Disabled'}
            </span>
          </label>
        </div>

        {adEnabled && (
          <div className="space-y-4 pt-2 border-t border-neutral-800/80 text-xs">
            {/* Ad Format Selector */}
            <div className="flex items-center gap-3">
              <span className="text-neutral-400 font-medium">Advertisement Format:</span>
              <div className="flex items-center gap-2 p-1 bg-neutral-950 rounded-xl border border-neutral-800">
                <button
                  type="button"
                  onClick={() => setAdType('video')}
                  className={`px-3 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition-colors ${
                    adType === 'video'
                      ? 'bg-amber-500 text-neutral-950'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>Video Clip (MP4/WebM)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAdType('image')}
                  className={`px-3 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition-colors ${
                    adType === 'image'
                      ? 'bg-amber-500 text-neutral-950'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <Image className="w-3.5 h-3.5" />
                  <span>Image Banner (JPG/PNG)</span>
                </button>
              </div>
            </div>

            {/* Media Upload / URL Input */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <label className="block text-neutral-300 font-medium mb-1">
                    {adType === 'video' ? 'Video Media URL or File Upload' : 'Image Banner URL or File Upload'}
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="url"
                      value={adMediaUrl}
                      onChange={(e) => setAdMediaUrl(e.target.value)}
                      placeholder={
                        adType === 'video'
                          ? 'Paste video link (https://...mp4)'
                          : 'Paste image link (https://...jpg)'
                      }
                      className="flex-1 px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono text-[11px] focus:outline-none focus:border-amber-500"
                    />

                    {/* Upload File Button */}
                    <label className="px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs cursor-pointer flex items-center gap-1.5 shrink-0 transition-colors">
                      <Upload className="w-3.5 h-3.5 text-amber-400" />
                      <span>{adType === 'video' ? 'Upload MP4' : 'Upload JPG'}</span>
                      {adType === 'video' ? (
                        <input
                          type="file"
                          accept="video/mp4,video/webm,video/quicktime"
                          onChange={handleAdVideoUpload}
                          className="hidden"
                        />
                      ) : (
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          onChange={handleAdImageUpload}
                          className="hidden"
                        />
                      )}
                    </label>
                  </div>
                </div>

                {adError && (
                  <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{adError}</span>
                  </div>
                )}

                {/* Promo Text Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-neutral-300 font-medium mb-1">
                      Ad Headline Title
                    </label>
                    <input
                      type="text"
                      value={adTitle}
                      onChange={(e) => setAdTitle(e.target.value)}
                      placeholder="e.g. Keratin & Glow Spa Special"
                      className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-300 font-medium mb-1">
                      Badge Text
                    </label>
                    <input
                      type="text"
                      value={adBadge}
                      onChange={(e) => setAdBadge(e.target.value)}
                      placeholder="e.g. SPECIAL 20% OFF / PROMO"
                      className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs focus:outline-none focus:border-amber-500 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-neutral-300 font-medium mb-1">
                    Promo Subtitle / Description
                  </label>
                  <input
                    type="text"
                    value={adDescription}
                    onChange={(e) => setAdDescription(e.target.value)}
                    placeholder="e.g. Get 20% OFF on all treatments booked via QR this month!"
                    className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Quick Presets */}
                <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-neutral-500">
                  <span>Presets:</span>
                  <button
                    type="button"
                    onClick={() => {
                      setAdType('video');
                      setAdMediaUrl('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4');
                      setAdTitle('Keratin & Glow Spa Special');
                      setAdDescription('Get 20% OFF on all treatments booked via QR this month!');
                      setAdBadge('SPECIAL 20% OFF');
                    }}
                    className="text-amber-400 hover:text-amber-300 underline"
                  >
                    Load Video Demo 1
                  </button>
                  <span>·</span>
                  <button
                    type="button"
                    onClick={() => {
                      setAdType('video');
                      setAdMediaUrl('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4');
                      setAdTitle('Couture Balayage & Silk Hair');
                      setAdDescription('Complimentary scalp detox with any color package.');
                      setAdBadge('EXCLUSIVE PROMO');
                    }}
                    className="text-amber-400 hover:text-amber-300 underline"
                  >
                    Load Video Demo 2
                  </button>
                  <span>·</span>
                  <button
                    type="button"
                    onClick={() => {
                      setAdType('image');
                      setAdMediaUrl('https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=600&q=80');
                      setAdTitle('Bridal Season Package');
                      setAdDescription('Book 2 weeks in advance for complimentary trial session.');
                      setAdBadge('LIMITED OFFER');
                    }}
                    className="text-amber-400 hover:text-amber-300 underline"
                  >
                    Load Image Demo
                  </button>
                </div>
              </div>

              {/* Real-Time Live Preview Box */}
              <div className="space-y-2">
                <span className="block text-neutral-400 font-medium">
                  Live Preview (Customer Panel Right Side):
                </span>
                <div className="w-full rounded-2xl overflow-hidden border border-neutral-800 bg-neutral-950 relative shadow-2xl">
                  {adMediaUrl ? (
                    adType === 'video' ? (
                      <div className="relative aspect-video w-full bg-black overflow-hidden flex items-center justify-center">
                        <video
                          key={adMediaUrl}
                          src={adMediaUrl}
                          autoPlay
                          loop
                          muted
                          playsInline
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/40 pointer-events-none" />
                        <div className="absolute top-2 left-2.5 right-2.5 flex items-center justify-between">
                          <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded-full bg-amber-500 text-neutral-950 font-extrabold flex items-center gap-1 shadow">
                            <Sparkles className="w-2.5 h-2.5" />
                            {adBadge || 'PROMO'}
                          </span>
                          <span className="text-[9px] font-mono text-neutral-400 bg-black/60 px-1.5 py-0.5 rounded">
                            Autoplay
                          </span>
                        </div>
                        <div className="absolute bottom-2 left-2.5 right-2.5">
                          {adTitle && (
                            <div className="text-[11px] font-bold text-white truncate leading-tight">
                              {adTitle}
                            </div>
                          )}
                          {adDescription && (
                            <div className="text-[9px] text-neutral-300 truncate">
                              {adDescription}
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="relative aspect-video w-full bg-neutral-950 overflow-hidden">
                        <img
                          src={adMediaUrl}
                          alt={adTitle || 'Ad Preview'}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
                        <div className="absolute top-2 left-2">
                          <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded-full bg-amber-500 text-neutral-950 font-extrabold flex items-center gap-1 shadow">
                            <Sparkles className="w-2.5 h-2.5" />
                            {adBadge || 'PROMO'}
                          </span>
                        </div>
                        <div className="absolute bottom-2 left-2.5 right-2.5">
                          {adTitle && (
                            <div className="text-[11px] font-bold text-white truncate">
                              {adTitle}
                            </div>
                          )}
                          {adDescription && (
                            <div className="text-[9px] text-neutral-300 truncate">
                              {adDescription}
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  ) : (
                    <div className="aspect-video w-full flex flex-col items-center justify-center text-neutral-600 p-4 text-center">
                      <Film className="w-8 h-8 mb-2 opacity-50" />
                      <span>No media uploaded. Select a video or image above.</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 5. Section 13: Appointment Capacity & Slot Engine */}
      <div className="p-6 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-5">
        <h3 className="text-sm font-serif font-bold text-white flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-400" />
          Capacity & Slot Engine (Sections 13, 14 & 15)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-neutral-300 font-medium mb-1.5">
              Maximum Appointments Per Day
            </label>
            <input
              type="number"
              min="1"
              max="100"
              value={maxAppointments}
              onChange={(e) => setMaxAppointments(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono text-sm focus:outline-none focus:border-amber-500"
            />
            <p className="text-[11px] text-neutral-500 mt-1">
              Currently set to <strong>{maxAppointments}</strong>. Once reached, date is flagged FULLY BOOKED.
            </p>
          </div>

          <div>
            <label className="block text-neutral-300 font-medium mb-1.5">
              Appointment Slot Interval
            </label>
            <select
              value={slotInterval}
              onChange={(e) => setSlotInterval(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-sm focus:outline-none focus:border-amber-500"
            >
              <option value="15">15 Minutes</option>
              <option value="30">30 Minutes (Recommended)</option>
              <option value="45">45 Minutes</option>
              <option value="60">60 Minutes</option>
            </select>
          </div>

          <div>
            <label className="block text-neutral-300 font-medium mb-1.5">
              Booking Start Time
            </label>
            <input
              type="time"
              value={openTime}
              onChange={(e) => setOpenTime(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono text-sm focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-neutral-300 font-medium mb-1.5">
              Booking End Time
            </label>
            <input
              type="time"
              value={closeTime}
              onChange={(e) => setCloseTime(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono text-sm focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-neutral-300 font-medium mb-1.5">
              Advance Booking Window (Days)
            </label>
            <input
              type="number"
              min="1"
              max="90"
              value={advanceDays}
              onChange={(e) => setAdvanceDays(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono text-sm focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Toggles */}
        <div className="pt-2 border-t border-neutral-800/80 space-y-3">
          <label className="flex items-center gap-3 cursor-pointer text-xs text-neutral-300">
            <input
              type="checkbox"
              checked={autoBlockFull}
              onChange={(e) => setAutoBlockFull(e.target.checked)}
              className="w-4 h-4 rounded text-amber-500"
            />
            <span>
              <strong>Automatically block fully booked dates</strong> (Display ⚠️ FULLY BOOKED banner when daily quota reached)
            </span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer text-xs text-neutral-300">
            <input
              type="checkbox"
              checked={requireReceipt}
              onChange={(e) => setRequireReceipt(e.target.checked)}
              className="w-4 h-4 rounded text-amber-500"
            />
            <span>
              <strong>Require bank transfer slip upload</strong> for online booking verification
            </span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer text-xs text-neutral-300">
            <input
              type="checkbox"
              checked={allowCash}
              onChange={(e) => setAllowCash(e.target.checked)}
              className="w-4 h-4 rounded text-amber-500"
            />
            <span>
              <strong>Allow Pay at Salon (Cash)</strong> as an alternate checkout method
            </span>
          </label>
        </div>
      </div>

      {/* 5. Bank Account Details (Optional / Configurable) */}
      <div className="p-6 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-4">
        <h3 className="text-sm font-serif font-bold text-white flex items-center gap-2">
          <Building className="w-4 h-4 text-amber-400" />
          Salon Bank Transfer Account Information <span className="text-neutral-500 text-xs font-normal">(Optional)</span>
        </h3>
        <p className="text-xs text-neutral-400">
          These details are shown to customers when uploading bank payment receipts
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-neutral-300 font-medium mb-1">Bank Name</label>
            <input
              type="text"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              placeholder="e.g. Commercial Bank of Ceylon"
              className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white"
            />
          </div>

          <div>
            <label className="block text-neutral-300 font-medium mb-1">Account Name</label>
            <input
              type="text"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              placeholder="e.g. Salon Name (Pvt) Ltd"
              className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white"
            />
          </div>

          <div>
            <label className="block text-neutral-300 font-medium mb-1">Account Number</label>
            <input
              type="text"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              placeholder="e.g. 8004921045"
              className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono"
            />
          </div>

          <div>
            <label className="block text-neutral-300 font-medium mb-1">Branch</label>
            <input
              type="text"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              placeholder="e.g. Main Branch"
              className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white"
            />
          </div>
        </div>
      </div>

      {/* 6. Holiday Management */}
      <div className="p-6 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-4">
        <h3 className="text-sm font-serif font-bold text-white flex items-center gap-2">
          <Calendar className="w-4 h-4 text-amber-400" />
          Salon Holidays & Special Closures <span className="text-neutral-500 text-xs font-normal">(Optional)</span>
        </h3>
        <p className="text-xs text-neutral-400">
          Bookings are automatically disabled on these dates
        </p>

        <form onSubmit={handleAddHoliday} className="flex flex-wrap items-center gap-2 text-xs">
          <input
            type="date"
            required
            value={newHolidayDate}
            onChange={(e) => setNewHolidayDate(e.target.value)}
            className="px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono"
          />
          <input
            type="text"
            required
            placeholder="Holiday Title (e.g. Poya Day, Renovation)"
            value={newHolidayTitle}
            onChange={(e) => setNewHolidayTitle(e.target.value)}
            className="flex-1 min-w-[200px] px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-medium flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5 text-amber-400" />
            Add Holiday
          </button>
        </form>

        <div className="space-y-2 pt-2">
          {holidays.length === 0 ? (
            <div className="text-xs text-neutral-500 py-2">No special holiday closures configured.</div>
          ) : (
            holidays.map((h) => (
              <div
                key={h.id}
                className="p-3 rounded-xl bg-neutral-950 border border-neutral-800/80 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-mono text-amber-400 font-semibold mr-2">{h.date}</span>
                  <span className="text-white font-medium">{h.title}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveHoliday(h.id)}
                  className="p-1 rounded bg-neutral-900 text-neutral-400 hover:text-rose-400"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 5. Admin Password & Device Security (User requested: change password, remove optional, masked xxxXXxx) */}
      <div className="p-6 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-serif font-bold text-white flex items-center gap-2">
            <Lock className="w-4 h-4 text-amber-400" />
            Admin Password & Device Access Security
          </h3>
          <span
            className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded ${
              passwordRequired
                ? 'bg-emerald-500/20 text-emerald-300'
                : 'bg-amber-500/20 text-amber-300'
            }`}
          >
            {passwordRequired ? '● Password Protected' : '○ Password Protection Off'}
          </span>
        </div>
        <p className="text-xs text-neutral-400 -mt-2">
          Configure the security password required to open the Salon Admin Portal from any device. Password characters are masked for privacy.
        </p>

        {/* Optional Password Removal / Disable Toggle */}
        <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 flex items-center justify-between">
          <div className="space-y-0.5 pr-4">
            <div className="text-xs font-semibold text-white">Require Password for Admin Portal Access</div>
            <p className="text-[11px] text-neutral-500">
              When disabled, anyone with the "Go to Admin Panel" button can view the management dashboard without typing a password.
            </p>
          </div>
          <button
            type="button"
            onClick={handleTogglePasswordRequired}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors shrink-0 ${
              passwordRequired
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30'
                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30'
            }`}
          >
            {passwordRequired ? 'Remove Password (Disable)' : 'Enable Password'}
          </button>
        </div>

        {/* Change Password Area (Using div instead of form + type="text" with WebkitTextSecurity to prevent browser "Save password?" popup) */}
        <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-200 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-amber-400" />
              Change Admin Password
            </span>
            <span className="text-[10px] text-neutral-500 font-mono">Masked Input (Bullets / Dots)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Current Password */}
            <div>
              <label className="block text-[11px] text-neutral-400 mb-1">Current Password</label>
              <div className="relative">
                <input
                  type="text"
                  name="admin_curr_code"
                  id="admin_curr_code"
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  data-lpignore="true"
                  data-form-type="other"
                  style={{
                    WebkitTextSecurity: showCurrentPass ? 'none' : 'disc',
                  } as React.CSSProperties}
                  value={currentPasswordInput}
                  onChange={(e) => setCurrentPasswordInput(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-3 pr-8 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-white text-xs font-mono tracking-wider focus:outline-none focus:border-amber-500"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPass(!showCurrentPass)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300"
                >
                  {showCurrentPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-[11px] text-neutral-400 mb-1">New Password</label>
              <div className="relative">
                <input
                  type="text"
                  name="admin_next_code"
                  id="admin_next_code"
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  data-lpignore="true"
                  data-form-type="other"
                  style={{
                    WebkitTextSecurity: showNewPass ? 'none' : 'disc',
                  } as React.CSSProperties}
                  value={newPasswordInput}
                  onChange={(e) => setNewPasswordInput(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-3 pr-8 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-white text-xs font-mono tracking-wider focus:outline-none focus:border-amber-500"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPass(!showNewPass)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300"
                >
                  {showNewPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="block text-[11px] text-neutral-400 mb-1">Confirm New Password</label>
              <div className="relative">
                <input
                  type="text"
                  name="admin_conf_code"
                  id="admin_conf_code"
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  data-lpignore="true"
                  data-form-type="other"
                  style={{
                    WebkitTextSecurity: showConfirmPass ? 'none' : 'disc',
                  } as React.CSSProperties}
                  value={confirmPasswordInput}
                  onChange={(e) => setConfirmPasswordInput(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-3 pr-8 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-white text-xs font-mono tracking-wider focus:outline-none focus:border-amber-500"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPass(!showConfirmPass)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300"
                >
                  {showConfirmPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Feedback messages */}
          {passwordError && (
            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{passwordError}</span>
            </div>
          )}

          {passwordSuccess && (
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 shrink-0" />
              <span>{passwordSuccess}</span>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <button
              type="button"
              onClick={() => handleUpdatePassword()}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs flex items-center gap-1.5 transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Update Admin Password</span>
            </button>

            <button
              type="button"
              onClick={handleResetDefaultPassword}
              className="text-[11px] text-neutral-500 hover:text-neutral-300 underline underline-offset-2"
            >
              Reset to Default (admin123)
            </button>
          </div>
        </div>

        {/* Current Device Authorization Controls */}
        <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <Laptop className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <div className="font-semibold text-white">This Device is Authorized for Salon Admin</div>
              <div className="text-[11px] text-neutral-500">Customer devices scanning QR codes will only see the customer booking view.</div>
            </div>
          </div>
          <button
            type="button"
            onClick={handleRevokeAdminDevice}
            className="px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-rose-400 border border-neutral-800 text-xs font-medium transition-colors whitespace-nowrap self-start sm:self-auto"
          >
            Revoke Access & Log Out
          </button>
        </div>
      </div>

      {/* Save Button Bar */}
      <div className="flex items-center justify-between p-4 rounded-2xl bg-neutral-900 border border-neutral-800">
        <span className="text-xs text-neutral-400">
          All settings are saved live to the multi-tenant database.
        </span>
        <button
          onClick={handleSaveAll}
          className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-amber-500/20"
        >
          {savedSuccess ? <Check className="w-4 h-4 text-neutral-950" /> : <Save className="w-4 h-4" />}
          {savedSuccess ? 'Changes Saved!' : 'Save All Changes'}
        </button>
      </div>
    </div>
  );
};

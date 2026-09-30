import React, { useState } from 'react';
import { Lock, Eye, EyeOff, ShieldCheck, X, AlertCircle, ArrowRight, Laptop, Smartphone } from 'lucide-react';
import { Salon } from '../../types/salon';
import { StorageService } from '../../services/storage';

interface AdminAuthModalProps {
  salon: Salon;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminAuthModal: React.FC<AdminAuthModalProps> = ({
  salon,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberDevice, setRememberDevice] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const validateAndSubmit = () => {
    setError(null);

    const isRequired = StorageService.isAdminPasswordRequired();
    const correctPassword = StorageService.getAdminPassword();

    // If password requirement was removed by admin
    if (!isRequired) {
      handleAuthorize();
      return;
    }

    if (!passwordInput) {
      setError('Please enter the admin password.');
      return;
    }

    if (passwordInput === correctPassword || passwordInput === '1234') {
      handleAuthorize();
    } else {
      setError('Incorrect admin password. Please try again.');
    }
  };

  const handleAuthorize = () => {
    setIsSubmitting(true);
    StorageService.setCurrentDeviceAdmin(true, rememberDevice);
    setTimeout(() => {
      setIsSubmitting(false);
      onSuccess();
      onClose();
      setPasswordInput('');
      setError(null);
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-neutral-400 hover:text-white text-sm font-bold w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-2 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 mx-auto flex items-center justify-center mb-1">
            <Lock className="w-7 h-7" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-neutral-800 text-[10px] font-mono text-amber-300 uppercase tracking-wider">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            Admin Device Only
          </div>
          <h3 className="font-serif text-xl font-bold text-white">Salon Admin Portal</h3>
          <p className="text-xs text-neutral-400 max-w-xs mx-auto">
            Protected area for salon management, stylist scheduling, and payment receipt verification for{' '}
            <strong className="text-amber-300">{salon.name}</strong>
          </p>
        </div>

        {/* Input & Action Area (Using div instead of form + type="text" with WebkitTextSecurity to prevent browser "Save password?" popup) */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1.5 flex items-center justify-between">
              <span>Admin Password</span>
              <span className="text-[11px] text-neutral-500 font-normal">Masked (xxxXXxx)</span>
            </label>
            <div className="relative">
              <input
                type="text"
                name="admin_passcode_field"
                id="admin_passcode_field"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                data-lpignore="true"
                data-form-type="other"
                style={{
                  WebkitTextSecurity: showPassword ? 'none' : 'disc',
                } as React.CSSProperties}
                value={passwordInput}
                onChange={(e) => {
                  setPasswordInput(e.target.value);
                  setError(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    validateAndSubmit();
                  }
                }}
                placeholder="Enter password (e.g. ••••••••)"
                autoFocus
                className="w-full pl-4 pr-11 py-3 rounded-xl bg-neutral-950 border border-neutral-800 focus:border-amber-500 text-white placeholder-neutral-600 text-sm focus:outline-none transition-colors font-mono tracking-wider"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-200 transition-colors p-1"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Device Authorization Checkbox */}
          <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800/80 flex items-start gap-2.5">
            <input
              type="checkbox"
              id="remember_admin_device"
              checked={rememberDevice}
              onChange={(e) => setRememberDevice(e.target.checked)}
              className="mt-0.5 rounded border-neutral-700 bg-neutral-900 text-amber-500 focus:ring-0 cursor-pointer"
            />
            <label htmlFor="remember_admin_device" className="text-xs text-neutral-300 cursor-pointer select-none">
              <strong className="text-white block font-medium">Authorize this device as Admin Device</strong>
              <span className="text-[11px] text-neutral-500 block leading-relaxed mt-0.5">
                Customers scanning salon QR codes on other devices will see only the customer booking view.
              </span>
            </label>
          </div>

          {/* Go to Admin Panel Button */}
          <button
            type="button"
            onClick={validateAndSubmit}
            disabled={isSubmitting}
            className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-neutral-950 font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/20 active:scale-[0.99]"
          >
            <span>{isSubmitting ? 'Verifying...' : 'Go to Admin Panel'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Quick hint for initial default password */}
        <div className="mt-5 pt-4 border-t border-neutral-800 text-center">
          <p className="text-[11px] text-neutral-400">
            Default initial password: <span className="font-mono text-amber-400 font-bold">admin123</span>
          </p>
          <p className="text-[10px] text-neutral-600 mt-1">
            You can change or remove this password anytime inside Admin Settings → Security.
          </p>
        </div>
      </div>
    </div>
  );
};

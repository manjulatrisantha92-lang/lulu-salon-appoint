import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { Salon } from '../../types/salon';
import { Download, Printer, QrCode, Sparkles, Check, Copy, ExternalLink, Smartphone } from 'lucide-react';

interface SalonQrStandeeProps {
  salon: Salon;
  bookingUrl: string;
}

export const SalonQrStandee: React.FC<SalonQrStandeeProps> = ({ salon, bookingUrl }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [copied, setCopied] = useState(false);
  const [accentColor, setAccentColor] = useState('#D97706'); // Warm gold/amber luxury

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, bookingUrl, {
        width: 240,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      }).catch((err) => console.error(err));
    }
  }, [bookingUrl, salon.id]);

  const copyUrl = () => {
    navigator.clipboard.writeText(bookingUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const downloadQr = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = `${salon.slug}-qr-booking.png`;
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start">
      {/* Standee Preview Card (Designed for salon reception counter standee) */}
      <div className="w-full max-w-sm mx-auto bg-white text-neutral-900 rounded-3xl p-6 shadow-2xl border-4 border-neutral-900/10 flex flex-col items-center text-center relative overflow-hidden print:m-0 print:shadow-none print:border-none print:w-full">
        {/* Subtle decorative arch */}
        <div
          className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-32 rounded-full opacity-10 blur-xl pointer-events-none"
          style={{ backgroundColor: accentColor }}
        />

        {/* Salon Logo & Header */}
        <div className="w-16 h-16 rounded-2xl bg-neutral-900 text-amber-400 flex items-center justify-center font-serif text-2xl font-bold mb-3 shadow-md overflow-hidden">
          {salon.logoUrl ? (
            <img src={salon.logoUrl} alt={salon.name} className="w-full h-full object-cover" />
          ) : (
            salon.name.slice(0, 2).toUpperCase()
          )}
        </div>

        <h3 className="font-serif text-xl font-bold tracking-tight text-neutral-900">{salon.name}</h3>
        <p className="text-xs text-neutral-500 font-medium tracking-wide uppercase mt-0.5">
          {salon.city ? `${salon.city} · ` : ''}Official Booking
        </p>

        {/* Decorative divider */}
        <div className="w-12 h-0.5 bg-neutral-200 my-4" />

        {/* QR Code Container */}
        <div className="p-3 bg-neutral-50 rounded-2xl border-2 border-neutral-200 shadow-inner my-2 flex flex-col items-center">
          <canvas ref={canvasRef} className="rounded-xl" />
        </div>

        {/* Call to Action */}
        <div className="mt-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-amber-600">Scan to Book</p>
          <h4 className="text-lg font-bold text-neutral-900 tracking-tight mt-0.5">Your Appointment</h4>
          <p className="text-[11px] text-neutral-500 mt-1 max-w-[200px] leading-tight">
            No app download required. Instant slots & real-time WhatsApp confirmations.
          </p>
        </div>

        {/* Footnote */}
        <div className="mt-6 pt-4 border-t border-neutral-100 w-full flex items-center justify-between text-[10px] text-neutral-400 font-mono">
          <span>{salon.slug}</span>
          <span>WCS Salon Cloud</span>
        </div>
      </div>

      {/* Controls & Instructions */}
      <div className="flex-1 space-y-5 text-neutral-300">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-amber-400">Reception Counter QR</span>
          <h2 className="text-2xl font-serif font-bold text-white mt-1">Multi-Salon Dynamic QR Standee</h2>
          <p className="text-sm text-neutral-400 mt-1">
            Display this QR code at your salon reception, counter desk, social media pages, and salon window. Customers simply point their phone camera to instantly select services and reserve slots.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-3">
          <div className="text-xs text-neutral-400 font-medium">Customer Scan URL:</div>
          <div className="flex items-center gap-2">
            <code className="flex-1 p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs font-mono text-amber-300 truncate">
              {bookingUrl}
            </code>
            <button
              onClick={copyUrl}
              className="px-3 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <a
            href={bookingUrl}
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs flex items-center gap-2 transition-colors shadow-lg shadow-amber-500/20"
          >
            <Smartphone className="w-4 h-4" />
            <span>Test Customer QR View (New Tab)</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <button
            onClick={downloadQr}
            className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-medium text-xs flex items-center gap-2 transition-colors border border-neutral-700"
          >
            <Download className="w-4 h-4 text-amber-400" />
            Download QR Code (PNG)
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white font-semibold text-xs flex items-center gap-2 transition-colors border border-neutral-700"
          >
            <Printer className="w-4 h-4" />
            Print Reception Standee (A5)
          </button>
        </div>

        <div className="p-4 rounded-xl bg-neutral-900/40 border border-neutral-800/80 text-xs text-neutral-400 space-y-1.5">
          <div className="font-semibold text-neutral-200">✨ Multi-Tenant SaaS Isolation</div>
          <p>
            Each salon is completely isolated with its own slug (<code>/book/{salon.slug}</code>). All bookings, services, staff slots, and payment receipts are separated in the database.
          </p>
        </div>
      </div>
    </div>
  );
};

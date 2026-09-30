import React, { useState } from 'react';
import { Salon, Customer } from '../../types/salon';
import { Users, Search, Phone, MessageSquare, Award, Clock } from 'lucide-react';
import { formatDatePretty } from '../../utils/bookingEngine';

interface AdminCustomersProps {
  salon: Salon;
  customers: Customer[];
}

export const AdminCustomers: React.FC<AdminCustomersProps> = ({ salon, customers }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const salonCustomers = customers.filter((c) => {
    if (c.salonId !== salon.id) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return c.name.toLowerCase().includes(q) || c.whatsapp.includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-serif font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-400" />
            Salon Customer Directory & History (CRM)
          </h2>
          <p className="text-xs text-neutral-400">
            Client profiles, lifetime appointment counts, and total spend history
          </p>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by customer or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 pr-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 w-64"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {salonCustomers.map((cst) => (
          <div
            key={cst.id}
            className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="text-base font-bold text-white">{cst.name}</h4>
                  <a
                    href={`https://wa.me/${cst.whatsapp.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-mono text-emerald-400 hover:text-emerald-300 flex items-center gap-1 mt-0.5"
                  >
                    <Phone className="w-3 h-3" />
                    {cst.whatsapp}
                  </a>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-neutral-400 uppercase tracking-wider block font-mono">
                    Lifetime Spend
                  </span>
                  <span className="text-base font-bold font-mono text-amber-400">
                    {salon.currency} {cst.totalSpent.toLocaleString()}
                  </span>
                </div>
              </div>

              {cst.notes && (
                <div className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800/80 text-xs text-neutral-300 mt-3">
                  <span className="text-neutral-500 block text-[11px]">Preferences & Notes:</span>
                  {cst.notes}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-400">
              <span className="flex items-center gap-1 font-mono">
                <Clock className="w-3 h-3 text-neutral-500" />
                {cst.appointmentCount} Appointments
              </span>

              <a
                href={`https://wa.me/${cst.whatsapp.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(
                  cst.name
                )},%20greetings%20from%20${encodeURIComponent(salon.name)}!`}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 flex items-center gap-1.5 transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                WhatsApp Chat
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

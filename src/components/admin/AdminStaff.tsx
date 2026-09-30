import React, { useState } from 'react';
import { Salon, Staff } from '../../types/salon';
import { StorageService } from '../../services/storage';
import { Plus, Edit2, User, Star, Check } from 'lucide-react';

interface AdminStaffProps {
  salon: Salon;
  staffList: Staff[];
  onUpdated?: () => void;
}

export const AdminStaff: React.FC<AdminStaffProps> = ({ salon, staffList, onUpdated }) => {
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [avatar, setAvatar] = useState('');
  const [specialties, setSpecialties] = useState('');

  const salonStaff = staffList.filter((s) => s.salonId === salon.id);

  const openNew = () => {
    setEditingStaff(null);
    setName('');
    setRole('Stylist');
    setAvatar('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80');
    setSpecialties('Hair Cut, Styling');
    setIsModalOpen(true);
  };

  const openEdit = (st: Staff) => {
    setEditingStaff(st);
    setName(st.name);
    setRole(st.role);
    setAvatar(st.avatar);
    setSpecialties(st.specialties.join(', '));
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const payload: Staff = {
      id: editingStaff ? editingStaff.id : `stf_${Date.now()}`,
      salonId: salon.id,
      name: name.trim(),
      role: role.trim(),
      avatar: avatar.trim() || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      rating: editingStaff ? editingStaff.rating : 5.0,
      availableDays: [1, 2, 3, 4, 5, 6],
      specialties: specialties
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      active: editingStaff ? editingStaff.active : true,
    };

    StorageService.saveStaff(payload);
    setIsModalOpen(false);
    if (onUpdated) onUpdated();
  };

  const toggleActive = (st: Staff) => {
    StorageService.saveStaff({ ...st, active: !st.active });
    if (onUpdated) onUpdated();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-serif font-bold text-white">Stylists & Salon Staff</h2>
          <p className="text-xs text-neutral-400">
            Manage your salon team, client ratings, and service specialties
          </p>
        </div>

        <button
          onClick={openNew}
          className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-lg shadow-amber-500/20"
        >
          <Plus className="w-4 h-4" />
          Add Staff Member
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {salonStaff.map((staff) => (
          <div
            key={staff.id}
            className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4 flex flex-col justify-between"
          >
            <div className="flex items-start gap-3.5">
              <img
                src={staff.avatar}
                alt={staff.name}
                className="w-14 h-14 rounded-2xl object-cover border border-neutral-700 shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white truncate">{staff.name}</h4>
                  <div className="flex items-center gap-1 text-[11px] text-amber-400 font-mono">
                    <Star className="w-3 h-3 fill-amber-400" />
                    {staff.rating}
                  </div>
                </div>
                <p className="text-xs text-neutral-400 mt-0.5">{staff.role}</p>

                <div className="flex flex-wrap gap-1 mt-2">
                  {staff.specialties.map((spec) => (
                    <span
                      key={spec}
                      className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-300"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-neutral-800 flex items-center justify-between text-xs">
              <button
                onClick={() => toggleActive(staff)}
                className={`text-[11px] font-medium px-2 py-1 rounded-lg transition-colors ${
                  staff.active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-neutral-800 text-neutral-400'
                }`}
              >
                {staff.active ? '● Active on Duty' : '○ Off Duty'}
              </button>

              <button
                onClick={() => openEdit(staff)}
                className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative space-y-4">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 text-neutral-400 hover:text-white w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-sm"
            >
              ✕
            </button>

            <h3 className="font-serif text-lg font-bold text-white">
              {editingStaff ? 'Edit Specialist' : 'Add New Specialist'}
            </h3>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="block text-neutral-300 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kamal Silva"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white"
                />
              </div>

              <div>
                <label className="block text-neutral-300 mb-1">Role / Title</label>
                <input
                  type="text"
                  placeholder="e.g. Senior Hair Stylist / Bridal Specialist"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white"
                />
              </div>

              <div>
                <label className="block text-neutral-300 mb-1">Avatar Image URL</label>
                <input
                  type="text"
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block text-neutral-300 mb-1">Specialties (comma separated)</label>
                <input
                  type="text"
                  placeholder="Hair Cut, Hair Colour, Facial"
                  value={specialties}
                  onChange={(e) => setSpecialties(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-neutral-800 text-neutral-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold"
                >
                  Save Specialist
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

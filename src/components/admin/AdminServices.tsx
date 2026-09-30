import React, { useState } from 'react';
import { Salon, Service } from '../../types/salon';
import { StorageService } from '../../services/storage';
import {
  Plus,
  Edit2,
  Trash2,
  Check,
  Clock,
  Sparkles,
  AlertCircle,
  Image as ImageIcon,
  Video,
  Play,
  Upload,
  X,
  Film,
} from 'lucide-react';

interface AdminServicesProps {
  salon: Salon;
  services: Service[];
  onUpdated?: () => void;
}

export const AdminServices: React.FC<AdminServicesProps> = ({ salon, services, onUpdated }) => {
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [activeVideoModal, setActiveVideoModal] = useState<{ title: string; url: string } | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Hair');
  const [duration, setDuration] = useState(30);
  const [price, setPrice] = useState(1500);
  const [description, setDescription] = useState('');
  const [active, setActive] = useState(true);
  const [badge, setBadge] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [uploadError, setUploadError] = useState<string | null>(null);

  const salonServices = services.filter((s) => s.salonId === salon.id);

  const openNewModal = () => {
    setEditingService(null);
    setName('');
    setCategory('Hair');
    setDuration(30);
    setPrice(1500);
    setDescription('');
    setActive(true);
    setBadge('');
    setImageUrl('');
    setVideoUrl('');
    setUploadError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (srv: Service) => {
    setEditingService(srv);
    setName(srv.name);
    setCategory(srv.category);
    setDuration(srv.durationMinutes);
    setPrice(srv.price);
    setDescription(srv.description);
    setActive(srv.active);
    setBadge(srv.badge || '');
    setImageUrl(srv.imageUrl || '');
    setVideoUrl(srv.videoUrl || '');
    setUploadError(null);
    setIsModalOpen(true);
  };

  // Image upload handler (JPG / PNG)
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file (JPG, PNG, WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image size exceeds 5MB limit.');
      return;
    }

    setUploadError(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        setImageUrl(event.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Video clip upload handler (MP4 / WebM)
  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      setUploadError('Please select a valid video file (MP4, WebM, MOV).');
      return;
    }

    // Limit video file to 25MB for browser local storage
    if (file.size > 25 * 1024 * 1024) {
      setUploadError('Video file exceeds 25MB limit. Please provide a video URL or smaller clip.');
      return;
    }

    setUploadError(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        setVideoUrl(event.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const payload: Service = {
      id: editingService ? editingService.id : `srv_${Date.now()}`,
      salonId: salon.id,
      name: name.trim(),
      category: category.trim() || 'General',
      durationMinutes: Number(duration) || 30,
      price: Number(price) || 0,
      description: description.trim(),
      active,
      badge: badge.trim() || undefined,
      imageUrl: imageUrl.trim() || undefined,
      videoUrl: videoUrl.trim() || undefined,
    };

    StorageService.saveService(payload);
    setIsModalOpen(false);
    if (onUpdated) onUpdated();
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to remove this service from your salon menu?')) {
      StorageService.deleteService(id);
      if (onUpdated) onUpdated();
    }
  };

  const handleToggleActive = (srv: Service) => {
    StorageService.saveService({ ...srv, active: !srv.active });
    if (onUpdated) onUpdated();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-serif font-bold text-white flex items-center gap-2">
            <span>Salon Services & Pricing</span>
          </h2>
          <p className="text-xs text-neutral-400">
            Manage your service menu, pricing, durations, photo galleries (JPG), and demonstration video clips
          </p>
        </div>

        <button
          onClick={openNewModal}
          className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-lg shadow-amber-500/20 shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add New Service
        </button>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {salonServices.map((srv) => (
          <div
            key={srv.id}
            className={`rounded-2xl border transition-all flex flex-col justify-between overflow-hidden ${
              srv.active
                ? 'bg-neutral-900 border-neutral-800 hover:border-neutral-700 shadow-md'
                : 'bg-neutral-950 border-neutral-900 opacity-60'
            }`}
          >
            {/* Service Image (JPG) Header Banner */}
            {srv.imageUrl ? (
              <div className="relative h-40 w-full bg-neutral-950 overflow-hidden group">
                <img
                  src={srv.imageUrl}
                  alt={srv.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-transparent to-black/30" />

                {/* Video Clip Indicator Pill */}
                {srv.videoUrl && (
                  <button
                    type="button"
                    onClick={() => setActiveVideoModal({ title: srv.name, url: srv.videoUrl! })}
                    className="absolute bottom-2.5 right-2.5 px-2.5 py-1 rounded-full bg-neutral-950/80 hover:bg-amber-500 hover:text-neutral-950 text-white backdrop-blur-md text-[10px] font-bold flex items-center gap-1.5 transition-colors border border-white/10 shadow-lg"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>Watch Video</span>
                  </button>
                )}
              </div>
            ) : (
              srv.videoUrl && (
                <div className="p-3 bg-neutral-950 border-b border-neutral-800 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-amber-400 font-medium">
                    <Film className="w-4 h-4" />
                    <span>Video Clip Attached</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveVideoModal({ title: srv.name, url: srv.videoUrl! })}
                    className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 hover:bg-amber-500 hover:text-neutral-950 text-[10px] font-bold flex items-center gap-1 transition-colors"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>Play Clip</span>
                  </button>
                </div>
              )
            )}

            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-mono uppercase text-amber-400 font-semibold tracking-wider">
                    {srv.category}
                  </span>
                  {srv.badge && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-semibold">
                      {srv.badge}
                    </span>
                  )}
                </div>

                <h4 className="text-base font-bold text-white mt-1.5">{srv.name}</h4>
                <p className="text-xs text-neutral-400 line-clamp-2 mt-1">{srv.description}</p>
              </div>

              <div className="pt-3 border-t border-neutral-800/80">
                <div className="flex items-center justify-between text-xs mb-3">
                  <span className="flex items-center gap-1 font-mono text-neutral-400">
                    <Clock className="w-3.5 h-3.5 text-neutral-500" />
                    {srv.durationMinutes} min
                  </span>

                  <div className="text-right">
                    <span className="text-neutral-500 font-mono text-xs">{salon.currency}</span>
                    <span className="text-lg font-bold font-mono text-white ml-1">
                      {srv.price.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleToggleActive(srv)}
                    className={`text-[11px] font-medium px-2.5 py-1 rounded-lg transition-colors ${
                      srv.active
                        ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                        : 'bg-neutral-800 text-neutral-400 hover:text-white'
                    }`}
                  >
                    {srv.active ? '● Active' : '○ Inactive'}
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(srv)}
                      className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors"
                      title="Edit Service, Image & Video"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(srv.id)}
                      className="p-1.5 rounded-lg bg-neutral-800 hover:bg-rose-950 hover:text-rose-400 text-neutral-300 transition-colors"
                      title="Delete Service"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Service Modal with Images & Video Clip */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative space-y-4 my-8 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 text-neutral-400 hover:text-white w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-sm transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="font-serif text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>{editingService ? 'Edit Service Details' : 'Add New Service'}</span>
            </h3>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block text-neutral-300 mb-1 font-semibold">Service Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Couture Haircut & Scalp Detox"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-300 mb-1 font-semibold">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none"
                  >
                    <option value="Hair">Hair</option>
                    <option value="Skin & Facial">Skin & Facial</option>
                    <option value="Bridal">Bridal</option>
                    <option value="Nails">Nails</option>
                    <option value="Spa & Wellness">Spa & Wellness</option>
                    <option value="Special Packages">Special Packages</option>
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-300 mb-1 font-semibold">Badge (Optional)</label>
                  <input
                    type="text"
                    placeholder="Popular / Trending / Exclusive"
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-300 mb-1 font-semibold">Duration (Minutes) *</label>
                  <input
                    type="number"
                    step="15"
                    min="15"
                    max="360"
                    required
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-neutral-300 mb-1 font-semibold">Price ({salon.currency}) *</label>
                  <input
                    type="number"
                    step="100"
                    min="0"
                    required
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-300 mb-1 font-semibold">Description</label>
                <textarea
                  rows={2}
                  placeholder="Detail the benefits, products used, and styling process..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white resize-none"
                />
              </div>

              {/* 1. Service Image Upload (JPG / PNG) */}
              <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                    <span>Service Image (JPG / PNG)</span>
                  </span>
                  {imageUrl && (
                    <button
                      type="button"
                      onClick={() => setImageUrl('')}
                      className="text-[10px] text-rose-400 hover:text-rose-300"
                    >
                      Remove Image
                    </button>
                  )}
                </div>

                {imageUrl ? (
                  <div className="relative rounded-xl overflow-hidden h-32 w-full border border-neutral-800">
                    <img src={imageUrl} alt="Service preview" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <input
                      type="url"
                      placeholder="Paste Image URL (https://...jpg)"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white text-[11px] focus:outline-none"
                    />
                    <div className="flex items-center gap-2">
                      <label className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 cursor-pointer text-[11px] font-medium flex items-center gap-1.5 transition-colors">
                        <Upload className="w-3 h-3 text-amber-400" />
                        <span>Upload JPG from Device</span>
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          onChange={handleImageFileChange}
                          className="hidden"
                        />
                      </label>
                      <span className="text-[10px] text-neutral-500">Max 5MB (JPG, PNG)</span>
                    </div>
                  </div>
                )}
              </div>

              {/* 2. Service Video Clip (MP4 / WebM / Link) */}
              <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white flex items-center gap-1.5">
                    <Video className="w-3.5 h-3.5 text-amber-400" />
                    <span>Video Clip (Optional)</span>
                  </span>
                  {videoUrl && (
                    <button
                      type="button"
                      onClick={() => setVideoUrl('')}
                      className="text-[10px] text-rose-400 hover:text-rose-300"
                    >
                      Remove Video
                    </button>
                  )}
                </div>

                {videoUrl ? (
                  <div className="space-y-2">
                    <div className="rounded-xl overflow-hidden bg-black border border-neutral-800 max-h-40">
                      <video src={videoUrl} controls className="w-full max-h-40 object-contain" />
                    </div>
                    <div className="text-[10px] text-neutral-400 truncate">
                      URL: {videoUrl.slice(0, 50)}...
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <input
                      type="url"
                      placeholder="Paste Video URL (Direct MP4, WebM, or video link)"
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white text-[11px] focus:outline-none"
                    />
                    <div className="flex items-center gap-2">
                      <label className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 cursor-pointer text-[11px] font-medium flex items-center gap-1.5 transition-colors">
                        <Upload className="w-3 h-3 text-amber-400" />
                        <span>Upload Video Clip (MP4)</span>
                        <input
                          type="file"
                          accept="video/mp4,video/webm,video/quicktime"
                          onChange={handleVideoFileChange}
                          className="hidden"
                        />
                      </label>
                      <span className="text-[10px] text-neutral-500">Max 25MB (MP4, WebM)</span>
                    </div>
                  </div>
                )}
              </div>

              {uploadError && (
                <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="srv_active"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="rounded text-amber-500"
                />
                <label htmlFor="srv_active" className="text-neutral-300 cursor-pointer font-medium">
                  Active in Customer Booking Menu
                </label>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold transition-colors shadow-lg shadow-amber-500/20"
                >
                  Save Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Video Clip Player Modal */}
      {activeVideoModal && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-2xl w-full p-5 shadow-2xl relative space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
              <h4 className="font-serif text-base font-bold text-white flex items-center gap-2">
                <Play className="w-4 h-4 text-amber-400 fill-current" />
                <span>{activeVideoModal.title} · Demonstration Clip</span>
              </h4>
              <button
                onClick={() => setActiveVideoModal(null)}
                className="w-8 h-8 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="rounded-2xl overflow-hidden bg-black aspect-video flex items-center justify-center">
              <video
                src={activeVideoModal.url}
                controls
                autoPlay
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

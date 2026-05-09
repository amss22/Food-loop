'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import { Upload, MapPin, Clock, AlertTriangle, Leaf, CheckCircle, Wand2, Mic } from 'lucide-react';
import toast from 'react-hot-toast';

const API = process.env.NEXT_PUBLIC_API_URL;

const FOOD_TYPES = ['cooked', 'raw', 'packaged', 'bakery', 'beverages', 'fruits_vegetables', 'dairy', 'other'];
const UNITS = ['kg', 'liters', 'portions', 'boxes', 'packets'];

const SECTION_STYLE = {
  background: 'white',
  border: '1px solid #e8f5ec',
  borderRadius: '1.25rem',
  padding: '1.5rem',
  boxShadow: '0 2px 12px rgba(22,163,74,0.05)',
};

export default function NewFoodPage() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [form, setForm] = useState({
    title: '', description: '', foodType: 'cooked', quantity: '', unit: 'kg', servings: '',
    expiryAt: '', address: '', city: '', pincode: '', lat: '28.6139', lng: '77.2090',
    isVegetarian: false, isVegan: false, isHalal: false, isGlutenFree: false,
    pickupInstructions: '', isEmergency: false, tags: '',
  });
  const [aiLoading, setAiLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  const set = (key: string, value: unknown) => setForm(f => ({ ...f, [key]: value }));

  const startVoiceDictation = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error("Voice dictation is not supported in this browser.");
      return;
    }
    
    setIsRecording(true);
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.start();

    recognition.onresult = async (event: any) => {
      const transcript = event.results[0][0].transcript;
      setIsRecording(false);
      setAiLoading(true);
      toast.loading("Analyzing speech...", { id: 'ai' });

      try {
        const { data } = await axios.post(`${API}/ai/parse-speech`, { transcript });
        if (data.success && data.details) {
          const d = data.details;
          setForm(prev => ({
            ...prev,
            title: d.title || prev.title,
            description: d.description || prev.description,
            quantity: d.quantity || prev.quantity,
            unit: d.unit || prev.unit,
            foodType: d.foodType || prev.foodType
          }));
          toast.success("Form updated from speech!", { id: 'ai' });
        } else {
          toast.dismiss('ai');
        }
      } catch (err) {
        toast.error("Failed to parse speech", { id: 'ai' });
      } finally {
        setAiLoading(false);
      }
    };

    recognition.onerror = () => {
      setIsRecording(false);
      toast.error("Speech recognition failed");
    };
  };

  const extractDetailsFromImage = async (file: File) => {
    setAiLoading(true);
    toast.loading("Analyzing image...", { id: 'ai' });
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64 = (reader.result as string).split(',')[1];
        const { data } = await axios.post(`${API}/ai/ocr`, { imageBase64: base64 });
        if (data.success && data.details) {
          const d = data.details;
          setForm(prev => ({
            ...prev,
            title: d.title || prev.title,
            quantity: d.quantity || prev.quantity,
            foodType: d.foodType || prev.foodType
          }));
          toast.success("Extracted details from image!", { id: 'ai' });
        } else {
          toast.dismiss('ai');
        }
        setAiLoading(false);
      };
    } catch (err) {
      toast.error("Failed to analyze image", { id: 'ai' });
      setAiLoading(false);
    }
  };

  const handleImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).slice(0, 5);
    setImages(files);
    setPreviews(files.map(f => URL.createObjectURL(f)));
    if (files.length > 0 && !form.title) {
      extractDetailsFromImage(files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { router.push('/auth/login'); return; }
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, String(v)));
      images.forEach(img => fd.append('images', img));
      await axios.post(`${API}/food`, fd, {
        headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` },
      });
      toast.success('Food listed successfully! 🎉');
      router.push('/dashboard/donor');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to create listing');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen" style={{ background: '#f8fdf9' }}>
      <Navbar />

      <div className="w-full max-w-3xl mx-auto px-6 pt-24 pb-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Page Header */}
          <div className="mb-8">
            <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#22c55e' }}>Food Donation</p>
            <h1 className="text-3xl font-black mb-2" style={{ color: '#0f172a' }}>Donate Surplus Food 🍽️</h1>
            <p style={{ color: '#64748b' }}>List your surplus food in 60 seconds. AI will match it with nearby NGOs automatically.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Emergency Toggle */}
            <div
              className="p-4 rounded-2xl transition-all"
              style={form.isEmergency ? {
                background: 'rgba(239,68,68,0.06)',
                border: '1.5px solid rgba(239,68,68,0.25)',
              } : {
                background: 'white',
                border: '1px solid #e8f5ec',
                boxShadow: '0 2px 8px rgba(22,163,74,0.04)',
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: form.isEmergency ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.08)' }}
                  >
                    <AlertTriangle className="w-5 h-5" style={{ color: form.isEmergency ? '#ef4444' : '#22c55e' }} />
                  </div>
                  <div>
                    <p className="font-semibold text-sm" style={{ color: '#0f172a' }}>Emergency Food Rescue</p>
                    <p className="text-xs" style={{ color: '#64748b' }}>Food expires in &lt;2 hours. Sends instant alerts to all nearby volunteers.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => set('isEmergency', !form.isEmergency)}
                  className="w-12 h-6 rounded-full transition-all relative shrink-0"
                  style={{ background: form.isEmergency ? '#ef4444' : '#e2e8f0' }}
                >
                  <div
                    className="w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all shadow-sm"
                    style={{ left: form.isEmergency ? '26px' : '2px' }}
                  />
                </button>
              </div>
            </div>

            {/* Basic Info */}
            <div style={SECTION_STYLE}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold flex items-center gap-2" style={{ color: '#0f172a' }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(34,197,94,0.08)' }}>
                    <Leaf className="w-4 h-4" style={{ color: '#22c55e' }} />
                  </div>
                  Food Details
                </h3>
                <button
                  type="button"
                  onClick={startVoiceDictation}
                  disabled={aiLoading || isRecording}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:bg-green-50 disabled:opacity-50"
                  style={{ color: '#16a34a', border: '1.5px solid #dcfce7' }}
                >
                  {isRecording ? <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" /> : <Mic className="w-4 h-4" />}
                  {isRecording ? 'Listening...' : 'Voice Dictate'}
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold mb-1.5" style={{ color: '#475569' }}>Title *</label>
                  <input className="input-dark" placeholder="e.g. Leftover Biriyani from wedding event" value={form.title}
                    onChange={e => set('title', e.target.value)} required />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1.5" style={{ color: '#475569' }}>Description</label>
                  <textarea className="input-dark resize-none" rows={3} placeholder="Any special notes about the food..."
                    value={form.description} onChange={e => set('description', e.target.value)} />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold mb-1.5" style={{ color: '#475569' }}>Food Type *</label>
                    <select className="input-dark" value={form.foodType} onChange={e => set('foodType', e.target.value)}>
                      {FOOD_TYPES.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1.5" style={{ color: '#475569' }}>Quantity *</label>
                    <input className="input-dark" type="number" min="0.1" step="0.1" placeholder="Amount"
                      value={form.quantity} onChange={e => set('quantity', e.target.value)} required />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1.5" style={{ color: '#475569' }}>Unit</label>
                    <select className="input-dark" value={form.unit} onChange={e => set('unit', e.target.value)}>
                      {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold mb-1.5" style={{ color: '#475569' }}>Estimated Servings</label>
                    <input className="input-dark" type="number" placeholder="0" value={form.servings}
                      onChange={e => set('servings', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1.5 flex items-center gap-1" style={{ color: '#475569' }}>
                      <Clock className="w-3 h-3" /> Expiry Time *
                    </label>
                    <input className="input-dark" type="datetime-local" value={form.expiryAt}
                      min={new Date().toISOString().slice(0, 16)}
                      onChange={e => set('expiryAt', e.target.value)} required />
                  </div>
                </div>

                {/* Dietary */}
                <div>
                  <label className="block text-xs font-bold mb-2" style={{ color: '#475569' }}>Dietary Info</label>
                  <div className="flex flex-wrap gap-2">
                    {[['isVegetarian', '🌱 Vegetarian'], ['isVegan', '🌿 Vegan'], ['isHalal', '🥩 Halal'], ['isGlutenFree', '🌾 Gluten Free']].map(([key, label]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => set(key, !(form as any)[key])}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
                        style={(form as any)[key] ? {
                          border: '1.5px solid #22c55e',
                          background: 'rgba(34,197,94,0.08)',
                          color: '#16a34a',
                        } : {
                          border: '1.5px solid #e2e8f0',
                          background: 'white',
                          color: '#64748b',
                        }}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Location */}
            <div style={SECTION_STYLE}>
              <h3 className="font-bold flex items-center gap-2 mb-4" style={{ color: '#0f172a' }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(2,132,199,0.08)' }}>
                  <MapPin className="w-4 h-4" style={{ color: '#0284c7' }} />
                </div>
                Pickup Location
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold mb-1.5" style={{ color: '#475569' }}>Full Address *</label>
                  <input className="input-dark" placeholder="Street address, building name" value={form.address}
                    onChange={e => set('address', e.target.value)} required />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold mb-1.5" style={{ color: '#475569' }}>City *</label>
                    <input className="input-dark" placeholder="City" value={form.city}
                      onChange={e => set('city', e.target.value)} required />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1.5" style={{ color: '#475569' }}>PIN Code</label>
                    <input className="input-dark" placeholder="110001" value={form.pincode}
                      onChange={e => set('pincode', e.target.value)} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold mb-1.5" style={{ color: '#475569' }}>Latitude</label>
                    <input className="input-dark" type="number" step="any" value={form.lat}
                      onChange={e => set('lat', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1.5" style={{ color: '#475569' }}>Longitude</label>
                    <input className="input-dark" type="number" step="any" value={form.lng}
                      onChange={e => set('lng', e.target.value)} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1.5" style={{ color: '#475569' }}>Pickup Instructions</label>
                  <input className="input-dark" placeholder="e.g. Ask for manager at reception, gate 2" value={form.pickupInstructions}
                    onChange={e => set('pickupInstructions', e.target.value)} />
                </div>
              </div>
            </div>

            {/* Images */}
            <div style={SECTION_STYLE}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold flex items-center gap-2" style={{ color: '#0f172a' }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(124,58,237,0.08)' }}>
                    <Upload className="w-4 h-4" style={{ color: '#7c3aed' }} />
                  </div>
                  Food Photos
                </h3>
                <div className="text-xs font-semibold px-2 py-1 rounded-md flex items-center gap-1" style={{ background: 'rgba(124,58,237,0.05)', color: '#7c3aed' }}>
                  <Wand2 className="w-3 h-3" /> AI auto-fills details from photos
                </div>
              </div>
              <label className="block cursor-pointer">
                <div
                  className="rounded-2xl p-8 text-center transition-all"
                  style={{ border: '2px dashed #bbf7d0', background: 'rgba(34,197,94,0.03)' }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = '#22c55e';
                    (e.currentTarget as HTMLElement).style.background = 'rgba(34,197,94,0.06)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = '#bbf7d0';
                    (e.currentTarget as HTMLElement).style.background = 'rgba(34,197,94,0.03)';
                  }}
                >
                  <Upload className="w-8 h-8 mx-auto mb-2" style={{ color: '#86efac' }} />
                  <p className="text-sm font-medium" style={{ color: '#64748b' }}>Click to upload up to 5 photos</p>
                  <p className="text-xs mt-1" style={{ color: '#94a3b8' }}>JPEG, PNG, WebP — Max 5MB each</p>
                </div>
                <input type="file" multiple accept="image/*" onChange={handleImages} className="hidden" />
              </label>
              {previews.length > 0 && (
                <div className="grid grid-cols-5 gap-2 mt-4">
                  {previews.map((p, i) => (
                    <div key={i} className="aspect-square rounded-xl overflow-hidden" style={{ border: '2px solid #dcfce7' }}>
                      <img src={p} alt={`preview ${i}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl font-black text-lg text-white flex items-center justify-center gap-2 transition-all hover:scale-[1.02] disabled:opacity-50"
              style={{
                background: loading ? '#86efac' : 'linear-gradient(135deg, #22c55e, #16a34a)',
                boxShadow: '0 8px 32px rgba(22,163,74,0.28)',
              }}
            >
              {loading
                ? <div className="w-6 h-6 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                : <><CheckCircle className="w-5 h-5" /> List Food Donation</>
              }
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

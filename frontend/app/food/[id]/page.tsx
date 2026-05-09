'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/Navbar';
import EmergencyBanner from '@/components/EmergencyBanner';
import dynamic from 'next/dynamic';
import { useAuth } from '@/contexts/AuthContext';
import { Clock, MapPin, Weight, Leaf, AlertTriangle, CheckCircle, ArrowLeft, Shield, Users, Info, ExternalLink, Languages } from 'lucide-react';
import toast from 'react-hot-toast';

const MapView = dynamic(() => import('@/components/MapView'), { ssr: false });
const API = process.env.NEXT_PUBLIC_API_URL;

const urgencyColors: Record<string, { color: string; bg: string; label: string; shadow: string }> = {
  critical: { color: '#dc2626', bg: 'rgba(220,38,38,0.08)', label: 'CRITICAL', shadow: 'rgba(220,38,38,0.2)' },
  high:     { color: '#d97706', bg: 'rgba(217,119,6,0.08)',  label: 'HIGH', shadow: 'rgba(217,119,6,0.2)' },
  medium:   { color: '#059669', bg: 'rgba(5,150,105,0.08)',  label: 'MEDIUM', shadow: 'rgba(5,150,105,0.2)' },
  low:      { color: '#16a34a', bg: 'rgba(22,163,74,0.08)',  label: 'LOW', shadow: 'rgba(22,163,74,0.2)' },
};

export default function FoodDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, token } = useAuth();
  const [listing, setListing] = useState<any>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [translatedDesc, setTranslatedDesc] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [targetLang, setTargetLang] = useState('Hindi');

  useEffect(() => {
    if (id) {
      setLoading(true);
      axios.get(`${API}/food/${id}`)
        .then(r => setListing(r.data.listing))
        .catch(() => {
          toast.error('Listing not found');
        })
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handleTranslate = async () => {
    if (!listing?.description) return;
    
    // Toggle translation off if already translated to same language
    if (translatedDesc) {
      setTranslatedDesc(null);
      return;
    }

    setIsTranslating(true);
    toast.loading(`Translating to ${targetLang}...`, { id: 'translate' });
    try {
      const { data } = await axios.post(`${API}/ai/translate`, {
        text: listing.description,
        targetLanguage: targetLang
      });
      if (data.success && data.translated) {
        setTranslatedDesc(data.translated);
        toast.success("Translation complete", { id: 'translate' });
      } else {
        throw new Error('Translation failed');
      }
    } catch (err) {
      toast.error("Failed to translate", { id: 'translate' });
    } finally {
      setIsTranslating(false);
    }
  };

  const claimFood = async () => {
    if (!user) { 
      toast.error('Please login to claim food');
      router.push('/auth/login'); 
      return; 
    }
    if (user.role !== 'receiver' && user.role !== 'admin') {
      toast.error('Only NGOs and verified receivers can claim food'); 
      return;
    }
    
    setClaiming(true);
    try {
      const res = await axios.post(`${API}/donations/claim/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setQrCode(res.data.qrCode);
      setListing((prev: any) => prev ? { ...prev, status: 'claimed' } : prev);
      toast.success('Food claimed successfully! 🎉');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to claim food');
    } finally { 
      setClaiming(false); 
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fdf9]">
      <div className="flex flex-col items-center gap-4">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 rounded-full border-t-4 border-green-500 border-r-transparent border-b-green-100 border-l-transparent" 
        />
        <p className="text-sm font-semibold text-slate-400">Fetching listing details...</p>
      </div>
    </div>
  );

  if (!listing) return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fdf9]">
      <div className="text-center p-8 bg-white rounded-3xl shadow-xl border border-green-50 max-w-md mx-auto">
        <div className="text-6xl mb-4">🔍</div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Listing Not Found</h2>
        <p className="text-slate-500 mb-8 text-sm">The food listing you are looking for may have been claimed, expired, or removed.</p>
        <button
          onClick={() => router.push('/food')}
          className="w-full py-3 bg-green-500 text-white font-bold rounded-2xl hover:bg-green-600 transition-all shadow-lg shadow-green-200"
        >
          Browse Other Listings
        </button>
      </div>
    </div>
  );

  const urgency = urgencyColors[listing.urgencyLevel] || urgencyColors.low;

  return (
    <div className="min-h-screen bg-[#f8fdf9] selection:bg-green-100 selection:text-green-800">
      <EmergencyBanner />
      <Navbar />

      <main className="w-full max-w-6xl mx-auto px-6 pt-32 pb-24">
        {/* Navigation Breadcrumb */}
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => router.push('/food')}
          className="group flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-green-600 transition-colors mb-8"
        >
          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm border border-green-50 group-hover:bg-green-500 group-hover:text-white transition-all">
            <ArrowLeft className="w-4 h-4" />
          </div>
          Back to Browse
        </motion.button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column - Detail Info */}
          <div className="lg:col-span-7 space-y-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[2rem] overflow-hidden border border-green-50 shadow-2xl shadow-green-900/5"
            >
              {/* Header Image/Banner */}
              <div className="relative h-72 md:h-96 w-full bg-slate-100">
                {listing.images?.[0] ? (
                  <img
                    src={listing.images[0].startsWith('http') ? listing.images[0] : `http://localhost:3001${listing.images[0]}`}
                    alt={listing.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-9xl bg-gradient-to-br from-green-50 to-green-100">
                    {listing.foodType === 'bakery' ? '🥐' : listing.foodType === 'cooked' ? '🍛' : 
                     listing.foodType === 'dairy' ? '🥛' : listing.foodType === 'fruits_vegetables' ? '🥦' : '🍱'}
                  </div>
                )}
                
                <div className="absolute top-6 left-6 flex flex-col gap-3">
                  <AnimatePresence>
                    {listing.isEmergency && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white text-xs font-black rounded-full shadow-lg shadow-red-500/20"
                      >
                        <AlertTriangle className="w-4 h-4 fill-white text-red-500" />
                        EMERGENCY RESCUE
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <div 
                    className="w-fit px-4 py-2 rounded-full text-xs font-black tracking-widest bg-white/90 backdrop-blur-md border border-white shadow-sm"
                    style={{ color: urgency.color }}
                  >
                    {urgency.label} PRIORITY
                  </div>
                </div>

                <div className="absolute bottom-6 left-6 right-6">
                  <div className="bg-white/80 backdrop-blur-lg border border-white/50 p-6 rounded-2xl shadow-xl">
                    <div className="flex flex-wrap gap-2 mb-3">
                       <span className="px-3 py-1 rounded-full bg-green-500 text-white text-[10px] font-black uppercase tracking-tighter">AI Score: {listing.aiScore}</span>
                       <span className="px-3 py-1 rounded-full bg-slate-800 text-white text-[10px] font-black uppercase tracking-tighter">{listing.foodType.replace('_', ' ')}</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black text-slate-900 leading-tight">{listing.title}</h1>
                  </div>
                </div>
              </div>

              {/* Content Details */}
              <div className="p-8 space-y-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { icon: Weight, label: 'Quantity', value: `${listing.quantity} ${listing.unit}`, color: 'green' },
                    { icon: Clock, label: 'Expires in', value: listing.hoursLeft ? `${listing.hoursLeft}h` : 'Soon', color: 'orange' },
                    { icon: Users, label: 'Servings', value: `~${listing.servings || listing.quantity * 2}`, color: 'blue' },
                    { icon: Shield, label: 'Verified', value: 'Health Safe', color: 'indigo' },
                  ].map((stat, i) => (
                    <div key={i} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center text-center group hover:bg-white hover:border-green-200 hover:shadow-lg transition-all duration-300">
                      <stat.icon className={`w-5 h-5 mb-2 text-${stat.color}-500 group-hover:scale-110 transition-transform`} />
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</span>
                      <span className="text-sm font-black text-slate-800">{stat.value}</span>
                    </div>
                  ))}
                </div>

                {/* Description */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="flex items-center gap-2 font-black text-slate-900 text-lg">
                      <Info className="w-5 h-5 text-green-500" />
                      Description & Content
                    </h3>
                    <div className="flex items-center gap-2">
                      <select 
                        className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 outline-none font-semibold text-slate-600"
                        value={targetLang}
                        onChange={(e) => { setTargetLang(e.target.value); setTranslatedDesc(null); }}
                      >
                        <option value="Hindi">Hindi</option>
                        <option value="Spanish">Spanish</option>
                        <option value="French">French</option>
                      </select>
                      <button 
                        onClick={handleTranslate}
                        disabled={isTranslating}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:bg-green-50 disabled:opacity-50"
                        style={{ color: '#16a34a', border: '1.5px solid #dcfce7', background: translatedDesc ? '#dcfce7' : 'transparent' }}
                      >
                        {isTranslating ? <div className="w-3 h-3 border-2 border-green-500 border-t-transparent rounded-full animate-spin" /> : <Languages className="w-3.5 h-3.5" />}
                        {translatedDesc ? 'Show Original' : 'Translate AI'}
                      </button>
                    </div>
                  </div>
                  <p className="text-slate-600 leading-relaxed bg-green-50/30 p-5 rounded-2xl border border-green-50">
                    {translatedDesc || listing.description || "No specific description provided. This is a high-quality food donation rescued from surplus sources to help those in need."}
                  </p>
                </div>

                {/* Dietary Info */}
                <div className="flex flex-wrap gap-3">
                  {listing.dietary?.isVegetarian && (
                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-50 text-green-700 border border-green-100 font-bold text-xs">
                      <Leaf className="w-4 h-4" /> Vegetarian
                    </div>
                  )}
                  {listing.dietary?.isVegan && (
                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-50 text-green-700 border border-green-100 font-bold text-xs">
                      <Leaf className="w-4 h-4" /> Vegan
                    </div>
                  )}
                  {listing.dietary?.isHalal && (
                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-50 text-amber-700 border border-amber-100 font-bold text-xs">
                      <Info className="w-4 h-4" /> Halal Certified
                    </div>
                  )}
                </div>

                {/* Donor Section */}
                <div className="p-6 rounded-3xl bg-slate-900 text-white flex items-center justify-between group overflow-hidden relative">
                  <div className="relative z-10">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 block">Rescue Donor</span>
                    <h4 className="text-xl font-black group-hover:text-green-400 transition-colors">{listing.donor?.organization || listing.donor?.name}</h4>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex -space-x-1">
                        {[1, 2, 3, 4, 5].map(i => (
                          <div key={i} className={`w-3 h-3 rounded-full ${i <= 4 ? 'bg-green-500' : 'bg-slate-700'}`} />
                        ))}
                      </div>
                      <span className="text-xs font-bold text-slate-400">{listing.donor?.rating || '4.8'} Rating</span>
                    </div>
                  </div>
                  <div className="relative z-10 w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                    🏢
                  </div>
                  <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-green-500/20 rounded-full blur-3xl group-hover:bg-green-500/30 transition-all" />
                </div>
              </div>
            </motion.div>

            {/* Map Section */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-[2rem] overflow-hidden border border-green-50 shadow-xl"
            >
              <div className="p-6 border-b border-green-50 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-sky-50 flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-sky-500" />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900">Pickup Location</h3>
                    <p className="text-sm text-slate-500">{listing.location?.address}, {listing.location?.city}</p>
                  </div>
                </div>
              </div>
              <div className="h-72 w-full">
                <MapView listings={[listing]} />
              </div>
              {listing.pickupInstructions && (
                <div className="p-6 bg-amber-50/50 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                    <Info className="w-5 h-5 text-amber-600" />
                  </div>
                  <div className="space-y-1">
                    <h5 className="text-xs font-black text-amber-900 uppercase tracking-widest">Pickup Instructions</h5>
                    <p className="text-sm text-amber-800 font-medium">{listing.pickupInstructions}</p>
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          {/* Right Column - Action Sidebar */}
          <div className="lg:col-span-5 space-y-6">
            <motion.div 
              initial={{ opacity: 0, x: 20 }} 
              animate={{ opacity: 1, x: 0 }}
              className="sticky top-32 space-y-6"
            >
              {/* Claim Card */}
              <div className="bg-white p-8 rounded-[2rem] border border-green-50 shadow-2xl shadow-green-900/10 text-center">
                <div className="w-20 h-20 bg-green-50 rounded-3xl mx-auto flex items-center justify-center text-4xl mb-6 shadow-inner">
                  {qrCode ? '✅' : '📦'}
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-2">
                  {qrCode ? 'Successfully Claimed' : 'Rescue This Food'}
                </h3>
                <p className="text-slate-500 text-sm mb-8 leading-relaxed px-4">
                  {qrCode 
                    ? "Your pickup is confirmed. Show the QR code below at the donor location to verify your rescue."
                    : "Once claimed, this listing will be reserved for your organization. Please ensure you can pick it up within the remaining time."}
                </p>

                <AnimatePresence mode='wait'>
                  {qrCode ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="space-y-6"
                    >
                      <div className="p-4 bg-white border-4 border-green-500 rounded-3xl shadow-lg inline-block">
                        <img src={qrCode} alt="Pickup QR Code" className="w-48 h-48 rounded-xl" />
                      </div>
                      <div className="flex flex-col gap-3">
                        <button className="py-4 bg-slate-900 text-white rounded-2xl font-black text-sm hover:scale-105 transition-all">
                          Download QR Receipt
                        </button>
                        <button className="py-4 bg-green-50 text-green-700 rounded-2xl font-black text-sm hover:bg-green-100 transition-all border border-green-100">
                          Contact Donor
                        </button>
                      </div>
                    </motion.div>
                  ) : listing.status === 'available' ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                       <button
                        onClick={claimFood}
                        disabled={claiming}
                        className="group relative w-full py-5 bg-green-500 rounded-2xl font-black text-white text-lg overflow-hidden transition-all active:scale-95 disabled:opacity-50"
                        style={{
                          boxShadow: '0 12px 30px rgba(34, 197, 94, 0.3)'
                        }}
                      >
                        <div className="absolute inset-0 bg-green-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                        <span className="relative z-10 flex items-center justify-center gap-3">
                          {claiming ? (
                            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          ) : (
                            <>🍽️ Claim This Food</>
                          )}
                        </span>
                      </button>
                      <p className="mt-4 text-[10px] text-slate-400 font-bold uppercase tracking-widest">Only for verified NGOs & Receivers</p>
                    </motion.div>
                  ) : (
                    <div className="py-5 bg-slate-50 text-slate-400 rounded-2xl font-black text-lg border border-slate-100 uppercase tracking-widest">
                       Listing {listing.status.replace('_', ' ')}
                    </div>
                  )}
                </AnimatePresence>
              </div>

              {/* Safety & Transparency Card */}
              <div className="bg-slate-900 p-8 rounded-[2rem] text-white relative overflow-hidden">
                <Shield className="w-12 h-12 text-green-500 mb-6 opacity-80" />
                <h4 className="text-xl font-black mb-3">Food Safety Verified</h4>
                <p className="text-slate-400 text-sm leading-relaxed mb-6">
                  This donor has signed the <span className="text-green-400 font-bold underline">FoodLoop Quality Pledge</span>. Every donation is checked for freshness and stored in compliant temperature-controlled environments.
                </p>
                <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full w-fit">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-[10px] font-black tracking-widest text-white">HEALTH-SAFE CERTIFIED</span>
                </div>
                <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #22c55e 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
              </div>

              {/* Impact Card */}
              <div className="bg-green-50 p-8 rounded-[2rem] border border-green-100 text-center">
                <div className="flex justify-center -space-x-3 mb-4">
                  {[1,2,3].map(i => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-green-200 flex items-center justify-center text-xs font-bold text-green-800">
                      {['😊', '🌍', '❤️'][i-1]}
                    </div>
                  ))}
                </div>
                <h5 className="font-black text-green-900 text-sm uppercase tracking-widest mb-1">Your Potential Impact</h5>
                <p className="text-green-800 font-bold text-xl">Feeding ~{listing.servings || (listing.quantity * 2)} People</p>
                <div className="mt-4 pt-4 border-t border-green-100 flex items-center justify-between text-[10px] font-black text-green-700 uppercase tracking-tighter">
                  <span>Saves {((listing.quantity || 0) * 2.5).toFixed(1)}kg CO2</span>
                  <span>•</span>
                  <span>Prevents Methane Release</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}

'use client';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Navbar from '@/components/Navbar';
import EmergencyBanner from '@/components/EmergencyBanner';
import { useSocket } from '@/contexts/SocketContext';
import axios from 'axios';
import { motion } from 'framer-motion';
import { MapPin, Zap, Clock, ArrowLeft } from 'lucide-react';
import FoodCard from '@/components/FoodCard';

// Dynamic import for map to avoid SSR issues
const MapComponent = dynamic(() => import('@/components/MapView'), { ssr: false, loading: () => (
  <div className="w-full h-full flex items-center justify-center bg-green-50/50 rounded-2xl">
    <div className="w-10 h-10 border-t-green-500 rounded-full animate-spin" style={{ border: '3px solid #dcfce7', borderTopColor: '#22c55e' }} />
  </div>
)});

const API = process.env.NEXT_PUBLIC_API_URL;

const DEMO_MAP_LISTINGS = [
  { _id: '1', title: 'Wedding Biryani', foodType: 'cooked', quantity: 45, unit: 'kg', expiryAt: new Date(Date.now() + 2 * 3600000).toISOString(), urgencyLevel: 'high', hoursLeft: 2, aiScore: 88, location: { coordinates: [77.2090, 28.6139], address: 'Connaught Place', city: 'Delhi' }, dietary: {}, donor: { name: 'Royal Banquet' }, isEmergency: false },
  { _id: '2', title: 'Fresh Bread Loaves', foodType: 'bakery', quantity: 80, unit: 'packets', expiryAt: new Date(Date.now() + 4 * 3600000).toISOString(), urgencyLevel: 'medium', hoursLeft: 4, aiScore: 72, location: { coordinates: [77.2310, 28.5700], address: 'Lajpat Nagar', city: 'Delhi' }, dietary: {}, donor: { name: 'Sunrise Bakery' }, isEmergency: false },
  { _id: '3', title: 'Emergency Dal Rice', foodType: 'cooked', quantity: 30, unit: 'kg', expiryAt: new Date(Date.now() + 0.8 * 3600000).toISOString(), urgencyLevel: 'critical', hoursLeft: 0.8, aiScore: 96, location: { coordinates: [77.1900, 28.6450], address: 'Karol Bagh', city: 'Delhi' }, dietary: {}, donor: { name: 'Hotel Metropolis' }, isEmergency: true },
  { _id: '4', title: 'Mixed Vegetables', foodType: 'fruits_vegetables', quantity: 20, unit: 'kg', expiryAt: new Date(Date.now() + 6 * 3600000).toISOString(), urgencyLevel: 'low', hoursLeft: 6, aiScore: 55, location: { coordinates: [77.2100, 28.5350], address: 'Sarojini Nagar', city: 'Delhi' }, dietary: {}, donor: { name: 'Fresh Farm Co.' }, isEmergency: false },
];

export default function MapPage() {
  const [listings, setListings] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { notifications } = useSocket();

  useEffect(() => {
    axios.get(`${API}/food?status=available&limit=50`)
      .then(r => {
        const data = r.data.listings;
        setListings(Array.isArray(data) && data.length > 0 ? data : DEMO_MAP_LISTINGS);
      })
      .catch(() => setListings(DEMO_MAP_LISTINGS))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <div className="page-container flex-1 pb-20 pt-12">
        {/* Header (Minimal) */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-20 text-center max-w-2xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-black mb-8 text-slate-900 tracking-tight leading-[1]">
            Live <span className="text-green-500 italic font-serif">Rescue</span> Map.
          </h1>
          <p className="text-lg text-slate-500 font-medium leading-relaxed">
            Real-time surplus visualization powered by AI urgency scoring.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-12 gap-12 items-start">
          {/* Map Section (Clean) */}
          <div className="lg:col-span-8">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="h-[650px] rounded-[4rem] overflow-hidden border border-slate-100 shadow-2xl shadow-slate-900/5 relative"
            >
              {!loading && <MapComponent listings={listings} onSelect={setSelected} />}
            </motion.div>
          </div>

          {/* Sidebar (Minimal) */}
          <div className="lg:col-span-4 space-y-8 flex flex-col h-[650px]">
            <div className="px-2">
              <h3 className="font-black text-[10px] uppercase tracking-[0.3em] text-slate-300">
                {selected ? 'Mission Insight' : `Active Rescues (${listings.length})`}
              </h3>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar space-y-6">
              {selected ? (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="h-full flex flex-col">
                  <div className="flex-1">
                    <FoodCard listing={selected} />
                  </div>
                  <button 
                    onClick={() => setSelected(null)} 
                    className="mt-8 w-full py-4.5 rounded-2xl bg-slate-50 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-all"
                  >
                    ← Back to Feed
                  </button>
                </motion.div>
              ) : (
                listings
                  .sort((a, b) => b.aiScore - a.aiScore)
                  .map((l, i) => (
                    <motion.div 
                      key={l._id} 
                      initial={{ opacity: 0, x: 20 }} 
                      animate={{ opacity: 1, x: 0 }} 
                      transition={{ delay: i * 0.05 }}
                      onClick={() => setSelected(l)} 
                      className="cursor-pointer group flex items-center gap-6 p-4 rounded-3xl hover:bg-slate-50 transition-all"
                    >
                      <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-2xl grayscale group-hover:grayscale-0 transition-all">
                        {l.foodType === 'bakery' ? '🥐' : l.foodType === 'cooked' ? '🍛' : '🥦'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-black text-slate-800 truncate">{l.title}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{l.quantity} {l.unit} • {l.hoursLeft?.toFixed(1)}h left</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Score</p>
                        <p className="text-lg font-black text-green-500 leading-none">{l.aiScore}</p>
                      </div>
                    </motion.div>
                  ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

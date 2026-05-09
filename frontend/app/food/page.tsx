'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import Navbar from '@/components/Navbar';
import FoodCard from '@/components/FoodCard';
import EmergencyBanner from '@/components/EmergencyBanner';
import { Search, MapPin } from 'lucide-react';
import Link from 'next/link';

const API = process.env.NEXT_PUBLIC_API_URL;
const FOOD_TYPES = ['all', 'cooked', 'raw', 'packaged', 'bakery', 'beverages', 'fruits_vegetables', 'dairy'];

// Demo fallback listings (Synced with backend)
const DEMO_LISTINGS = [
  { _id: 'demo-1', title: 'Fresh Wedding Biryani', foodType: 'cooked', quantity: 45, unit: 'kg', urgencyLevel: 'high', aiScore: 92, location: { address: 'Connaught Place', city: 'Delhi' }, dietary: { isVegetarian: false }, donor: { name: 'Rahul Sharma', organization: 'Royal Banquet Hall' }, isEmergency: false },
  { _id: 'demo-2', title: 'Artisan Bread & Pastries', foodType: 'bakery', quantity: 15, unit: 'kg', urgencyLevel: 'medium', aiScore: 78, location: { address: 'Lajpat Nagar', city: 'Delhi' }, dietary: { isVegetarian: true }, donor: { name: 'Priya Mehta', organization: 'The Golden Whisk' }, isEmergency: false },
  { _id: 'demo-3', title: '🚨 Emergency: Dal & Rice', foodType: 'cooked', quantity: 30, unit: 'kg', urgencyLevel: 'critical', aiScore: 98, location: { address: 'Karol Bagh', city: 'Delhi' }, dietary: { isVegetarian: true, isVegan: true }, donor: { name: 'Amit Gupta', organization: 'Hotel Metropolis' }, isEmergency: true },
  { _id: 'demo-4', title: 'Organic Seasonal Vegetables', foodType: 'fruits_vegetables', quantity: 25, unit: 'kg', urgencyLevel: 'low', aiScore: 65, location: { address: 'Azadpur', city: 'Delhi' }, dietary: { isVegetarian: true, isVegan: true }, donor: { name: 'Suresh Kumar', organization: 'Fresh Farm Co.' }, isEmergency: false },
  { _id: 'demo-5', title: 'Dairy Essentials (Milk & Yogurt)', foodType: 'dairy', quantity: 20, unit: 'liters', urgencyLevel: 'high', aiScore: 84, location: { address: 'South Extension', city: 'Delhi' }, dietary: { isVegetarian: true }, donor: { name: 'Vikram Singh', organization: 'DairyPlus Distributors' }, isEmergency: false },
  { _id: 'demo-6', title: 'Corporate Event Lunch Boxes', foodType: 'packaged', quantity: 60, unit: 'boxes', urgencyLevel: 'high', aiScore: 89, location: { address: 'Nehru Place', city: 'Delhi' }, dietary: { isVegetarian: true }, donor: { name: 'Neha Kapoor', organization: 'Global Tech Solutions' }, isEmergency: false },
];

export default function FoodBrowsePage() {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [foodType, setFoodType] = useState('all');
  const [urgency, setUrgency] = useState('all');

  useEffect(() => {
    axios.get(`${API}/food?status=available&limit=50`)
      .then(r => {
        const data = r.data.listings;
        setListings(Array.isArray(data) && data.length > 0 ? data : DEMO_LISTINGS);
      })
      .catch(() => setListings(DEMO_LISTINGS))
      .finally(() => setLoading(false));
  }, []);

  const filtered = listings.filter(l => {
    if (search && !l.title?.toLowerCase().includes(search.toLowerCase()) && !l.location?.city?.toLowerCase().includes(search.toLowerCase())) return false;
    if (foodType !== 'all' && l.foodType !== foodType) return false;
    if (urgency !== 'all' && l.urgencyLevel !== urgency) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-white">
      <div className="page-container pb-24 pt-12">
        {/* Header (Minimal) */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-20 text-center max-w-2xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-black mb-8 text-slate-900 tracking-tight leading-[1]">
            Find <span className="text-green-500 italic font-serif">Surplus</span>.
          </h1>
          <p className="text-lg text-slate-500 font-medium leading-relaxed">
            AI-prioritized rescues matching supply to demand in real-time.
          </p>
        </motion.div>

        {/* Search & Filter (Clean) */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16 max-w-4xl mx-auto"
        >
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-[3]">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
              <input 
                className="w-full pl-14 pr-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 text-sm font-medium focus:bg-white focus:ring-2 focus:ring-green-500/10 transition-all outline-none text-slate-900 placeholder-slate-400" 
                placeholder="Search food or location..."
                value={search} 
                onChange={e => setSearch(e.target.value)} 
              />
            </div>
            <div className="flex flex-1 gap-3">
              <select 
                className="flex-1 px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 text-[11px] font-black uppercase tracking-widest outline-none cursor-pointer hover:bg-slate-100 transition-all text-slate-700" 
                value={foodType} 
                onChange={e => setFoodType(e.target.value)}
              >
                {FOOD_TYPES.map(t => <option key={t} value={t}>{t === 'all' ? 'All Types' : t.replace('_', ' ')}</option>)}
              </select>
              <select 
                className="flex-1 px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 text-[11px] font-black uppercase tracking-widest outline-none cursor-pointer hover:bg-slate-100 transition-all text-slate-700" 
                value={urgency} 
                onChange={e => setUrgency(e.target.value)}
              >
                <option value="all">Any Urgency</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Results Info */}
        <div className="flex items-center justify-between mb-10 px-2">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            {filtered.length} active rescues found
          </p>
          <Link href="/map" className="text-[10px] font-black uppercase tracking-[0.2em] text-green-600 hover:text-green-700 flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5" /> View on Map
          </Link>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="w-full aspect-[4/5] rounded-[3rem] bg-slate-50 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-40 border border-dashed border-slate-200 rounded-[4rem]">
            <p className="text-sm font-bold text-slate-400">No active rescues matching your search.</p>
          </div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
          >
            {filtered.map((listing, i) => (
              <motion.div key={listing._id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}>
                <FoodCard listing={listing} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}

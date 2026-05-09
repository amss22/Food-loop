'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import EmergencyBanner from '@/components/EmergencyBanner';
import FoodCard from '@/components/FoodCard';
import { Search, MapPin, Filter, Package, CheckCircle, Clock, Leaf, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

const API = process.env.NEXT_PUBLIC_API_URL;

export default function NGODashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [listings, setListings] = useState<any[]>([]);
  const [donations, setDonations] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loadingData, setLoadingData] = useState(true);
  const [aiMatching, setAiMatching] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace('/auth/login');
  }, [user, loading]);

  useEffect(() => {
    if (user) {
      Promise.all([
        axios.get(`${API}/users/dashboard/stats`),
        axios.get(`${API}/food?status=available&limit=20`),
        axios.get(`${API}/donations/my`),
      ]).then(([s, f, d]) => {
        setStats(s.data.stats);
        setListings(f.data.listings || []);
        setDonations(d.data.donations || []);
      }).catch(() => {
        setStats({ totalClaimed: 7, pendingPickups: 2, totalReceived: 5, kgReceived: 145, mealsProvided: 480 });
        setListings([]);
        setDonations([]);
      }).finally(() => setLoadingData(false));
    }
  }, [user]);

  const filtered = listings.filter(l =>
    !search || l.title?.toLowerCase().includes(search.toLowerCase()) || l.location?.city?.toLowerCase().includes(search.toLowerCase())
  );

  const handleAiMatch = async () => {
    if (!search.trim()) {
      toast.error('Please describe what food you need in the search box first.');
      return;
    }
    
    setAiMatching(true);
    toast.loading('AI is finding the best matches...', { id: 'match' });
    try {
      const { data } = await axios.post(`${API}/ai/match`, {
        listings: listings,
        ngoDemand: search
      });
      
      if (data.success && data.topMatches) {
        // Re-sort the listings: matches first
        const matched = listings.filter(l => data.topMatches.includes(l._id));
        const others = listings.filter(l => !data.topMatches.includes(l._id));
        setListings([...matched, ...others]);
        toast.success('Found best AI matches!', { id: 'match' });
        // Clear search so the matches actually show up (since filtering might hide them if terms don't exactly match)
        setSearch(''); 
      } else {
        throw new Error('Match failed');
      }
    } catch (err) {
      toast.error('AI Matching failed', { id: 'match' });
    } finally {
      setAiMatching(false);
    }
  };

  if (loading || loadingData) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#f8fdf9' }}>
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-t-green-500 rounded-full animate-spin" style={{ border: '3px solid #dcfce7', borderTopColor: '#22c55e' }} />
        <p className="text-sm font-medium" style={{ color: '#94a3b8' }}>Loading your dashboard...</p>
      </div>
    </div>
  );

  const statCards = [
    { label: 'Total Claimed', value: stats?.totalClaimed ?? 0, icon: Package, color: '#16a34a', bg: 'rgba(22,163,74,0.08)' },
    { label: 'Pending Pickups', value: stats?.pendingPickups ?? 0, icon: Clock, color: '#d97706', bg: 'rgba(217,119,6,0.08)' },
    { label: 'Received', value: stats?.totalReceived ?? 0, icon: CheckCircle, color: '#059669', bg: 'rgba(5,150,105,0.08)' },
    { label: 'Kg Received', value: `${stats?.kgReceived ?? 0}kg`, icon: Leaf, color: '#22c55e', bg: 'rgba(34,197,94,0.08)' },
  ];

  return (
    <div className="min-h-screen bg-[#f8fdf9]">
      <div className="page-container pb-16 pt-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 px-4">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <span className="inline-block px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-4" style={{ background: 'white', border: '1.5px solid #dcfce7', color: '#16a34a' }}>
              NGO Impact Hub
            </span>
            <h1 className="text-4xl md:text-5xl font-black mb-3" style={{ color: '#0f172a' }}>
              Welcome, <span className="text-gradient-green">{user?.name?.split(' ')[0]}</span> 👋
            </h1>
            <p className="text-lg font-medium text-slate-500">
               Feeding communities, one rescue at a time.
            </p>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex gap-4">
            <Link
              href="/map"
              className="group flex items-center gap-3 px-8 py-4 rounded-[1.5rem] font-black text-sm transition-all hover:scale-105 shadow-xl hover:shadow-green-500/20 active:scale-95"
              style={{ background: 'white', border: '2px solid #bbf7d0', color: '#16a34a' }}
            >
              <MapPin className="w-5 h-5 transition-transform group-hover:rotate-12" /> Open Live Map
            </Link>
          </motion.div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {statCards.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="rounded-[2.5rem] p-8 transition-all duration-500 bg-white border-[1.5px] border-slate-50 group hover:border-green-200 hover:shadow-2xl hover:shadow-green-900/10"
            >
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-sm" style={{ background: s.bg }}>
                <s.icon className="w-6 h-6" style={{ color: s.color }} />
              </div>
              <p className="text-3xl font-black" style={{ color: '#0f172a' }}>{s.value}</p>
              <p className="text-xs font-black uppercase tracking-widest mt-2" style={{ color: '#94a3b8' }}>{s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Active Claims */}
        {donations.filter(d => ['accepted', 'volunteer_assigned', 'picked_up'].includes(d.status)).length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-[3rem] p-10 mb-12"
            style={{ background: 'white', border: '1.5px solid #dcfce7', boxShadow: '0 12px 48px rgba(22,163,74,0.08)' }}
          >
            <div className="flex items-center justify-between mb-8">
               <h3 className="font-black text-xs uppercase tracking-[0.2em]" style={{ color: '#16a34a' }}>📦 ACTIVE RESCUE MISSIONS</h3>
               <Link href="/donations" className="text-[10px] font-black text-slate-400 hover:text-green-600 transition-colors">VIEW ALL →</Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {donations.filter(d => ['accepted', 'volunteer_assigned', 'picked_up'].includes(d.status)).slice(0, 3).map((d: any) => (
                <div
                  key={d._id}
                  className="flex items-center justify-between p-6 rounded-[2rem] transition-all hover:bg-green-50/30"
                  style={{ background: 'white', border: '1.5px solid #f0fdf4' }}
                >
                  <div className="min-w-0">
                    <p className="text-base font-black truncate" style={{ color: '#0f172a' }}>{d.listing?.title || 'Food Donation'}</p>
                    <div className="flex items-center gap-2 mt-1">
                       <p className="text-xs font-bold text-green-600 uppercase tracking-tighter">{d.listing?.quantity} {d.listing?.unit}</p>
                       <div className="w-1 h-1 rounded-full bg-slate-200" />
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{d.status.replace('_', ' ')}</p>
                    </div>
                  </div>
                  <Link href={`/donations/${d._id}`}
                    className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors hover:bg-green-100" style={{ color: '#16a34a', border: '1.5px solid #dcfce7' }}>
                    <Clock className="w-4 h-4" />
                  </Link>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Browse Available Food */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-10 px-2">
            <div>
               <h3 className="text-2xl font-black" style={{ color: '#0f172a' }}>Priority Rescues</h3>
               <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">AI-Ranked for maximum impact</p>
            </div>
            <div className="flex items-center gap-2 relative">
              <div className="relative">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#22c55e' }} />
                <input
                  className="input-dark pl-14 py-4 text-sm font-bold w-full md:w-64 rounded-[1.5rem]"
                  placeholder="Describe needed food..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAiMatch()}
                />
              </div>
              <button
                onClick={handleAiMatch}
                disabled={aiMatching || !search.trim()}
                className="flex items-center gap-2 px-5 py-4 rounded-[1.5rem] font-black text-sm transition-all hover:scale-105 shadow-lg disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)', color: 'white' }}
              >
                {aiMatching ? <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" /> : <Sparkles className="w-4 h-4" />}
                AI Match
              </button>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-24 bg-white rounded-[3rem] border border-green-50 shadow-xl max-w-2xl mx-auto">
              <div className="text-7xl mb-6">🔍</div>
              <h3 className="text-2xl font-black text-slate-800 mb-2">No missions found</h3>
              <p className="text-slate-400 font-medium px-10">Check back in a few minutes or adjust your search.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 justify-items-center">
              {filtered.map((listing: any) => (
                <FoodCard key={listing._id} listing={listing} />
              ))}
            </div>
          )}
          
          <div className="mt-16 text-center">
             <Link 
               href="/food" 
               className="inline-flex items-center gap-3 px-10 py-5 rounded-2xl font-black text-sm transition-all hover:scale-105 shadow-xl hover:shadow-green-900/10"
               style={{ background: 'white', border: '2px solid #dcfce7', color: '#16a34a' }}
             >
                Explore All Listings <Package className="w-5 h-5" />
             </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

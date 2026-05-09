'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import EmergencyBanner from '@/components/EmergencyBanner';
import { Truck, CheckCircle, MapPin, Clock, Award, Navigation, Wand2 } from 'lucide-react';
import toast from 'react-hot-toast';

const API = process.env.NEXT_PUBLIC_API_URL;

export default function VolunteerDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [optimizing, setOptimizing] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace('/auth/login');
  }, [user, loading]);

  useEffect(() => {
    if (user) {
      Promise.all([
        axios.get(`${API}/users/dashboard/stats`),
        axios.get(`${API}/donations/my`),
      ]).then(([s, d]) => {
        setStats(s.data.stats);
        setDeliveries(d.data.donations || []);
      }).catch(() => {
        setStats({ totalDeliveries: 18, activeDeliveries: 1, completedDeliveries: 17, kgDelivered: 340 });
        setDeliveries([]);
      }).finally(() => setLoadingData(false));
    }
  }, [user]);

  const markDelivered = async (id: string) => {
    try {
      await axios.post(`${API}/donations/${id}/deliver`);
      setDeliveries(prev => prev.map(d => d._id === id ? { ...d, status: 'delivered' } : d));
      toast.success('Marked as delivered!');
    } catch (err) { toast.error('Failed to update status'); }
  };

  const handleOptimizeRoute = async () => {
    const activeDeliveries = deliveries.filter(d => ['volunteer_assigned', 'picked_up', 'in_transit'].includes(d.status));
    if (activeDeliveries.length < 2) {
      toast.error('Need at least 2 active deliveries to optimize route');
      return;
    }

    setOptimizing(true);
    toast.loading('AI is calculating optimal route...', { id: 'optimize' });
    try {
      const locations = activeDeliveries.map(d => ({
        lat: d.listing?.location?.coordinates?.[1] || 28.6139,
        lng: d.listing?.location?.coordinates?.[0] || 77.2090,
        address: d.listing?.location?.address || 'Delhi'
      }));
      
      // Send to AI for optimization (using a dummy start location for simplicity)
      const startLocation = { lat: 28.5355, lng: 77.2410, address: 'Volunteer Hub' };
      const { data } = await axios.post(`${API}/ai/optimize-route`, { locations, startLocation });
      
      if (data.success && data.optimalOrder) {
        // Reorder the active deliveries based on the AI's returned indices
        const reorderedActive = data.optimalOrder.map((index: number) => activeDeliveries[index]).filter(Boolean);
        // Append the inactive ones at the bottom
        const inactiveDeliveries = deliveries.filter(d => !['volunteer_assigned', 'picked_up', 'in_transit'].includes(d.status));
        setDeliveries([...reorderedActive, ...inactiveDeliveries]);
        toast.success('Route optimized successfully!', { id: 'optimize' });
      } else {
        throw new Error('Failed to optimize');
      }
    } catch (err) {
      toast.error('AI optimization failed', { id: 'optimize' });
    } finally {
      setOptimizing(false);
    }
  };

  if (loading || loadingData) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#f8fdf9' }}>
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-full animate-spin" style={{ border: '3px solid #dcfce7', borderTopColor: '#22c55e' }} />
        <p className="text-sm font-medium" style={{ color: '#94a3b8' }}>Loading your dashboard...</p>
      </div>
    </div>
  );

  const BADGES = [
    { name: 'First Delivery', icon: '🏅', earned: (stats?.completedDeliveries ?? 0) >= 1 },
    { name: 'Food Hero', icon: '🦸', earned: (stats?.completedDeliveries ?? 0) >= 10 },
    { name: 'Super Volunteer', icon: '⭐', earned: (stats?.completedDeliveries ?? 0) >= 50 },
    { name: 'Eco Warrior', icon: '🌿', earned: (stats?.kgDelivered ?? 0) >= 100 },
  ];

  const statCards = [
    { label: 'Total Deliveries', value: stats?.totalDeliveries ?? 0, icon: Truck, color: '#16a34a', bg: 'rgba(22,163,74,0.08)' },
    { label: 'Active', value: stats?.activeDeliveries ?? 0, icon: Clock, color: '#d97706', bg: 'rgba(217,119,6,0.08)' },
    { label: 'Completed', value: stats?.completedDeliveries ?? 0, icon: CheckCircle, color: '#059669', bg: 'rgba(5,150,105,0.08)' },
    { label: 'Kg Delivered', value: `${stats?.kgDelivered ?? 0}kg`, icon: Award, color: '#7c3aed', bg: 'rgba(124,58,237,0.08)' },
  ];

  return (
    <div className="min-h-screen bg-[#f8fdf9]">
      <div className="page-container pb-16 pt-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 px-4">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <span className="inline-block px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-4" style={{ background: 'white', border: '1.5px solid #dcfce7', color: '#16a34a' }}>
              Volunteer Mission Control
            </span>
            <h1 className="text-4xl md:text-5xl font-black mb-3" style={{ color: '#0f172a' }}>
              Hey, <span className="text-gradient-green">{user?.name?.split(' ')[0]}</span>! 🚴
            </h1>
            <p className="text-lg font-medium text-slate-500">
               Ready to rescue some food today?
            </p>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex gap-4">
            <Link
              href="/map"
              className="group flex items-center gap-3 px-8 py-4 rounded-[1.5rem] font-black text-sm text-white transition-all hover:scale-105 shadow-2xl hover:shadow-green-500/30 active:scale-95"
              style={{
                background: 'linear-gradient(135deg, #22c55e, #16a34a)',
              }}
            >
              <Navigation className="w-5 h-5 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" /> Find Priority Pickups
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

        <div className="grid lg:grid-cols-12 gap-10">
          {/* Deliveries List */}
          <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center justify-between px-2">
               <h3 className="font-black text-xs uppercase tracking-[0.2em]" style={{ color: '#0f172a' }}>🚚 MY DELIVERY MISSIONS</h3>
               <div className="flex gap-3">
                 <button 
                   onClick={handleOptimizeRoute}
                   disabled={optimizing}
                   className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:bg-green-50 disabled:opacity-50"
                   style={{ color: '#16a34a', border: '1.5px solid #dcfce7' }}
                 >
                   {optimizing ? <div className="w-3 h-3 border-2 border-green-500 border-t-transparent rounded-full animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />}
                   Optimize Route (AI)
                 </button>
                 <Link href="/map" className="text-[10px] font-black text-slate-400 hover:text-green-600 transition-colors flex items-center">VIEW LIVE MAP →</Link>
               </div>
            </div>
            
            {deliveries.length === 0 ? (
              <div
                className="rounded-[3rem] p-20 text-center bg-white border-[1.5px] border-slate-50 shadow-xl shadow-slate-900/5"
              >
                <div className="text-7xl mb-6">🚴</div>
                <h3 className="text-2xl font-black text-slate-800 mb-2">No active missions</h3>
                <p className="text-slate-400 font-medium mb-10 px-10">You haven't accepted any rescue tasks yet. Check the live map for nearby surplus food!</p>
                <Link href="/map" className="px-10 py-4 rounded-2xl font-black text-sm text-white shadow-xl" style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}>Find Pickups Now</Link>
              </div>
            ) : (
              <div className="space-y-5">
                {deliveries.slice(0, 10).map((d: any, i) => (
                  <motion.div
                    key={d._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="rounded-[2rem] p-6 bg-white border-[1.5px] border-slate-50 transition-all hover:border-green-100 hover:shadow-xl hover:shadow-green-900/5 group"
                  >
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                      <div className="flex items-center gap-6 w-full sm:w-auto">
                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-sm transition-transform group-hover:scale-110" style={{ background: 'rgba(34,197,94,0.06)' }}>
                          {d.listing?.foodType === 'bakery' ? '🥐' : d.listing?.foodType === 'cooked' ? '🍛' : '🥦'}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${
                              d.status === 'delivered' ? 'bg-slate-100 text-slate-500' :
                              d.status === 'picked_up' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'
                            }`}>
                              {d.status.replace('_', ' ')}
                            </span>
                            {d.listing?.isEmergency && <span className="text-[10px] font-black text-red-500">🚨 EMERGENCY</span>}
                          </div>
                          <p className="text-base font-black truncate" style={{ color: '#0f172a' }}>{d.listing?.title || 'Delivery Task'}</p>
                          <p className="text-xs font-bold text-slate-400 uppercase mt-1">
                            {d.listing?.quantity} {d.listing?.unit} • {d.listing?.location?.city}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex gap-3 w-full sm:w-auto">
                        {d.status === 'volunteer_assigned' && (
                          <Link
                            href={`/donations/${d._id}`}
                            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest px-6 py-3 rounded-xl transition-all hover:scale-105"
                            style={{ background: 'rgba(2,132,199,0.06)', border: '1.5px solid rgba(2,132,199,0.15)', color: '#0284c7' }}
                          >
                            <Navigation className="w-4 h-4" /> Details
                          </Link>
                        )}
                        {(d.status === 'picked_up' || d.status === 'in_transit') && (
                          <button
                            onClick={() => markDelivered(d._id)}
                            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest px-6 py-3 rounded-xl transition-all hover:scale-105"
                            style={{ background: 'rgba(22,163,74,0.06)', border: '1.5px solid rgba(22,163,74,0.15)', color: '#16a34a' }}
                          >
                            <CheckCircle className="w-4 h-4" /> Delivered
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Badges */}
          <div className="lg:col-span-4 space-y-6">
            <h3 className="font-black text-xs uppercase tracking-[0.2em] px-2" style={{ color: '#0f172a' }}>🎖️ IMPACT BADGES</h3>
            <div
              className="rounded-[2.5rem] p-8 space-y-5 bg-white border-[1.5px] border-slate-50 shadow-xl shadow-slate-900/5"
            >
              {BADGES.map((badge, i) => (
                <div
                  key={i}
                  className="flex items-center gap-5 p-4 rounded-2xl transition-all group"
                  style={badge.earned ? {
                    background: 'rgba(34,197,94,0.04)',
                    border: '1.5px solid rgba(34,197,94,0.1)',
                  } : {
                    opacity: 0.3,
                    border: '1.5px solid transparent',
                  }}
                >
                  <span className="text-4xl transition-transform group-hover:scale-110">{badge.icon}</span>
                  <div className="flex-1">
                    <p className="text-sm font-black" style={{ color: '#0f172a' }}>{badge.name}</p>
                    <p className="text-[10px] font-black uppercase tracking-widest mt-1" style={{ color: badge.earned ? '#16a34a' : '#94a3b8' }}>
                      {badge.earned ? 'Mission Accomplished' : 'Mission Locked'}
                    </p>
                  </div>
                  {badge.earned && <CheckCircle className="w-5 h-5 text-green-500" />}
                </div>
              ))}
              
              <div className="pt-6 border-t border-slate-50 mt-8">
                 <div className="rounded-2xl p-5 bg-blue-50/30 border border-blue-100">
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2">Next Milestone</p>
                    <p className="text-xs font-bold text-slate-600 leading-relaxed">Complete 3 more deliveries to unlock the "Community Pillar" badge!</p>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import EmergencyBanner from '@/components/EmergencyBanner';
import { Plus, Package, TrendingUp, Leaf, Clock, CheckCircle, XCircle, BarChart3 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import toast from 'react-hot-toast';

const API = process.env.NEXT_PUBLIC_API_URL;

const MONTHLY_DATA = [
  { month: 'Jan', kg: 120 }, { month: 'Feb', kg: 180 }, { month: 'Mar', kg: 150 },
  { month: 'Apr', kg: 210 }, { month: 'May', kg: 190 }, { month: 'Jun', kg: 280 },
];

export default function DonorDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [listings, setListings] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && !user) router.replace('/auth/login');
    if (!loading && user && user.role !== 'donor' && user.role !== 'admin') {
      router.replace(`/dashboard/${user.role === 'receiver' ? 'ngo' : user.role}`);
    }
  }, [user, loading]);

  useEffect(() => {
    if (user) {
      Promise.all([
        axios.get(`${API}/users/dashboard/stats`),
        axios.get(`${API}/food/donor/mine`),
      ]).then(([statsRes, listingsRes]) => {
        setStats(statsRes.data.stats);
        setListings(listingsRes.data.listings || []);
      }).catch(() => {
        setStats({ totalListings: 12, activeListings: 3, totalDelivered: 9, kgFoodSaved: 245, mealsProvided: 810, co2Saved: 612 });
        setListings([]);
      }).finally(() => setLoadingData(false));
    }
  }, [user]);

  const cancelListing = async (id: string) => {
    try {
      await axios.delete(`${API}/food/${id}`);
      setListings(prev => prev.filter(l => l._id !== id));
      toast.success('Listing cancelled');
    } catch { toast.error('Failed to cancel listing'); }
  };

  if (loading || loadingData) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#f8fdf9' }}>
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-3 border-green-100 border-t-green-500 rounded-full animate-spin" style={{ borderWidth: '3px' }} />
        <p className="text-sm font-medium" style={{ color: '#94a3b8' }}>Loading your dashboard...</p>
      </div>
    </div>
  );

  const statCards = [
    { label: 'Total Listings', value: stats?.totalListings ?? 0, icon: Package, color: '#16a34a', bg: 'rgba(22,163,74,0.08)', suffix: '' },
    { label: 'Active Now', value: stats?.activeListings ?? 0, icon: Clock, color: '#059669', bg: 'rgba(5,150,105,0.08)', suffix: '' },
    { label: 'Kg Food Saved', value: stats?.kgFoodSaved ?? 0, icon: Leaf, color: '#22c55e', bg: 'rgba(34,197,94,0.08)', suffix: 'kg' },
    { label: 'Meals Provided', value: stats?.mealsProvided ?? 0, icon: TrendingUp, color: '#0284c7', bg: 'rgba(2,132,199,0.08)', suffix: '' },
  ];

  const pieData = [
    { name: 'Delivered', value: stats?.totalDelivered ?? 0 },
    { name: 'Active', value: stats?.activeListings ?? 0 },
    { name: 'Cancelled', value: Math.max(0, (stats?.totalListings ?? 0) - (stats?.totalDelivered ?? 0) - (stats?.activeListings ?? 0)) },
  ];
  const PIE_COLORS = ['#16a34a', '#22c55e', '#cbd5e1'];

  return (
    <div className="min-h-screen bg-[#f8fdf9]">
      <div className="page-container pb-16 pt-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 px-4">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <span className="inline-block px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-4" style={{ background: 'white', border: '1.5px solid #dcfce7', color: '#16a34a' }}>
              Donor Control Center
            </span>
            <h1 className="text-4xl md:text-5xl font-black mb-3" style={{ color: '#0f172a' }}>
              Welcome, <span className="text-gradient-green">{user?.name?.split(' ')[0]}</span> 👋
            </h1>
            <p className="text-lg font-medium text-slate-500">
               {user?.organization || 'Your redistribution impact today'}
            </p>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex gap-4">
            <Link
              href="/food/new"
              className="group flex items-center gap-3 px-8 py-4 rounded-[1.5rem] font-black text-sm text-white transition-all hover:scale-105 shadow-2xl hover:shadow-green-500/30 active:scale-95"
              style={{
                background: 'linear-gradient(135deg, #22c55e, #16a34a)',
              }}
            >
              <Plus className="w-5 h-5 transition-transform group-hover:rotate-90" /> Donate Surplus Food
            </Link>
          </motion.div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {statCards.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="rounded-[2.5rem] p-8 transition-all duration-500 bg-white border-[1.5px] border-slate-50 group hover:border-green-200 hover:shadow-2xl hover:shadow-green-900/10"
            >
              <div className="flex items-center justify-between mb-6">
                <div 
                  className="w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-sm" 
                  style={{ background: s.bg }}
                >
                  <s.icon className="w-6 h-6" style={{ color: s.color }} />
                </div>
              </div>
              <p className="text-3xl font-black" style={{ color: '#0f172a' }}>{s.value.toLocaleString()}{s.suffix}</p>
              <p className="text-xs font-black uppercase tracking-widest mt-2" style={{ color: '#94a3b8' }}>{s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Impact Summary - Symmetrical Center */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="rounded-[3rem] p-12 mb-12 relative overflow-hidden"
          style={{
            background: 'white',
            border: '1.5px solid #e8f5ec',
            boxShadow: '0 12px 64px rgba(22,163,74,0.08)',
          }}
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-green-50/50 rounded-full blur-3xl -mr-32 -mt-32" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-green-50/50 rounded-full blur-3xl -ml-32 -mb-32" />

          <h3 className="font-black text-xs uppercase tracking-[0.2em] mb-10 text-center flex items-center justify-center gap-3" style={{ color: '#0f172a' }}>
            <Leaf className="w-4 h-4 text-green-500" /> 🌍 Your Environmental Footprint
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center relative z-10">
            {[
              { value: `${stats?.kgFoodSaved ?? 0}kg`, label: 'Food Rescued', color: '#16a34a', sub: 'Total weight redirected' },
              { value: stats?.mealsProvided ?? 0, label: 'Meals Provided', color: '#059669', sub: 'Direct community impact' },
              { value: `${stats?.co2Saved ?? 0}kg`, label: 'CO₂ Saved', color: '#0284c7', sub: 'Emissions prevented' },
            ].map((item, i) => (
              <div key={i} className="group">
                <p className="text-5xl font-black mb-2 transition-transform group-hover:scale-110" style={{ color: item.color }}>{item.value}</p>
                <p className="text-sm font-black uppercase tracking-widest" style={{ color: '#0f172a' }}>{item.label}</p>
                <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tighter">{item.sub}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Charts Section */}
        <div className="grid lg:grid-cols-12 gap-8 mb-12">
          {/* Area Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-8 rounded-[2.5rem] p-10 bg-white border-[1.5px] border-slate-50 shadow-xl shadow-slate-900/5"
          >
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm" style={{ background: 'rgba(34,197,94,0.06)' }}>
                  <BarChart3 className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-black text-lg" style={{ color: '#0f172a' }}>Performance Trends</h3>
                  <p className="text-xs font-bold text-slate-400">Monthly rescue weight (kg)</p>
                </div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={MONTHLY_DATA}>
                <defs>
                  <linearGradient id="greenGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 800, fill: '#94a3b8' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 800, fill: '#94a3b8' }} />
                <Tooltip
                  cursor={{ stroke: '#22c55e', strokeWidth: 2, strokeDasharray: '5 5' }}
                  contentStyle={{
                    background: 'rgba(255,255,255,0.9)',
                    backdropFilter: 'blur(10px)',
                    border: '1.5px solid #dcfce7',
                    borderRadius: '20px',
                    boxShadow: '0 12px 32px rgba(22,163,74,0.15)',
                  }}
                />
                <Area 
                   type="monotone" 
                   dataKey="kg" 
                   stroke="#16a34a" 
                   strokeWidth={4} 
                   fill="url(#greenGrad)" 
                   dot={{ fill: '#16a34a', strokeWidth: 3, r: 5, stroke: '#fff' }} 
                   activeDot={{ r: 8, strokeWidth: 0 }} 
                />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Status Pie */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-4 rounded-[2.5rem] p-10 bg-white border-[1.5px] border-slate-50 shadow-xl shadow-slate-900/5 flex flex-col"
          >
            <h3 className="font-black text-lg mb-8" style={{ color: '#0f172a' }}>Mission Status</h3>
            <div className="flex-1 flex flex-col items-center justify-center">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={8} dataKey="value">
                    {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} strokeWidth={0} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="w-full space-y-4 mt-8">
                {pieData.map((d, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full shadow-sm" style={{ background: PIE_COLORS[i] }} />
                      <span className="text-xs font-black text-slate-500 uppercase tracking-widest">{d.name}</span>
                    </div>
                    <span className="text-sm font-black" style={{ color: '#0f172a' }}>{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* My Listings Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="rounded-[3rem] overflow-hidden bg-white border-[1.5px] border-slate-50 shadow-xl shadow-slate-900/5"
        >
          <div className="p-10 flex items-center justify-between border-b border-slate-50">
            <div>
              <h3 className="font-black text-xl mb-1" style={{ color: '#0f172a' }}>Recent Contributions</h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Live status of your food rescues</p>
            </div>
            <Link
              href="/food/new"
              className="px-6 py-2.5 rounded-xl font-black text-xs transition-all hover:bg-green-50"
              style={{ border: '1.5px solid #dcfce7', color: '#16a34a' }}
            >
              + Create New
            </Link>
          </div>

          <div className="overflow-x-auto">
            {listings.length === 0 ? (
              <div className="py-24 text-center">
                <div className="text-7xl mb-6">📦</div>
                <h3 className="text-2xl font-black text-slate-800 mb-2">No active rescues</h3>
                <p className="text-slate-400 font-medium mb-10">Start your journey by donating surplus food today.</p>
                <Link
                  href="/food/new"
                  className="px-10 py-4 rounded-2xl font-black text-sm text-white shadow-xl"
                  style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}
                >
                  Post First Donation
                </Link>
              </div>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50/50">
                    <th className="px-10 py-5">Food Item</th>
                    <th className="px-10 py-5 text-center">Quantity</th>
                    <th className="px-10 py-5 text-center">Status</th>
                    <th className="px-10 py-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {listings.slice(0, 10).map((l: any) => (
                    <tr key={l._id} className="group transition-colors hover:bg-green-50/20">
                      <td className="px-10 py-6">
                        <div className="flex items-center gap-5">
                          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0 shadow-sm" style={{ background: 'rgba(34,197,94,0.06)' }}>
                            {l.foodType === 'bakery' ? '🥐' : l.foodType === 'cooked' ? '🍛' : '🥦'}
                          </div>
                          <div className="min-w-0">
                            <p className="font-black text-base truncate" style={{ color: '#0f172a' }}>{l.title}</p>
                            <p className="text-xs font-bold text-slate-400 uppercase mt-1">{l.location?.city}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-6 text-center">
                        <span className="font-black text-base" style={{ color: '#16a34a' }}>{l.quantity}</span>
                        <span className="text-[10px] font-black text-slate-400 uppercase ml-1.5">{l.unit}</span>
                      </td>
                      <td className="px-10 py-6 text-center">
                        <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                          l.status === 'available' ? 'bg-green-50 text-green-600 border border-green-100' :
                          l.status === 'claimed' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                          l.status === 'delivered' ? 'bg-slate-50 text-slate-500 border border-slate-100' :
                          'bg-red-50 text-red-600 border border-red-100'
                        }`}>
                          {l.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-10 py-6 text-right">
                        {l.status === 'available' ? (
                          <button
                            onClick={() => cancelListing(l._id)}
                            className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all border border-transparent hover:border-red-100"
                          >
                            <XCircle className="w-5 h-5" />
                          </button>
                        ) : l.status === 'delivered' ? (
                          <div className="flex justify-end pr-3">
                            <CheckCircle className="w-6 h-6 text-green-500" />
                          </div>
                        ) : (
                          <div className="text-[10px] font-black text-slate-300 uppercase italic">In Progress</div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

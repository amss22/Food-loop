'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import EmergencyBanner from '@/components/EmergencyBanner';
import { Users, Package, TrendingUp, Leaf, AlertTriangle, CheckCircle, Shield } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import toast from 'react-hot-toast';

const API = process.env.NEXT_PUBLIC_API_URL;

const CHART_TOOLTIP_STYLE = {
  background: 'white',
  border: '1px solid #dcfce7',
  borderRadius: '12px',
  color: '#0f172a',
  boxShadow: '0 8px 24px rgba(22,163,74,0.12)',
  fontSize: '12px',
};

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [tab, setTab] = useState<'overview' | 'users'>('overview');

  useEffect(() => {
    if (!loading && !user) router.replace('/auth/login');
    if (!loading && user && user.role !== 'admin') router.replace('/');
  }, [user, loading]);

  useEffect(() => {
    if (user) {
      Promise.all([
        axios.get(`${API}/admin/stats`),
        axios.get(`${API}/admin/users?limit=10`),
      ]).then(([s, u]) => {
        setStats(s.data.stats);
        setUsers(u.data.users || []);
      }).catch(() => {
        setStats({
          totalUsers: 342, totalListings: 1240, totalDonations: 890, deliveredCount: 756,
          kgSaved: 8920, mealsSaved: 29436, co2Saved: 22300,
          usersByRole: [{ _id: 'donor', count: 180 }, { _id: 'receiver', count: 95 }, { _id: 'volunteer', count: 65 }, { _id: 'admin', count: 2 }],
          recentDonations: [
            { _id: '2024-06-01', count: 12 }, { _id: '2024-06-02', count: 18 },
            { _id: '2024-06-03', count: 15 }, { _id: '2024-06-04', count: 22 },
            { _id: '2024-06-05', count: 19 }, { _id: '2024-06-06', count: 28 },
            { _id: '2024-06-07', count: 24 },
          ],
        });
        setUsers([]);
      }).finally(() => setLoadingData(false));
    }
  }, [user]);

  const triggerEmergency = async () => {
    try {
      await axios.post(`${API}/admin/emergency`, {
        title: '🚨 Emergency Food Rescue',
        message: 'Urgent: Large quantity of food needs immediate rescue. All volunteers mobilize!',
        location: { lat: 28.6139, lng: 77.2090, address: 'Delhi NCR' },
      });
      toast.success('Emergency alert sent to all volunteers!');
    } catch { toast.error('Failed to send alert'); }
  };

  const verifyUser = async (id: string) => {
    try {
      await axios.put(`${API}/admin/users/${id}/verify`);
      setUsers(prev => prev.map(u => u._id === id ? { ...u, verified: true } : u));
      toast.success('User verified!');
    } catch { toast.error('Failed to verify'); }
  };

  if (loading || loadingData) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#f8fdf9' }}>
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-full animate-spin" style={{ border: '3px solid #dcfce7', borderTopColor: '#22c55e' }} />
        <p className="text-sm font-medium" style={{ color: '#94a3b8' }}>Loading dashboard...</p>
      </div>
    </div>
  );

  const roleData = stats?.usersByRole?.map((r: any) => ({ name: r._id, value: r.count })) || [];
  const donationTrend = stats?.recentDonations?.map((d: any) => ({ date: d._id?.split('-').slice(1).join('/'), count: d.count })) || [];

  const kpiCards = [
    { label: 'Total Users', value: stats?.totalUsers ?? 0, icon: Users, color: '#0284c7', bg: 'rgba(2,132,199,0.08)' },
    { label: 'Total Listings', value: stats?.totalListings ?? 0, icon: Package, color: '#059669', bg: 'rgba(5,150,105,0.08)' },
    { label: 'Kg Food Saved', value: `${(stats?.kgSaved ?? 0).toLocaleString()}kg`, icon: Leaf, color: '#16a34a', bg: 'rgba(22,163,74,0.08)' },
    { label: 'Meals Provided', value: (stats?.mealsSaved ?? 0).toLocaleString(), icon: TrendingUp, color: '#7c3aed', bg: 'rgba(124,58,237,0.08)' },
  ];

  return (
    <div className="min-h-screen bg-[#f8fdf9]">
      <div className="w-full max-w-7xl mx-auto px-6 pb-16 pt-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#22c55e' }}>Admin Dashboard</p>
            <h1 className="text-3xl font-black" style={{ color: '#0f172a' }}>Platform Overview 🛡️</h1>
          </motion.div>
          <div className="flex gap-3">
            <button
              onClick={triggerEmergency}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white transition-all hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)', boxShadow: '0 4px 16px rgba(239,68,68,0.25)' }}
            >
              <AlertTriangle className="w-4 h-4" /> Emergency Alert
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          {(['overview', 'users'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="px-5 py-2.5 rounded-xl text-sm font-bold capitalize transition-all"
              style={tab === t ? {
                background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                color: 'white',
                boxShadow: '0 4px 14px rgba(22,163,74,0.25)',
              } : {
                background: 'white',
                border: '1.5px solid #e2e8f0',
                color: '#64748b',
              }}
              onMouseEnter={e => {
                if (tab !== t) {
                  (e.currentTarget as HTMLElement).style.borderColor = '#bbf7d0';
                  (e.currentTarget as HTMLElement).style.color = '#16a34a';
                }
              }}
              onMouseLeave={e => {
                if (tab !== t) {
                  (e.currentTarget as HTMLElement).style.borderColor = '#e2e8f0';
                  (e.currentTarget as HTMLElement).style.color = '#64748b';
                }
              }}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === 'overview' && (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
              {kpiCards.map((s, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="rounded-2xl p-5 transition-all duration-300 cursor-default"
                  style={{ background: 'white', border: '1px solid #e8f5ec', boxShadow: '0 2px 12px rgba(22,163,74,0.05)' }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 30px rgba(22,163,74,0.12)';
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)';
                    (e.currentTarget as HTMLElement).style.borderColor = '#bbf7d0';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 12px rgba(22,163,74,0.05)';
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                    (e.currentTarget as HTMLElement).style.borderColor = '#e8f5ec';
                  }}
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: s.bg }}>
                    <s.icon className="w-5 h-5" style={{ color: s.color }} />
                  </div>
                  <p className="text-2xl font-black" style={{ color: '#0f172a' }}>{s.value}</p>
                  <p className="text-xs font-medium mt-1" style={{ color: '#94a3b8' }}>{s.label}</p>
                </motion.div>
              ))}
            </div>

            {/* Charts */}
            <div className="grid lg:grid-cols-2 gap-6 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="rounded-2xl p-6"
                style={{ background: 'white', border: '1px solid #e8f5ec', boxShadow: '0 2px 12px rgba(22,163,74,0.05)' }}
              >
                <h3 className="font-bold mb-5" style={{ color: '#0f172a' }}>Daily Donations (7 Days)</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={donationTrend}>
                    <XAxis dataKey="date" stroke="#cbd5e1" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                    <YAxis stroke="#cbd5e1" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                    <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
                    <Line type="monotone" dataKey="count" stroke="#16a34a" strokeWidth={2.5} dot={{ fill: '#16a34a', strokeWidth: 0, r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="rounded-2xl p-6"
                style={{ background: 'white', border: '1px solid #e8f5ec', boxShadow: '0 2px 12px rgba(22,163,74,0.05)' }}
              >
                <h3 className="font-bold mb-5" style={{ color: '#0f172a' }}>Users by Role</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={roleData}>
                    <XAxis dataKey="name" stroke="#cbd5e1" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                    <YAxis stroke="#cbd5e1" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                    <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
                    <Bar dataKey="value" fill="#22c55e" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </motion.div>
            </div>

            {/* Global Impact */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="rounded-2xl p-6"
              style={{
                background: 'linear-gradient(135deg, rgba(34,197,94,0.06), rgba(22,163,74,0.04))',
                border: '1px solid #dcfce7',
                boxShadow: '0 4px 20px rgba(22,163,74,0.08)',
              }}
            >
              <h3 className="font-bold mb-6 flex items-center gap-2" style={{ color: '#0f172a' }}>
                <span>🌍</span> Global Platform Impact
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                {[
                  { label: 'Deliveries Done', value: `${stats?.deliveredCount ?? 0}`, color: '#16a34a' },
                  { label: 'Kg Saved', value: `${(stats?.kgSaved ?? 0).toLocaleString()}`, color: '#059669' },
                  { label: 'Meals Provided', value: `${(stats?.mealsSaved ?? 0).toLocaleString()}`, color: '#0284c7' },
                  { label: 'CO₂ Saved (kg)', value: `${(stats?.co2Saved ?? 0).toLocaleString()}`, color: '#7c3aed' },
                ].map((s, i) => (
                  <div key={i}>
                    <p className="text-3xl font-black mb-1" style={{ color: s.color }}>{s.value}</p>
                    <p className="text-xs font-medium" style={{ color: '#64748b' }}>{s.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}

        {tab === 'users' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-2xl overflow-hidden"
            style={{ background: 'white', border: '1px solid #e8f5ec', boxShadow: '0 2px 12px rgba(22,163,74,0.05)' }}
          >
            <div className="p-6" style={{ borderBottom: '1px solid #e8f5ec' }}>
              <h3 className="font-bold" style={{ color: '#0f172a' }}>All Users</h3>
            </div>
            {users.length === 0 ? (
              <p className="text-center py-14 font-medium" style={{ color: '#94a3b8' }}>No users found</p>
            ) : (
              <div>
                {users.map((u: any) => (
                  <div
                    key={u._id}
                    className="px-6 py-4 flex items-center justify-between gap-4 transition-colors"
                    style={{ borderBottom: '1px solid #f0fdf4' }}
                    onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(34,197,94,0.03)')}
                    onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
                        style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}
                      >
                        {u.name?.[0]?.toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold truncate" style={{ color: '#0f172a' }}>{u.name}</p>
                        <p className="text-xs truncate" style={{ color: '#94a3b8' }}>
                          {u.email} • <span className="capitalize">{u.role}</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {u.verified ? (
                        <span
                          className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full"
                          style={{ background: 'rgba(22,163,74,0.08)', border: '1px solid rgba(22,163,74,0.2)', color: '#16a34a' }}
                        >
                          <Shield className="w-3 h-3" /> Verified
                        </span>
                      ) : (
                        <button
                          onClick={() => verifyUser(u._id)}
                          className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full transition-all hover:scale-105"
                          style={{ background: 'rgba(217,119,6,0.08)', border: '1px solid rgba(217,119,6,0.2)', color: '#d97706' }}
                        >
                          <CheckCircle className="w-3 h-3" /> Verify
                        </button>
                      )}
                      <span
                        className="text-[10px] px-2 py-1 rounded-full font-semibold"
                        style={u.active
                          ? { background: 'rgba(22,163,74,0.08)', color: '#16a34a' }
                          : { background: 'rgba(239,68,68,0.08)', color: '#ef4444' }
                        }
                      >
                        {u.active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}

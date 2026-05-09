'use client';
import { useState, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Leaf, Eye, EyeOff, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

const ROLES = [
  { value: 'donor',     label: '🏨 Donor',         desc: 'Restaurant / Hotel / Bakery' },
  { value: 'receiver',  label: '🏠 NGO / Shelter',  desc: 'Food Receiver / Community Fridge' },
  { value: 'volunteer', label: '🚴 Volunteer',       desc: 'Food Delivery Volunteer' },
];

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { register, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', password: '',
    role: searchParams.get('role') || 'donor',
    organization: '', phone: '',
  });

  useEffect(() => {
    if (user) router.replace(`/dashboard/${user.role === 'receiver' ? 'ngo' : user.role}`);
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form);
      toast.success('Welcome to FoodLoop! 🎉');
      router.push(`/dashboard/${form.role === 'receiver' ? 'ngo' : form.role}`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-10"
      style={{
        background: 'radial-gradient(ellipse at 75% 25%, rgba(34,197,94,0.1) 0%, transparent 55%), radial-gradient(ellipse at 25% 75%, rgba(134,239,172,0.12) 0%, transparent 55%), #ffffff',
      }}
    >
      {/* Decorative blobs */}
      <div className="fixed top-0 right-0 w-80 h-80 rounded-full pointer-events-none" style={{ background: 'rgba(34,197,94,0.05)', filter: 'blur(60px)', transform: 'translate(40%, -40%)' }} />
      <div className="fixed bottom-0 left-0 w-80 h-80 rounded-full pointer-events-none" style={{ background: 'rgba(134,239,172,0.07)', filter: 'blur(60px)', transform: 'translate(-40%, 40%)' }} />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg relative z-10"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-6 group">
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110"
              style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}
            >
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <span className="font-black text-2xl">
              <span className="text-gradient-green">Food</span>
              <span className="text-gradient-dark">Loop</span>
            </span>
          </Link>
          <h1 className="text-3xl font-black mb-2" style={{ color: '#0f172a' }}>Join the Movement</h1>
          <p className="text-sm" style={{ color: '#64748b' }}>Fight hunger, reduce waste — together</p>
        </div>

        {/* Card */}
        <div
          className="rounded-3xl p-8"
          style={{
            background: 'white',
            border: '1px solid #dcfce7',
            boxShadow: '0 8px 40px rgba(22,163,74,0.1), 0 2px 8px rgba(0,0,0,0.04)',
          }}
        >
          {/* Role selection */}
          <div className="mb-6">
            <label className="block text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#94a3b8' }}>I am a...</label>
            <div className="grid grid-cols-3 gap-2.5">
              {ROLES.map(r => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, role: r.value }))}
                  className="p-3.5 rounded-2xl text-center text-xs transition-all"
                  style={form.role === r.value ? {
                    border: '2px solid #22c55e',
                    background: 'rgba(34,197,94,0.07)',
                    color: '#16a34a',
                  } : {
                    border: '1.5px solid #e2e8f0',
                    background: 'white',
                    color: '#64748b',
                  }}
                >
                  <div className="text-xl mb-1">{r.label.split(' ')[0]}</div>
                  <div className="font-semibold">{r.label.split(' ').slice(1).join(' ')}</div>
                  <div className="text-[10px] mt-0.5" style={{ color: form.role === r.value ? '#22c55e' : '#94a3b8' }}>{r.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold mb-1.5" style={{ color: '#475569' }}>Full Name *</label>
              <input className="input-dark" placeholder="Your full name" value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1.5" style={{ color: '#475569' }}>Email *</label>
              <input className="input-dark" type="email" placeholder="you@example.com" value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
            </div>
            {(form.role === 'donor' || form.role === 'receiver') && (
              <div>
                <label className="block text-xs font-bold mb-1.5" style={{ color: '#475569' }}>Organization Name</label>
                <input className="input-dark" placeholder="Restaurant / NGO name" value={form.organization}
                  onChange={e => setForm(f => ({ ...f, organization: e.target.value }))} />
              </div>
            )}
            <div>
              <label className="block text-xs font-bold mb-1.5" style={{ color: '#475569' }}>Phone</label>
              <input className="input-dark" type="tel" placeholder="+91 9876543210" value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1.5" style={{ color: '#475569' }}>Password *</label>
              <div className="relative">
                <input
                  className="input-dark pr-10"
                  type={showPw ? 'text' : 'password'}
                  placeholder="Min 6 characters"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: '#94a3b8' }}
                  onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = '#16a34a')}
                  onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = '#94a3b8')}
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl font-bold text-white flex items-center justify-center gap-2 transition-all hover:scale-[1.02] disabled:opacity-50 mt-2"
              style={{
                background: loading ? '#86efac' : 'linear-gradient(135deg, #22c55e, #16a34a)',
                boxShadow: '0 6px 24px rgba(22,163,74,0.28)',
              }}
            >
              {loading
                ? <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                : <><ArrowRight className="w-4 h-4" /> Create Account</>
              }
            </button>
          </form>

          <p className="text-center text-sm mt-6" style={{ color: '#94a3b8' }}>
            Already have an account?{' '}
            <Link
              href="/auth/login"
              className="font-semibold transition-colors"
              style={{ color: '#16a34a' }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = '#15803d')}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = '#16a34a')}
            >
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center" style={{ background: 'white' }}>
          <div className="w-8 h-8 border-2 border-green-200 border-t-green-500 rounded-full animate-spin" />
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}

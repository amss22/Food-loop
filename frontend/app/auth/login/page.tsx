'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Leaf, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const { login, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });

  useEffect(() => {
    if (user) router.replace(`/dashboard/${user.role === 'receiver' ? 'ngo' : user.role}`);
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back! 👋');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Invalid credentials');
    } finally { setLoading(false); }
  };

  const demoLogin = async (role: string) => {
    const creds: Record<string, { email: string; password: string }> = {
      donor:     { email: 'donor@demo.com',     password: 'demo123' },
      receiver:  { email: 'ngo@demo.com',       password: 'demo123' },
      volunteer: { email: 'volunteer@demo.com', password: 'demo123' },
      admin:     { email: 'admin@demo.com',     password: 'demo123' },
    };
    setForm(creds[role]);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{
        background: 'radial-gradient(ellipse at 25% 30%, rgba(34,197,94,0.1) 0%, transparent 55%), radial-gradient(ellipse at 75% 70%, rgba(134,239,172,0.12) 0%, transparent 55%), #ffffff',
      }}
    >
      {/* Decorative blobs */}
      <div className="fixed top-0 left-0 w-80 h-80 rounded-full pointer-events-none" style={{ background: 'rgba(34,197,94,0.05)', filter: 'blur(60px)', transform: 'translate(-40%, -40%)' }} />
      <div className="fixed bottom-0 right-0 w-80 h-80 rounded-full pointer-events-none" style={{ background: 'rgba(134,239,172,0.07)', filter: 'blur(60px)', transform: 'translate(40%, 40%)' }} />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
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
          <h1 className="text-3xl font-black mb-2" style={{ color: '#0f172a' }}>Welcome Back</h1>
          <p className="text-sm" style={{ color: '#64748b' }}>Sign in to continue your impact</p>
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
          {/* Demo logins */}
          <div className="mb-6">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#94a3b8' }}>Quick Demo Login</p>
            <div className="grid grid-cols-2 gap-2">
              {['donor', 'receiver', 'volunteer', 'admin'].map(r => (
                <button
                  key={r}
                  type="button"
                  onClick={() => demoLogin(r)}
                  className="py-2 px-3 rounded-xl text-xs font-semibold capitalize transition-all"
                  style={{ border: '1.5px solid #e2e8f0', color: '#475569' }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = '#86efac';
                    (e.currentTarget as HTMLElement).style.background = 'rgba(34,197,94,0.05)';
                    (e.currentTarget as HTMLElement).style.color = '#16a34a';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = '#e2e8f0';
                    (e.currentTarget as HTMLElement).style.background = 'transparent';
                    (e.currentTarget as HTMLElement).style.color = '#475569';
                  }}
                >
                  {r === 'receiver' ? 'NGO' : r}
                </button>
              ))}
            </div>
          </div>

          <div className="divider-green mb-6" />

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold mb-1.5" style={{ color: '#475569' }}>Email</label>
              <input
                className="input-dark"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1.5" style={{ color: '#475569' }}>Password</label>
              <div className="relative">
                <input
                  className="input-dark pr-10"
                  type={showPw ? 'text' : 'password'}
                  placeholder="Your password"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  required
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
                : 'Sign In'
              }
            </button>
          </form>

          <p className="text-center text-sm mt-6" style={{ color: '#94a3b8' }}>
            New to FoodLoop?{' '}
            <Link href="/auth/register" className="font-semibold transition-colors" style={{ color: '#16a34a' }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = '#15803d')}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = '#16a34a')}
            >
              Create account
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

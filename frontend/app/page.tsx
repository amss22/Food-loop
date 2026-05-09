'use client';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Zap, Shield, Globe, Heart, Leaf, Users, TrendingUp, MapPin, Clock } from 'lucide-react';
import Navbar from '@/components/Navbar';
import StatsSection from '@/components/StatsSection';
import EmergencyBanner from '@/components/EmergencyBanner';
import { useEffect, useState } from 'react';

const LIVE_FEED = [
  { org: 'Green Harvest Hotel', item: '45kg Biryani', city: 'Mumbai', time: '2 min ago', emoji: '🍛' },
  { org: 'Sunrise Bakery', item: '80 Bread Loaves', city: 'Delhi', time: '5 min ago', emoji: '🍞' },
  { org: 'City Convention Hall', item: '200 Meal Portions', city: 'Bangalore', time: '8 min ago', emoji: '🍽️' },
  { org: 'Royal Caterers', item: '30kg Dal & Rice', city: 'Hyderabad', time: '12 min ago', emoji: '🥘' },
  { org: 'Fresh Farm Co.', item: '60kg Vegetables', city: 'Pune', time: '15 min ago', emoji: '🥦' },
  { org: 'Star Restaurant', item: '25kg Paneer Dishes', city: 'Chennai', time: '18 min ago', emoji: '🧀' },
];

const HOW_IT_WORKS = [
  { step: '01', icon: '📸', title: 'Donors Post Surplus', desc: 'Restaurants, hotels & bakeries upload leftover food with quantity, location, and expiry details in 60 seconds.' },
  { step: '02', icon: '🤖', title: 'AI Matches & Scores', desc: 'Our AI engine scores listings by urgency, distance, and demand — automatically connecting with the nearest verified receivers.' },
  { step: '03', icon: '🗺️', title: 'Route Optimized Pickup', desc: 'Volunteers get the fastest route. Real-time tracking ensures food arrives before expiry.' },
  { step: '04', icon: '✅', title: 'QR Verified Delivery', desc: 'Pickup is confirmed via QR scan. Both parties get impact stats: kg saved, meals provided, CO₂ offset.' },
];

const FEATURES = [
  { icon: Zap, title: 'AI Priority Matching', desc: 'Smart scoring engine matches food to the nearest receiver based on urgency, distance, and demand in real-time.', color: '#059669', bg: 'rgba(5,150,105,0.08)' },
  { icon: MapPin, title: 'Live Map & Routing', desc: 'OpenStreetMap integration with route optimization ensures the fastest pickup and delivery before food expires.', color: '#16a34a', bg: 'rgba(22,163,74,0.08)' },
  { icon: Shield, title: 'QR Pickup Verification', desc: 'Crypto-secured QR codes ensure verified, tamper-proof handoffs between donors and receivers.', color: '#0891b2', bg: 'rgba(8,145,178,0.08)' },
  { icon: Zap, title: 'Emergency Rescue Alerts', desc: 'Real-time emergency broadcast to all nearby volunteers when critical food needs immediate rescue.', color: '#dc2626', bg: 'rgba(220,38,38,0.08)' },
  { icon: Globe, title: 'Multilingual Support', desc: 'Platform available in English, Hindi, and more — bridging language barriers across communities.', color: '#7c3aed', bg: 'rgba(124,58,237,0.08)' },
  { icon: TrendingUp, title: 'AI Waste Prediction', desc: 'Machine learning analyzes donation patterns to predict and prevent food waste before it happens.', color: '#d97706', bg: 'rgba(217,119,6,0.08)' },
  { icon: Users, title: '4 Role Dashboards', desc: 'Separate tailored dashboards for Donors, NGOs, Volunteers, and Admins with role-specific analytics.', color: '#0284c7', bg: 'rgba(2,132,199,0.08)' },
  { icon: Heart, title: 'Impact Analytics', desc: 'Track kg saved, meals provided, CO₂ offset, and lives impacted — visualized in beautiful charts.', color: '#e11d48', bg: 'rgba(225,29,72,0.08)' },
];

export default function HomePage() {
  const [feedIndex, setFeedIndex] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const t = setInterval(() => setFeedIndex(i => (i + 1) % LIVE_FEED.length), 4000);
    return () => clearInterval(t);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-white">
      {/* ─── HERO SECTION ─── */}
      <section className="relative pt-12 pb-32 overflow-hidden bg-white">
        {/* Subtle Background Accent */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-green-50/20 skew-x-[-12deg] translate-x-1/4 pointer-events-none" />

        <div className="page-container relative z-10 flex flex-col items-center text-center max-w-4xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-7xl font-black tracking-tight text-slate-900 mb-8 leading-[1.1]"
          >
            Feed People, <br />
            <span className="text-green-500 italic font-serif">Not Landfills.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-lg md:text-xl text-slate-500 max-w-xl mb-12 font-medium leading-relaxed"
          >
            The minimalist AI platform for hyper-local food redistribution. Connecting surplus to need in seconds.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 mb-24"
          >
            <Link href="/auth/register" className="px-10 py-5 rounded-2xl bg-slate-900 text-white font-black text-xs uppercase tracking-widest transition-all hover:bg-slate-800 hover:scale-105 shadow-2xl shadow-slate-900/10">
              Get Started
            </Link>
            <Link href="/food" className="px-10 py-5 rounded-2xl bg-white border border-slate-200 text-slate-900 font-black text-xs uppercase tracking-widest transition-all hover:bg-slate-50 hover:scale-105 shadow-xl shadow-slate-900/5">
              Browse Food
            </Link>
          </motion.div>

          {/* Minimal Status Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg px-8 py-5 rounded-[2.5rem] glass shadow-2xl shadow-slate-900/5 flex items-center justify-between"
            style={{
               background: 'rgba(255, 255, 255, 0.7)',
               backdropFilter: 'blur(20px)',
               WebkitBackdropFilter: 'blur(20px)',
            }}
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-xl">
                 {LIVE_FEED[feedIndex].emoji}
              </div>
              <div className="text-left">
                 <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Live Rescue</p>
                 <p className="text-xs font-black text-slate-800">{LIVE_FEED[feedIndex].item}</p>
              </div>
            </div>
            <div className="text-right">
               <p className="text-[9px] font-black uppercase tracking-widest text-green-600">{LIVE_FEED[feedIndex].city}</p>
               <p className="text-[9px] font-bold text-slate-300 mt-0.5">{LIVE_FEED[feedIndex].time}</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── HOW IT WORKS (Minimal) ─── */}
      <section className="py-24 bg-white border-t border-slate-50">
        <div className="page-container text-center">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            {HOW_IT_WORKS.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex flex-col items-center"
              >
                <div className="text-3xl mb-6">{step.icon}</div>
                <h3 className="text-sm font-black mb-2 text-slate-900 uppercase tracking-widest">{step.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed font-medium max-w-[180px]">{step.desc.split('.')[0]}.</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── STATS ─── */}
      <StatsSection />

      {/* ─── FEATURES (Clean) ─── */}
      <section className="py-24 bg-[#fafafa]">
        <div className="page-container">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {FEATURES.slice(0, 3).map((feat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="p-12 rounded-[3rem] bg-white border border-slate-50 transition-all hover:shadow-2xl hover:shadow-slate-900/5 group"
              >
                <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center mb-8 group-hover:bg-green-50 transition-colors">
                  <feat.icon className="w-5 h-5 text-slate-400 group-hover:text-green-600 transition-colors" />
                </div>
                <h3 className="text-base font-black mb-4 text-slate-800">{feat.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed font-medium">{feat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── ROLE SELECTOR ─── */}
      <section className="py-24 bg-white">
        <div className="page-container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { role: 'Donor', title: 'For Businesses', icon: '🏨', desc: 'Redirect surplus food in seconds.', color: '#16a34a' },
              { role: 'Receiver', title: 'For NGOs', icon: '🏠', desc: 'Secure reliable sources for your community.', color: '#059669' },
              { role: 'Volunteer', title: 'For Volunteers', icon: '🚴', desc: 'Rescue food on the go.', color: '#0284c7' },
            ].map((path, i) => (
              <Link
                key={i}
                href={`/auth/register?role=${path.role.toLowerCase()}`}
                className="p-10 rounded-[3rem] text-center bg-[#fafafa] border border-slate-50 hover:bg-white hover:border-green-100 hover:shadow-2xl transition-all group"
              >
                <div className="text-5xl mb-8 group-hover:scale-110 transition-transform duration-500">{path.icon}</div>
                <h3 className="text-lg font-black mb-2 text-slate-800 uppercase tracking-widest">{path.title}</h3>
                <p className="text-[11px] text-slate-400 mb-8 font-medium">{path.desc}</p>
                <span className="text-[10px] font-black uppercase tracking-widest text-green-600 opacity-0 group-hover:opacity-100 transition-opacity">Join Now →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-24">
        <div className="page-container">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="py-24 px-10 rounded-[4rem] bg-slate-900 text-center relative overflow-hidden"
          >
            <div className="relative z-10 max-w-2xl mx-auto">
              <h2 className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tighter">Ready to join?</h2>
              <Link
                href="/auth/register"
                className="inline-flex items-center gap-3 px-10 py-4 rounded-2xl bg-white text-slate-900 font-black text-xs uppercase tracking-widest transition-all hover:scale-105"
              >
                Create Account <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="py-20 bg-white border-t border-slate-50">
        <div className="page-container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-10">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center">
                <Leaf className="w-4 h-4 text-green-400" />
              </div>
              <span className="font-black text-lg tracking-tight text-slate-900">FoodLoop</span>
            </Link>
            <p className="text-[11px] font-black uppercase tracking-widest text-slate-300">
              Sustainability through AI.
            </p>
            <div className="flex gap-8 text-[10px] font-black uppercase tracking-widest text-slate-400">
               <Link href="/about" className="hover:text-green-600 transition-colors">About</Link>
               <Link href="/food" className="hover:text-green-600 transition-colors">Browse</Link>
               <Link href="/auth/register" className="hover:text-green-600 transition-colors">Join</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

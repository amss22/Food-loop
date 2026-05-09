'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import EmergencyBanner from '@/components/EmergencyBanner';
import { Heart, Shield, Zap, Users, Globe, Leaf } from 'lucide-react';

export default function AboutPage() {
  const values = [
    { icon: Heart, title: 'Compassion First', desc: 'We believe food is a fundamental right, not a privilege.', color: '#ef4444' },
    { icon: Zap, title: 'AI-Driven Rescue', desc: 'Optimizing distribution with real-time urgency scoring.', color: '#22c55e' },
    { icon: Shield, title: 'Safe & Secure', desc: 'Strict hygiene protocols for all redistributed food.', color: '#0284c7' },
    { icon: Users, title: 'Community Built', desc: 'Powered by volunteers, donors, and NGOs worldwide.', color: '#7c3aed' },
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="page-container pb-24 pt-12">
        {/* Hero Section (Minimal) */}
        <div className="text-center max-w-4xl mx-auto mb-32">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center"
          >
            <h1 className="text-6xl md:text-8xl font-black mb-8 text-slate-900 tracking-tight leading-[1]">
              Waste <span className="text-green-500 italic font-serif">Less</span>. <br />
              Feed More.
            </h1>
            <p className="text-lg md:text-xl text-slate-500 leading-relaxed font-medium max-w-2xl">
              We're the AI logistics layer for global food redistribution.
            </p>
          </motion.div>
        </div>

        {/* Impact (Symmetrical) */}
        <div className="grid lg:grid-cols-2 gap-24 items-center mb-40">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            <h2 className="text-3xl font-black mb-8 text-slate-900">The Problem.</h2>
            <p className="text-slate-500 leading-relaxed font-medium mb-12">
              One-third of all food produced globally is wasted. At the same time, millions face food insecurity. We believe this is a logistics problem, not a resource one.
            </p>
            <div className="flex gap-12">
               <div>
                  <p className="text-4xl font-black text-slate-900 tracking-tight">33%</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-2">Wasted Globally</p>
               </div>
               <div>
                  <p className="text-4xl font-black text-green-500 tracking-tight">8%</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-2">CO₂ Impact</p>
               </div>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="aspect-square rounded-[5rem] bg-slate-50 flex items-center justify-center text-8xl grayscale opacity-20">
             🍎
          </motion.div>
        </div>

        {/* Values (Minimal Grid) */}
        <div className="mb-40">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
            {values.map((v, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-8">
                  <v.icon className="w-5 h-5 text-slate-400" />
                </div>
                <h3 className="text-sm font-black mb-3 text-slate-900 uppercase tracking-widest">{v.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed font-medium">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Final Join */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="rounded-[5rem] py-32 px-10 text-center bg-slate-900 text-white overflow-hidden relative"
        >
           <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
           <div className="relative z-10">
              <h2 className="text-4xl md:text-6xl font-black mb-12 tracking-tighter">Ready to rescue?</h2>
              <Link href="/auth/register" className="inline-flex px-10 py-5 rounded-2xl bg-white text-slate-900 font-black text-xs uppercase tracking-widest transition-all hover:scale-105">
                 Join the Movement
              </Link>
           </div>
        </motion.div>
      </div>
    </div>
  );
}

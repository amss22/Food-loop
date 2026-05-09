'use client';
import { useEffect, useRef, useState } from 'react';
import { motion, useInView, useMotionValue, useSpring } from 'framer-motion';

function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, { damping: 50, stiffness: 100 });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (inView) motionValue.set(target);
  }, [inView, target, motionValue]);

  useEffect(() => spring.on('change', v => setDisplay(Math.round(v))), [spring]);

  return <span ref={ref}>{display.toLocaleString()}{suffix}</span>;
}

const stats = [
  { value: 47200, suffix: '+', label: 'kg Food Saved', icon: '🌿', color: '#16a34a', bg: 'rgba(22,163,74,0.07)' },
  { value: 156000, suffix: '+', label: 'Meals Provided', icon: '🍽️', color: '#059669', bg: 'rgba(5,150,105,0.07)' },
  { value: 1240, suffix: '+', label: 'Active Donors', icon: '🏨', color: '#0284c7', bg: 'rgba(2,132,199,0.07)' },
  { value: 380, suffix: '+', label: 'NGO Partners', icon: '🤝', color: '#7c3aed', bg: 'rgba(124,58,237,0.07)' },
];

export default function StatsSection() {
  return (
    <section className="py-24 bg-white">
      <div className="page-container grid grid-cols-2 lg:grid-cols-4 gap-12">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="text-center"
          >
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-4">{stat.label}</p>
            <p className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter">
               <AnimatedCounter target={stat.value} suffix={stat.suffix} />
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

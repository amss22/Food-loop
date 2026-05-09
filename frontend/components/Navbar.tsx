'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/contexts/SocketContext';
import { Bell, Menu, X, Leaf, ChevronDown, LogOut, LayoutDashboard, User } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { unreadCount } = useSocket();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const { notifications, markRead, emergencyAlert } = useSocket();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const dashboardPath = user ? `/dashboard/${user.role === 'receiver' ? 'ngo' : user.role}` : '/auth/login';

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/food', label: 'Browse Food' },
    { href: '/map', label: 'Live Map' },
    { href: '/about', label: 'About' },
  ];

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`fixed left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'bg-white/70 backdrop-blur-[20px]' : 'bg-transparent'}`}
      style={{
        top: emergencyAlert ? '56px' : '0',
        borderBottom: scrolled ? '1px solid var(--border-light, rgba(226, 232, 240, 0.6))' : 'none',
        boxShadow: scrolled ? '0 10px 30px rgba(0, 0, 0, 0.02)' : 'none',
      }}
    >
      <div className="page-container">
        <div className="flex items-center justify-between h-18">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div
              className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center shadow-lg transition-transform group-hover:scale-105"
            >
              <Leaf className="w-5 h-5 text-green-400" />
            </div>
            <span className="font-black text-xl tracking-tighter text-slate-900 transition-colors duration-500">FoodLoop</span>
          </Link>

          {/* Nav Links */}
          <div className="hidden lg:flex items-center gap-12">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-[13px] font-black uppercase tracking-widest transition-colors ${pathname === link.href ? 'text-green-600' : 'text-slate-500 hover:text-green-600'}`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-6">

            {user ? (
               <div className="flex items-center gap-4">
                  <div className="relative">
                    <button
                      onClick={() => setNotifOpen(!notifOpen)}
                      className="p-2 rounded-xl text-slate-400 hover:text-green-600 transition-colors relative"
                    >
                      <Bell className="w-4 h-4" />
                      {unreadCount > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-green-500 rounded-full" />}
                    </button>
                    <AnimatePresence>
                      {notifOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute right-0 top-12 w-64 bg-white dark:bg-slate-800 rounded-2xl shadow-xl shadow-slate-900/10 border border-slate-100 dark:border-slate-700 py-3 origin-top-right transition-all"
                        >
                          <div className="px-5 py-3 border-b border-slate-100 mb-2">
                            <p className="text-sm font-black text-slate-900 truncate">{user.name}</p>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{user.role}</p>
                          </div>
                          <div className="flex items-center justify-between mb-4 px-5">
                             <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Notifications</span>
                             {unreadCount > 0 && <span className="text-[10px] font-black text-green-600 px-2 py-0.5 bg-green-50 rounded-full">{unreadCount} New</span>}
                          </div>
                          <div className="max-h-60 overflow-y-auto space-y-3 px-2">
                             {notifications.length === 0 ? (
                               <p className="text-center py-6 text-xs text-slate-400 font-medium">Nothing to report yet.</p>
                             ) : (
                               notifications.slice(0, 5).map((n, i) => (
                                 <div key={i} className="p-2 rounded-lg hover:bg-slate-50 transition-colors cursor-default">
                                    <p className="text-xs font-bold text-slate-800">{n.title}</p>
                                    <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">{n.message}</p>
                                 </div>
                               ))
                             )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="relative">
                    <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-[11px] font-black text-white">
                        {user.name[0]}
                      </div>
                    </button>
                    <AnimatePresence>
                      {dropdownOpen && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute right-0 top-12 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2">
                          <Link href={dashboardPath} onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-green-600 transition-colors">
                            <LayoutDashboard className="w-4 h-4" /> Dashboard
                          </Link>
                          <Link href="/profile" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-green-600 transition-colors">
                            <User className="w-4 h-4" /> Profile Settings
                          </Link>
                          <div className="h-px bg-slate-100 my-2 mx-5" />
                          <button onClick={logout} className="w-full flex items-center gap-3 px-5 py-2.5 text-sm font-bold text-red-500 hover:bg-red-50 transition-colors">
                            <LogOut className="w-4 h-4" /> Sign Out
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
               </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link href="/auth/login" className="text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-green-600 transition-colors px-2">
                  Login
                </Link>
                <Link
                  href="/auth/register"
                  className="px-6 py-3 rounded-xl bg-slate-900 text-white text-[11px] font-black uppercase tracking-widest transition-all hover:bg-slate-800 shadow-xl shadow-slate-900/10"
                >
                  Join
                </Link>
              </div>
            )}

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 text-slate-400"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white border-t border-slate-100"
          >
            <div className="flex flex-col py-4 px-6 gap-4">
              {navLinks.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`text-sm font-black uppercase tracking-widest ${pathname === link.href ? 'text-green-600' : 'text-slate-500'}`}
                >
                  {link.label}
                </Link>
              ))}
              {!user && (
                <>
                  <div className="h-px bg-slate-100 my-2" />
                  <Link
                    href="/auth/register"
                    onClick={() => setMobileOpen(false)}
                    className="mt-4 px-6 py-4 rounded-xl bg-slate-900 text-white text-[11px] font-black uppercase tracking-widest text-center"
                  >
                    Get Started Free
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

'use client';
import { motion } from 'framer-motion';
import { Clock, MapPin, Weight, Leaf, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

interface FoodCardProps {
  listing: {
    _id: string;
    title: string;
    foodType: string;
    quantity: number;
    unit: string;
    expiryAt: string;
    urgencyLevel: string;
    hoursLeft?: number;
    aiScore: number;
    location: { address: string; city: string };
    images?: string[];
    dietary?: { isVegetarian?: boolean; isVegan?: boolean; isHalal?: boolean };
    donor?: { name: string; organization?: string };
    isEmergency?: boolean;
  };
  onClick?: () => void;
}

const urgencyConfig: Record<string, { label: string; cls: string }> = {
  critical: { label: 'CRITICAL', cls: 'badge-critical' },
  high:     { label: 'URGENT',   cls: 'badge-high' },
  medium:   { label: 'MEDIUM',   cls: 'badge-medium' },
  low:      { label: 'LOW',      cls: 'badge-low' },
};

const foodTypeColors: Record<string, string> = {
  cooked: '#16a34a', raw: '#22c55e', packaged: '#0284c7',
  bakery: '#7c3aed', beverages: '#0891b2', fruits_vegetables: '#65a30d',
  dairy: '#d97706', other: '#64748b',
};

export default function FoodCard({ listing, onClick }: FoodCardProps) {
  const urgency = urgencyConfig[listing.urgencyLevel] || urgencyConfig.low;
  const hoursLeft = listing.hoursLeft ?? 0;
  const imgUrl = listing.images?.[0] ? `http://localhost:3001${listing.images[0]}` : null;

  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.22 }}
      className="card-hover rounded-2xl overflow-hidden cursor-pointer group bg-white border border-green-50 shadow-[0_2px_12px_rgba(22,163,74,0.06)]"
      onClick={onClick}
    >
      {/* Image */}
      <div className="relative h-40 overflow-hidden" style={{ background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)' }}>
        {imgUrl ? (
          <img src={imgUrl} alt={listing.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-400" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl">
            {listing.foodType === 'bakery' ? '🥐' : listing.foodType === 'cooked' ? '🍛' :
             listing.foodType === 'fruits_vegetables' ? '🥦' : listing.foodType === 'dairy' ? '🥛' : '🍽️'}
          </div>
        )}

        {/* Emergency Badge */}
        {listing.isEmergency && (
          <div className="absolute top-2 left-2 flex items-center gap-1 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
            <AlertTriangle className="w-3 h-3" /> EMERGENCY
          </div>
        )}

        {/* AI Score */}
        <div
          className="absolute top-2 right-2 text-xs font-bold px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md text-green-600 border border-green-500/20"
        >
          AI {listing.aiScore}
        </div>

        {/* Food Type Pill */}
        <div
          className="absolute bottom-2 left-2 text-xs px-2.5 py-1 rounded-full font-semibold text-white"
          style={{ background: foodTypeColors[listing.foodType] || '#64748b' }}
        >
          {listing.foodType.replace('_', ' ')}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-sm leading-tight line-clamp-2 text-slate-900">{listing.title}</h3>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${urgency.cls}`}>
            {urgency.label}
          </span>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Weight className="w-3 h-3 text-green-600" />
            <span>{listing.quantity} {listing.unit}</span>
            {listing.dietary?.isVegetarian && (
              <span className="flex items-center gap-0.5 text-green-600">
                <Leaf className="w-2.5 h-2.5" /> Veg
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Clock className="w-3 h-3 text-green-600" />
            <span className={hoursLeft <= 2 ? 'text-red-500 font-semibold' : ''}>
              {hoursLeft <= 0 ? 'Expired' : hoursLeft < 1 ? `${Math.round(hoursLeft * 60)}m left` : `${hoursLeft.toFixed(1)}h left`}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <MapPin className="w-3 h-3 text-green-600" />
            <span className="truncate">{listing.location?.city || listing.location?.address || 'Location TBD'}</span>
          </div>
        </div>

        {listing.donor && (
          <p className="text-xs truncate text-slate-400">
            By {listing.donor.organization || listing.donor.name}
          </p>
        )}

        <Link
          href={`/food/${listing._id}`}
          className="block w-full text-center py-2.5 rounded-xl text-xs font-bold text-white transition-all hover:scale-105"
          style={{
            background: 'linear-gradient(135deg, #22c55e, #16a34a)',
            boxShadow: '0 4px 14px rgba(22,163,74,0.2)',
          }}
          onClick={e => e.stopPropagation()}
        >
          View & Claim →
        </Link>
      </div>
    </motion.div>
  );
}

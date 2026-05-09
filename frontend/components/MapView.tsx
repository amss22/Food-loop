'use client';
import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Link from 'next/link';

// Fix Leaflet default icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const urgencyColors: Record<string, string> = {
  critical: '#dc2626', high: '#d97706', medium: '#059669', low: '#16a34a',
};

function createCustomIcon(urgencyLevel: string, isEmergency: boolean) {
  const color = isEmergency ? '#ef4444' : urgencyColors[urgencyLevel] || '#16a34a';
  const size = isEmergency ? 40 : 32;
  return L.divIcon({
    html: `<div style="width:${size}px;height:${size}px;background:${color};border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid white;box-shadow:0 4px 12px ${color}40;display:flex;align-items:center;justify-content:center;">
      <div style="transform:rotate(45deg);font-size:${isEmergency ? 18 : 14}px;">${isEmergency ? '🚨' : '🍽️'}</div>
    </div>`,
    className: '',
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
  });
}

interface MapViewProps {
  listings: any[];
  onSelect?: (listing: any) => void;
}

export default function MapView({ listings, onSelect }: MapViewProps) {
  const validListings = listings.filter(l => l.location?.coordinates?.length === 2);
  const center: [number, number] = validListings.length > 0
    ? [validListings[0].location.coordinates[1], validListings[0].location.coordinates[0]]
    : [28.6139, 77.2090];

  return (
    <MapContainer
      center={center}
      zoom={12}
      style={{ width: '100%', height: '100%', background: '#f8fdf9' }}
      className="rounded-2xl"
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://carto.com/">CARTO</a>'
      />
      {validListings.map(listing => {
        const [lng, lat] = listing.location.coordinates;
        return (
          <Marker
            key={listing._id}
            position={[lat, lng]}
            icon={createCustomIcon(listing.urgencyLevel, listing.isEmergency)}
            eventHandlers={{ click: () => onSelect?.(listing) }}
          >
            <Popup>
              <div style={{ background: 'white', color: '#0f172a', padding: '14px', borderRadius: '14px', minWidth: '200px', border: '1px solid #dcfce7', boxShadow: '0 8px 24px rgba(22,163,74,0.12)' }}>
                {listing.isEmergency && (
                  <div style={{ background: '#ef4444', color: 'white', borderRadius: '8px', padding: '4px 10px', fontSize: '11px', fontWeight: 'bold', marginBottom: '8px' }}>
                    🚨 EMERGENCY
                  </div>
                )}
                <p style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '4px', color: '#0f172a' }}>{listing.title}</p>
                <p style={{ fontSize: '12px', color: '#16a34a', marginBottom: '4px' }}>{listing.quantity} {listing.unit} • {listing.foodType}</p>
                <p style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '10px' }}>⏰ {(listing.hoursLeft || 0).toFixed(1)}h left • AI Score: {listing.aiScore}</p>
                <a href={`/food/${listing._id}`}
                  style={{ display: 'block', textAlign: 'center', background: 'linear-gradient(135deg, #22c55e, #16a34a)', color: 'white', padding: '7px 14px', borderRadius: '10px', fontSize: '12px', fontWeight: 'bold', textDecoration: 'none' }}>
                  View & Claim →
                </a>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}

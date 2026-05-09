'use client';
import { useSocket } from '@/contexts/SocketContext';
import Navbar from './Navbar';
import EmergencyBanner from './EmergencyBanner';
import AiChatbot from './AiChatbot';
import { usePathname } from 'next/navigation';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const { emergencyAlert } = useSocket();
  const pathname = usePathname();
  
  // Some pages might want to hide the global navbar/banner (e.g., auth pages)
  const isAuthPage = pathname.startsWith('/auth');
  
  const paddingTop = emergencyAlert ? '184px' : '128px';

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <EmergencyBanner />
      <Navbar />
      <main 
        className="flex-1 transition-all duration-500" 
        style={{ paddingTop: paddingTop }}
      >
        {children}
      </main>
      <AiChatbot />
    </div>
  );
}

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Toaster } from "react-hot-toast";
import LayoutWrapper from "@/components/LayoutWrapper";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "FoodLoop — AI-Powered Food Redistribution Platform",
  description: "Connect surplus food from restaurants, hotels & bakeries with nearby NGOs, shelters and volunteers to fight hunger and reduce food waste using AI-powered matching.",
  keywords: ["food donation", "food waste", "NGO", "hunger", "food redistribution", "AI", "sustainability"],
  openGraph: {
    title: "FoodLoop — Fight Hunger, Reduce Waste",
    description: "Smart AI-powered platform connecting food donors with receivers in real-time.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🍀</text></svg>" />
      </head>
      <body className={`${inter.variable} font-sans bg-white relative`}>
        {/* Subtle Background Grain/Mesh */}
        <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-[9999]" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/felt.png")' }} />
        <div className="fixed top-0 right-0 w-1/2 h-screen bg-green-50/10 -skew-x-12 translate-x-1/3 pointer-events-none" />
        
        <Providers>
          <LayoutWrapper>
            {children}
          </LayoutWrapper>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#ffffff',
                color: '#0f172a',
                border: '1px solid #bbf7d0',
                borderRadius: '14px',
                boxShadow: '0 8px 30px rgba(22, 163, 74, 0.12), 0 2px 8px rgba(0,0,0,0.06)',
                fontFamily: "'Inter', sans-serif",
                fontSize: '0.875rem',
                fontWeight: '500',
              },
              success: {
                iconTheme: { primary: '#16a34a', secondary: '#f0fdf4' },
              },
              error: {
                iconTheme: { primary: '#ef4444', secondary: '#fff' },
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}

import type { Metadata } from 'next';
import Hero from '@/components/sections/Hero';
import HowItWorksTimeline from '@/components/sections/HowItWorksTimeline';
import FAQ from '@/components/sections/FAQ';
import CTA from '@/components/sections/CTA';
import Navbar from '@/components/layout/Navbar';
import Pricings from '@/components/sections/Pricings';
import Footer from '@/components/layout/Footer';
import Testimonials from '@/components/sections/Testimonials';
import Feature2 from '@/components/sections/Feature2';
import { cn } from '@/lib/utils';
import { AuroraBackground } from '@/components/ui/AuroraBackground';
import { Spotlight } from '@/components/ui/spotlight-new';

export const metadata: Metadata = {
  title: 'EcoWeave - AI-Powered Textile Compliance Risk Platform',
  description: 'Predict high-risk discharge periods and turn compliance into profit-protecting decisions with forensic validation and financial risk translation.',
};

export default function HomePage() {
  return (
    <div className="relative min-h-screen bg-white max-w-8xl mx-auto overflow-hidden">
      {/* Dot Background */}
      <div
        className={cn(
          "absolute inset-0",
          "bg-[length:22px_22px]",
          "bg-[radial-gradient(#e5e5e5_1px,transparent_1px)]",
        )}
      />
      
      <div className="relative z-10">
    <Spotlight />
            
            <Navbar/>
            <Hero />
    
            
        
        <Feature2 />
        <HowItWorksTimeline />
        <Testimonials/>
        <Pricings />
        <FAQ />
        <CTA />
        <Footer/>
      </div>
    </div>
  );
}

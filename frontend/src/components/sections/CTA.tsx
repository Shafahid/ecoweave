'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Button from '@/components/ui/Button';
import RequestDemoModal from '@/components/layout/RequestDemoModal';

export default function CTA() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <section id="contact" className="py-20 px-6 scroll-mt-28">
        <div className="max-w-5xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-[#004737]/20">
            {/* Background Image */}
            <div className="absolute inset-0">
              <Image
                src="/green_abstract_bg.jpg"
                alt="Green Abstract Background"
                fill
                className="object-cover"
                priority
              />
            </div>
            
            {/* Overlay for better text readability */}
            <div className="absolute inset-0 bg-[#004737]/60"></div>
            
            {/* Radial gradient overlay for visual focus */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#003a2e]/60 via-transparent to-transparent"></div>
            
            {/* Content */}
            <div className="relative z-10 px-12 py-16 text-center">
              <h2 className="text-4xl md:text-5xl font-bold mb-5 text-white/90  tracking-tight leading-tighter">
                We're making analytics<br />easy for everyone.
              </h2>
              
              <p className="text-lg text-white/90 mb-10 max-w-2xl mx-auto font-light leading-relaxed">
                Take control of your data like never before. Join the fight.
              </p>
              
              <div className="flex flex-wrap gap-4 justify-center items-center">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="px-6 py-2 bg-white text-[#004737] rounded-full font-semibold text-lg hover:bg-white/95 hover:shadow-xl hover:shadow-white/20 hover:scale-105 transition-all duration-300 border-2 border-transparent"
                >
                  Get started for free
                </button>
                <button
                  className="px-6 py-2 bg-transparent text-white rounded-full font-semibold text-lg border-2 border-white/30 hover:bg-white/10 hover:border-white/50 hover:shadow-lg transition-all duration-300 backdrop-blur-sm"
                >
                  <a href="mailto:info@ecoweave.ai" className="block">Talk to sales</a>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <RequestDemoModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}

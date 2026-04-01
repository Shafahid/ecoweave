'use client';

import React, { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { AuroraBackground } from '@/components/ui/AuroraBackground';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
    },
  },
};

const imageVariants: Variants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 1,
      delay: 0.3,
    },
  },
};

export default function Hero1() {
  const TOKEN_KEY = 'ecoweave_token';
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const syncAuth = () => {
      setIsAuthenticated(!!localStorage.getItem(TOKEN_KEY));
      setAuthChecked(true);
    };

    syncAuth();
    window.addEventListener('storage', syncAuth);
    window.addEventListener('focus', syncAuth);

    return () => {
      window.removeEventListener('storage', syncAuth);
      window.removeEventListener('focus', syncAuth);
    };
  }, []);

  return (
    <div className="relative mt-20 w-full overflow-hidden md:mt-16">
      <section className="relative z-10 mx-auto max-w-full">
       
         
          <div className="z-10 mx-auto max-w-7xl px-4 pt-20 pb-8 text-gray-700 sm:pt-24 sm:pb-10 md:px-8 md:pt-28 md:pb-12">
            <motion.div
              className="mx-auto max-w-3xl space-y-4 text-center sm:space-y-5 lg:leading-5"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
            >
              <motion.h1
                variants={itemVariants}
                className="font-geist group mx-auto inline-flex w-fit items-center rounded-3xl border-2 border-green-200 bg-white px-4 py-1.5 text-xs tracking-wide font-medium text-[#047857] transition-all duration-300 hover:border-green-300 hover:shadow-lg sm:px-5 sm:py-2 sm:text-sm"
              >
                Textile Compliance Monitoring
                <ArrowRight className="ml-2 inline h-4 w-4 duration-300 group-hover:translate-x-1" />
              </motion.h1>

              <motion.h2
                variants={itemVariants}
                className="font-geist mx-auto text-3xl leading-tight tracking-tighter font-bold text-[#047857] sm:text-4xl md:text-6xl"
              >
                Prevent ETP Bypass with{' '}
                
                <span className="text-[#004737]">
                  AI-Powered Risk Scoring
                </span>
              </motion.h2>

              <motion.p
                variants={itemVariants}
                className="mx-auto max-w-2xl text-base leading-relaxed text-gray-600 sm:text-lg"
              >
                Real-time compliance monitoring using data triangulation and multi-factor validation to detect wastewater treatment bypasses before they happen. Protect your facility from fines, shutdowns, and export contract loss.
              </motion.p>
              <motion.div
                variants={itemVariants}
                className="items-center justify-center space-y-3 gap-x-3 sm:flex sm:space-y-0"
              >
                {authChecked && (
                  <motion.a
                    href={isAuthenticated ? "/dashboard" : "/signup"}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="group border-input inline-flex w-full items-center justify-center rounded-xl border bg-[#262626] px-6 py-3.5 text-center text-base text-white transition-all duration-300 hover:bg-green-800 hover:shadow-xl sm:w-auto sm:px-10 sm:py-4"
                  >
                    {isAuthenticated ? "Go to Dashboard" : "Get Started"}
                  </motion.a>
                )}
              </motion.div>
            </motion.div>
          </div>
        

        <div className="z-10 mx-auto max-w-7xl px-4 pb-10 md:px-8 md:pb-16">
          <motion.div
            className="relative mx-0 mt-12 sm:mx-4 md:mx-10 md:mt-20"
            variants={imageVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-2 -top-10 h-40 rounded-[2rem] bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.35),rgba(16,185,129,0.15)_40%,rgba(255,255,255,0)_78%)] blur-2xl sm:inset-x-8 sm:-top-14 sm:h-56 md:inset-x-12 md:-top-16 md:h-64 md:rounded-[3rem]"
            />
            <Image
              src="/dashboard.png"
              width={1600}
              height={1000}
              className="relative w-full rounded-lg border shadow-lg transition-shadow duration-300 hover:shadow-2xl"
              alt="EcoWeave Dashboard showing real-time compliance monitoring and risk analysis"
            />
          </motion.div>
        </div>
      </section>
    </div>
  );
}

'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { navbarItems } from '@/lib/navbar';
import RequestDemoModal from './RequestDemoModal';
import Button from '../ui/Button';

export default function Navbar() {
  const TOKEN_KEY = 'ecoweave_token';
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const pathname = usePathname();

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

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  return (
    <>
      <nav className="fixed top-3 right-3 left-3 z-50 mx-auto max-w-7xl rounded-xl border border-white/10 bg-[#262626]/95 px-2 py-1.5 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-[#262626]/90 lg:right-0 lg:left-0 lg:w-full">
        <div className='mx-auto flex w-full items-center justify-between py-0.5 px-1'>
          {/* Logo Section */}
          <Link href="/" className='flex items-center gap-2'>
            <Image 
              src="/logo/logo4.png" 
              alt="EcoWeave Logo" 
              width={34}
              height={34}
              className='rounded-lg'
            />
            <h1 className="text-xl font-bold text-white sm:text-2xl">EcoWeave</h1>
          </Link>

          {/* Desktop Navigation */}
          <div className='hidden lg:flex items-center gap-8'>
            {navbarItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`text-lg font-light  transition-colors duration-200 ${
                    isActive ? 'text-white' : 'text-white/80 hover:text-white'
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </div>

          {/* Right Side - Desktop */}
          <div className='hidden lg:flex items-center gap-1'>
            {authChecked && !isAuthenticated && (
              <>
                <Link href="/signin">
                  <Button variant='primary' className='text-white/80 hover:text-white text-lg font-medium flex items-center gap-1 cursor-pointer rounded-lg bg-transparent border-white/80 hover:border-white transition-all duration-300'>
                    Sign In
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button
                    variant='primary'
                    className="text-white hover:text-white text-lg font-medium flex items-center gap-1 cursor-pointer hover:bg-green-900 rounded-lg border-white/80 hover:border-white transition-all duration-300 bg-[#004737] "
                  >
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
            {authChecked && isAuthenticated && (
              <Link href="/dashboard">
                <Button
                  variant='primary'
                  className="text-white text-lg font-medium flex items-center gap-1 cursor-pointer rounded-lg border-white/80 transition-all duration-300 bg-[#004737] hover:bg-green-900"
                >
                  Dashboard
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className='rounded-lg p-2 text-white transition-colors hover:bg-white/10 lg:hidden'
            aria-label='Toggle menu'
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className='absolute top-full right-0 left-0 mt-2 overflow-hidden rounded-xl border border-white/10 bg-[#004737] shadow-2xl lg:hidden'
            >
              <div className='flex flex-col px-6 py-4 gap-3'>
                {navbarItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`py-2 text-sm font-medium uppercase tracking-wide transition-colors duration-200 ${
                        isActive ? 'text-white' : 'text-white/80 hover:text-white'
                      }`}
                    >
                      {item.name}
                    </Link>
                  );
                })}
                <div className='flex flex-col gap-2 pt-3 border-t border-white/10'>
                  {authChecked && !isAuthenticated && (
                    <>
                      <Link href="/signin">
                        <button className="bg-white text-[#004737] px-6 py-3 rounded-full font-bold text-sm uppercase hover:bg-gray-100 transition-all duration-300 w-full">
                          Sign In
                        </button>
                      </Link>
                      <Link href="/signup">
                        <button className="bg-[#004737] text-white px-6 py-3 rounded-full font-bold text-sm uppercase hover:bg-[#004737]/90 transition-all duration-300 w-full">
                          Sign Up
                        </button>
                      </Link>
                    </>
                  )}
                  {authChecked && isAuthenticated && (
                    <Link href="/dashboard">
                      <button className="bg-white text-[#004737] px-6 py-3 rounded-full font-bold text-sm uppercase hover:bg-gray-100 transition-all duration-300 w-full">
                        Dashboard
                      </button>
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Request Demo Modal */}
      <RequestDemoModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  );
}

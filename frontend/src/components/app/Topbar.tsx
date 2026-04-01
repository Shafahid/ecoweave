'use client';

import { Upload, RotateCcw, User, LogOut, Settings, Bell, FileText, Home } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

interface TopbarProps {
  onUploadClick?: () => void;
  onResetClick?: () => void;
}

export default function Topbar({ onUploadClick, onResetClick }: TopbarProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();
  const displayName = user?.full_name || 'User';
  const displayEmail = user?.email || '';
  const firstName = displayName.split(' ')[0];

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isDropdownOpen]);

  const handleLogout = () => {
    setIsDropdownOpen(false);
    logout();
  };

  return (
    <header className="flex items-center px-3 md:px-6 bg-[#F7F7F7] rounded-2xl gap-3 md:gap-6 h-16 justify-between">
      <div className="ml-12 lg:ml-0">
        <h1 className="text-lg md:text-2xl font-medium tracking-tight">Welcome Back,<span className="ml-2 font-bold text-[#004737]">{firstName}!</span></h1>
    
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        {onUploadClick && (
          <Button
            variant="outline"
            onClick={onUploadClick}
            className="hidden sm:flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            <span className="hidden md:inline">Upload Data</span>
            <span className="md:hidden">Upload</span>
          </Button>
        )}
        
        {onResetClick && (
          <Button
            variant="outline"
            onClick={onResetClick}
            className="hidden sm:flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden md:inline">Reset Demo</span>
            <span className="md:hidden">Reset</span>
          </Button>
        )}

        {/* User Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-full px-2 md:px-3 py-1.5"
            aria-label="User menu"
          >
            <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <span className="hidden sm:inline text-sm font-medium">{displayName}</span>
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-lg shadow-lg py-1 z-50">
              <div className="px-4 py-3 border-b border-border">
                <p className="text-sm font-medium">{displayName}</p>
                <p className="text-xs text-foreground/60">{displayEmail}</p>
              </div>

              <div className="py-1">
                <Link
                  href="/dashboard"
                  onClick={() => setIsDropdownOpen(false)}
                  className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-accent transition-colors"
                >
                  <Home className="w-4 h-4" />
                  Dashboard
                </Link>

                <Link
                  href="/batches"
                  onClick={() => setIsDropdownOpen(false)}
                  className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-accent transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  Batches
                </Link>

                <Link
                  href="/alerts"
                  onClick={() => setIsDropdownOpen(false)}
                  className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-accent transition-colors"
                >
                  <Bell className="w-4 h-4" />
                  Alerts
                </Link>

                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    // Navigate to profile page
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-accent transition-colors text-left"
                >
                  <User className="w-4 h-4" />
                  Profile
                </button>

                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    // Navigate to settings page
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-accent transition-colors text-left"
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </button>
              </div>

              <div className="border-t border-border py-1">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

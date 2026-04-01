'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  AlertTriangle, 
  FileText, 
  Settings,
  Database,
  Upload,
  HelpCircle,
  LogOutIcon,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import Button from '../ui/Button';
import Image from 'next/image';
import { useAuth } from '@/lib/auth-context';
import { checkBackendHealth } from '@/lib/api';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/data-upload', label: 'Data Upload', icon: Upload },
  { href: '/batches', label: 'Batches', icon: Database },
  { href: '/alerts', label: 'Alerts', icon: AlertTriangle },
  { href: '/reports', label: 'Reports', icon: FileText },
  { href: '/settings', label: 'Settings', icon: Settings },
  { href: '/help', label: 'Help', icon: HelpCircle },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { logout } = useAuth();
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);

  useEffect(() => {
    const check = async () => {
      const alive = await checkBackendHealth();
      setBackendOnline(alive);
    };
    check();
    const interval = setInterval(check, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleNavClick = () => {
    if (onClose) {
      onClose();
    }
  };

  const handleLogout = () => {
    if (onClose) onClose();
    logout();
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:relative
        top-0 left-0 h-screen
        bg-white flex flex-col p-4 gap-4
        transition-all duration-300 ease-in-out
        z-50
        ${isCollapsed ? 'w-20' : 'w-64'}
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
      <div className='bg-[#F7F7F7] rounded-2xl flex flex-col gap-6 h-full justify-between'>
        {/* Close button for mobile */}
        <button
          onClick={onClose}
          className="lg:hidden absolute top-6 right-6 p-2 hover:bg-gray-200 rounded-lg transition-colors"
          aria-label="Close menu"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Logo */}
      <div className="p-6 flex items-center gap-2 justify-between">
        <Link href="/" className={`flex items-center gap-1 ${isCollapsed ? 'justify-center' : ''}`} onClick={handleNavClick}>
          <Image src="/logo/logo3.png" alt="EcoWeave Logo" width={50} height={40} className="rounded-full" />
          {!isCollapsed && (
            <div>
              <h2 className="font-bold text-2xl tracking-tight bg-gradient-to-r from-[#004737] to-black bg-clip-text text-transparent">EcoWeave</h2>
            </div>
          )}
        </Link>
        
        {/* Collapse Button - Hidden on Mobile */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="ml-10 hidden lg:flex p-2 hover:bg-gray-200 rounded-lg transition-colors"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className={`flex-1 bg-[#F7F7F7] rounded-xl mt-3 overflow-y-auto ${isCollapsed ? 'px-2' : 'px-6'}`}>
        {!isCollapsed && <h3 className='text-[#acacac]'>Menu</h3>}
        <ul className={`space-y-2 ${isCollapsed ? 'mt-2' : 'mt-3'}`}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={handleNavClick}
                  title={isCollapsed ? item.label : undefined}
                  className={`flex items-center gap-3 transition-all ${
                    isCollapsed ? 'justify-center px-3 py-3' : 'px-4 py-3'
                  } ${
                    isActive
                      ? 'text-[#004737] font-bold text-lg tracking-tight bg-green-500/10 rounded-lg'
                      : 'text-foreground/60 hover:text-foreground'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : ''} ${isCollapsed ? 'flex-shrink-0' : ''}`} />
                  {!isCollapsed && (
                    <span className={`text-left flex-1 ${isActive ? 'font-bold' : 'font-normal'}`}>{item.label}</span>
                  )}
                </Link>
              </li>
            );
          })}
          <li>
            <button
              onClick={handleLogout}
              title={isCollapsed ? 'Logout' : undefined}
              className={`flex items-center gap-3 w-full transition-all text-foreground/60 hover:text-red-600 ${
                isCollapsed ? 'justify-center px-3 py-3' : 'px-4 py-3'
              }`}
            >
              <LogOutIcon className={`w-5 h-5 ${isCollapsed ? 'flex-shrink-0' : ''}`} />
              {!isCollapsed && <span className="text-left flex-1 font-normal">Logout</span>}
            </button>
          </li>
        </ul>
      </nav>

      {/* Footer */}
      {!isCollapsed && (
        <div className="p-4 rounded-xl space-y-3">
          <div className="flex items-center gap-2 px-3">
            <span className={`w-2 h-2 rounded-full ${backendOnline === null ? 'bg-gray-400' : backendOnline ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-xs text-foreground/60">
              {backendOnline === null ? 'Checking...' : backendOnline ? 'Backend Online' : 'Backend Offline'}
            </span>
          </div>
          <div className='p-3 bg-gradient-to-tr from-green-800 to-green-300 rounded-lg flex flex-col'>
            <div className="text-xs text-foreground/60 text-start">
            <p className='text-xl font-bold text-gray-800'>Get Premium</p>
            <p className="mt-1 text-md">Unlimited Features and Stats</p>
          </div>
          <Button variant="primary" className="mt-4 bg-[#004737] text-white hover:bg-white/90 rounded-full items-center justify-center flex">
            Upgrade Now
          </Button>
          </div>
        </div>
      )}
      </div>
    </aside>
    </>
  );
}

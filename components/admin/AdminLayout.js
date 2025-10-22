'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ChartBarIcon, FilmIcon, PlayCircleIcon, FolderIcon, PhotoIcon } from '@heroicons/react/24/outline';
import { usePathname } from 'next/navigation';
import { useAdmin } from '../../contexts/AdminContext';
import SessionTimer from './SessionTimer';
import '../../styles/admin.css';

const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const closeBtnRef = useRef(null);
  const menuBtnRef = useRef(null);
  const sidebarRef = useRef(null);
  const { user, logout } = useAdmin();
  const pathname = usePathname();

  const navigation = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: ChartBarIcon },
  { name: 'Hero Sections', href: '/admin/hero-sections', icon: FilmIcon },
  { name: 'Showreels', href: '/admin/showreels', icon: PlayCircleIcon },
  { name: 'Projects', href: '/admin/projects', icon: FolderIcon },
  { name: 'Media Library', href: '/admin/media', icon: PhotoIcon },
  ];

  // Removed settingsNavigation - using Forgot Password on login page instead

  const isActive = (href) => pathname === href;

  // Handle logout with loading state
  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      console.log('🔐 Logout button clicked');
      await logout();
      // Don't reset loading state - redirect will happen automatically
      console.log('✅ Logout initiated, redirect will happen automatically');
    } catch (error) {
      console.error('❌ Logout error in handleLogout:', error);
      // Reset loading state on error
      setIsLoggingOut(false);
    }
  };

  // Focus management and keyboard trap for mobile sidebar
  useEffect(() => {
    if (sidebarOpen && closeBtnRef.current) {
      closeBtnRef.current.focus();
    }
    const handleKeyDown = (e) => {
      if (!sidebarOpen) return;
      if (e.key === 'Escape') {
        setSidebarOpen(false);
        if (menuBtnRef.current) menuBtnRef.current.focus();
      }
      if (e.key === 'Tab') {
        // Trap focus within sidebar
        const focusable = sidebarRef.current ? sidebarRef.current.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])') : [];
        const focusableEls = Array.prototype.slice.call(focusable);
        if (focusableEls.length === 0) return;
        const first = focusableEls[0];
        const last = focusableEls[focusableEls.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };
    if (sidebarOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [sidebarOpen]);

  const handleSidebarClose = useCallback(() => {
    setSidebarOpen(false);
    if (menuBtnRef.current) menuBtnRef.current.focus();
  }, []);

  return (
    <div
      className="h-screen flex overflow-hidden admin-root"
    >
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'block' : 'hidden'} fixed inset-0 flex z-40 md:hidden`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={handleSidebarClose} tabIndex={-1} aria-hidden="true" />
        <div
          className="relative flex-1 flex flex-col max-w-xs w-full bg-gray-800"
          ref={sidebarRef}
          aria-modal="true"
          role="dialog"
        >
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={handleSidebarClose}
              aria-label="Close sidebar menu"
              title="Close sidebar menu"
              ref={closeBtnRef}
            >
              <span className="text-white" aria-hidden="true">✕</span>
            </button>
          </div>
          <SidebarContent navigation={navigation} isActive={isActive} admin={user} isLoggingOut={isLoggingOut} handleLogout={handleLogout} />
        </div>
      </div>

      {/* Static sidebar for desktop - Floating & Translucent */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-96 p-4">
          <div className="flex flex-col flex-1 rounded-2xl backdrop-blur-lg bg-gray-900/40 border border-white/10 shadow-2xl">
            <SidebarContent navigation={navigation} isActive={isActive} admin={user} isLoggingOut={isLoggingOut} handleLogout={handleLogout} />
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        {/* Page content - Transparent */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="sticky top-0 z-30">
            {/* Mobile menu button in floating header */}
            <div className="md:hidden relative z-10 flex-shrink-0 flex h-16 backdrop-blur-md bg-white/10 border-b border-white/10 shadow-lg">
              <button
                type="button"
                className="px-4 border-r border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open sidebar menu"
                title="Open sidebar menu"
                ref={menuBtnRef}
              >
                <span className="text-lg" aria-hidden="true">☰</span>
              </button>
            </div>
          </div>
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

const SidebarContent = ({ navigation, isActive, admin, isLoggingOut, handleLogout }) => {
  return (
    <>
      <div className="flex items-center justify-center flex-shrink-0 px-4 py-4">
        <h2 className="limelight-regular font-bold tracking-wide" style={{ fontSize: '30px', color: '#ffffff' }}>ADONS</h2>
      </div>
      <div className="mt-5 flex-1 flex flex-col overflow-y-auto">
        <nav className="flex-1 px-2 pb-4 space-y-1">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`${
                isActive(item.href)
                  ? 'bg-white/20 backdrop-blur-md text-white border border-white/30'
                  : 'text-gray-300 border border-transparent hover:bg-white/15 hover:backdrop-blur-md hover:border-white/20 hover:text-white'
              } group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
            >
              <item.icon className="mr-3 h-5 w-5 text-white" aria-hidden="true" />
              {item.name}
            </Link>
          ))}
        </nav>
      </div>

      {/* Session Card at Bottom */}
      <div className="flex-shrink-0 px-2 pb-4 border-t border-gray-700 pt-4">
        <div className="bg-white/5 backdrop-blur-xl border border-white/30 rounded-lg p-4 space-y-3 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Welcome <span style={{ color: '#ffd700' }}>ADONS Team</span></p>
              <p className="text-xs text-gray-400 truncate">{admin?.email}</p>
            </div>
          </div>
          <div className="flex justify-between items-center gap-2">
            <SessionTimer />
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="flex-1 backdrop-blur-md bg-white/20 text-white px-3 py-2 rounded-md text-xs font-medium hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed border border-white/20"
            >
              {isLoggingOut ? (
                <>
                  <span className="inline-block animate-spin mr-1">⏳</span>
                  Signing out...
                </>
              ) : (
                'Logout'
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminLayout;
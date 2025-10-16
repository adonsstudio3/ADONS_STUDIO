'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ChartBarIcon, FilmIcon, PlayCircleIcon, FolderIcon, PhotoIcon, KeyIcon } from '@heroicons/react/24/outline';
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
  const { admin, logout } = useAdmin();
  const pathname = usePathname();

  const navigation = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: ChartBarIcon },
  { name: 'Hero Sections', href: '/admin/hero-sections', icon: FilmIcon },
  { name: 'Showreels', href: '/admin/showreels', icon: PlayCircleIcon },
  { name: 'Projects', href: '/admin/projects', icon: FolderIcon },
  { name: 'Media Library', href: '/admin/media', icon: PhotoIcon },
  ];

  const settingsNavigation = [
  { name: 'Change Password', href: '/admin/change-password', icon: KeyIcon },
  ];

  const isActive = (href) => pathname === href;

  // Handle logout with loading state
  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      console.log('🔐 Logout button clicked');
      const result = await logout();
      
      if (result?.error) {
        console.error('Logout returned error:', result.error);
        // Wait a bit longer for error case before giving up
        setTimeout(() => {
          setIsLoggingOut(false);
        }, 2000);
      } else {
        console.log('✅ Logout function completed, waiting for redirect...');
        // Don't reset loading state - let the redirect happen
        // The onAuthStateChange listener will handle the redirect
      }
    } catch (error) {
      console.error('❌ Logout error in handleLogout:', error);
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
          <SidebarContent navigation={navigation} settingsNavigation={settingsNavigation} isActive={isActive} />
        </div>
      </div>

      {/* Static sidebar for desktop */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col h-0 flex-1 bg-gray-800">
            <SidebarContent navigation={navigation} settingsNavigation={settingsNavigation} isActive={isActive} />
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        {/* Top header */}
        <div className="relative z-10 flex-shrink-0 flex h-16 bg-white shadow">
          <button
            type="button"
            className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 md:hidden"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar menu"
            title="Open sidebar menu"
            ref={menuBtnRef}
          >
            <span className="text-lg" aria-hidden="true">☰</span>
          </button>

          <div className="flex-1 px-4 flex justify-between items-center">
            <div className="flex flex-1 justify-end items-center space-x-4">
              <SessionTimer />
              <span className="text-sm text-gray-700">
                Welcome, {admin?.username || admin?.email}
              </span>
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="bg-gray-800 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
              >
                {isLoggingOut ? (
                  <>
                    <span className="inline-block animate-spin mr-2">⏳</span>
                    Signing out...
                  </>
                ) : (
                  'Logout'
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none bg-gray-50">
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

const SidebarContent = ({ navigation, settingsNavigation, isActive }) => {
  return (
    <>
      <div className="flex items-center flex-shrink-0 px-4 py-4">
        <h2 className="text-xl font-bold text-white tracking-wide">ADONS Studio</h2>
      </div>
      <div className="mt-5 flex-1 flex flex-col overflow-y-auto">
        <nav className="flex-1 px-2 pb-4 space-y-1">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`${
                isActive(item.href)
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              } group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-200`}
            >
              <item.icon className="mr-3 h-5 w-5 text-white" aria-hidden="true" />
              {item.name}
            </Link>
          ))}
          
          {/* Settings section */}
          <div className="pt-4 mt-4 border-t border-gray-700">
            <p className="px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Settings
            </p>
            <div className="mt-2 space-y-1">
              {settingsNavigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`${
                    isActive(item.href)
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  } group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-200`}
                >
                  <item.icon className="mr-3 h-5 w-5 text-white" aria-hidden="true" />
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        </nav>
      </div>
    </>
  );
};

export default AdminLayout;
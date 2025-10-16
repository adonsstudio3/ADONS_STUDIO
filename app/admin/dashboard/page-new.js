'use client';

import React, { useState, useEffect } from 'react';
import { useAdmin } from '../../../contexts/AdminContext';
import AdminProtectedRoute from '../../../components/admin/AdminProtectedRoute';
import AdminLayout from '../../../components/admin/AdminLayout';

// Import components for each section
import DashboardOverview from '../../../components/admin/DashboardOverview';
import HeroSectionManager from '../../../components/admin/HeroSectionManager';
import ShowreelManager from '../../../components/admin/ShowreelManager';
import ProjectManager from '../../../components/admin/ProjectManager';
import MediaLibrary from '../../../components/admin/MediaLibrary';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const { isAuthenticated, logActivity } = useAdmin();

  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: '📊' },
    { id: 'hero', name: 'Hero Sections', icon: '🎬' },
    { id: 'showreels', name: 'Showreels', icon: '🎥' },
    { id: 'projects', name: 'Projects', icon: '📁' },
    { id: 'media', name: 'Media Library', icon: '🖼️' }
  ];

  // Log tab navigation
  useEffect(() => {
    logActivity('navigate', 'admin_tab', null, { tab: activeTab });
  }, [activeTab]);

  if (!isAuthenticated) {
    return null; // AdminProtectedRoute will handle redirect
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardOverview />;
      case 'hero':
        return <HeroSectionManager />;
      case 'showreels':
        return <ShowreelManager />;
      case 'projects':
        return <ProjectManager />;
      case 'media':
        return <MediaLibrary />;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <AdminProtectedRoute>
      <AdminLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-white shadow-sm border-b border-gray-200">
            <div className="px-6 py-4">
              <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
              <p className="mt-2 text-gray-600">Manage your content and media</p>
            </div>
            
            {/* Modern Tab Navigation */}
            <div className="px-6">
              <nav className="flex space-x-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`${
                      activeTab === tab.id
                        ? 'bg-blue-50 border-blue-500 text-blue-600 shadow-sm'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                    } whitespace-nowrap py-3 px-4 border-b-2 font-medium text-sm transition-all duration-200 flex items-center space-x-2 rounded-t-lg`}
                  >
                    <span>{tab.icon}</span>
                    <span>{tab.name}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Tab Content */}
          <div className="px-6">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading...</p>
                </div>
              </div>
            ) : (
              renderTabContent()
            )}
          </div>
        </div>
      </AdminLayout>
    </AdminProtectedRoute>
  );
}
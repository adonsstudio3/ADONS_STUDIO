'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAdmin } from '../../contexts/AdminContext';
import { useRealtimeActivityLogs } from '../../hooks/useRealtimeActivityLogs';
import { FilmIcon, PlayCircleIcon, FolderIcon, PhotoIcon, PlusIcon, PencilIcon, TrashIcon, KeyIcon, EyeIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

export default function DashboardOverview() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { logActivity, apiCall } = useAdmin();
  const router = useRouter();
  const hasLoadedRef = useRef(false); // Track if we've already loaded data

  // Use realtime hook for activity logs - no more manual fetching!
  const { logs: recentActivity, loading: logsLoading, error: logsError } = useRealtimeActivityLogs(10);

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(''); // Clear any previous errors
      
      console.log('📊 Loading dashboard stats...');
      const data = await apiCall('/api/admin/dashboard/stats');
      console.log('✅ Dashboard stats received:', data);
      
      setStats(data.stats);
      // Activity logs now come from realtime hook - no need to set them here
    } catch (error) {
      console.error('❌ Dashboard loading error:', error);
      // Provide more user-friendly error messages
      if (error.message.includes('backendUrl')) {
        setError('Configuration error: Backend URL not properly configured. Please check your environment variables.');
      } else if (error.message.includes('Failed to fetch') || error.message.includes('Network')) {
        setError('Unable to connect to the backend server. Please ensure the backend is running or try refreshing the page.');
      } else if (error.message.includes('Session expired')) {
        setError('Your session has expired. Please login again.');
      } else {
        setError(`Dashboard loading failed: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  // Load dashboard data only once on mount - prevent remounts from reloading
  // This prevents loading state when switching browser tabs
  useEffect(() => {
    if (!hasLoadedRef.current) {
      console.log('🚀 First mount - loading dashboard data');
      hasLoadedRef.current = true;
      loadDashboardData();
    }
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error loading dashboard</h3>
            <p className="mt-1 text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white overflow-hidden shadow-sm border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                  <FilmIcon className="h-5 w-5 text-white" aria-hidden="true" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Hero Sections</dt>
                  <dd className="text-2xl font-bold text-gray-900">{stats?.hero_sections?.total || 0}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-sm border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                  <PlayCircleIcon className="h-5 w-5 text-white" aria-hidden="true" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Showreels</dt>
                  <dd className="text-2xl font-bold text-gray-900">{stats?.showreels?.total || 0}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-sm border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                  <FolderIcon className="h-5 w-5 text-white" aria-hidden="true" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Projects</dt>
                  <dd className="text-2xl font-bold text-gray-900">{stats?.projects?.total || 0}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-sm border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-orange-500 rounded-md flex items-center justify-center">
                  <PhotoIcon className="h-5 w-5 text-white" aria-hidden="true" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Media Files</dt>
                  <dd className="text-2xl font-bold text-gray-900">{stats?.media_files?.total || 0}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
        </div>
        <div className="p-6">
          {recentActivity && recentActivity.length > 0 ? (
            <div className="flow-root">
              <ul className="-mb-8">
                {recentActivity.map((activity, activityIdx) => (
                  <li key={activity.id}>
                    <div className="relative pb-8">
                      {activityIdx !== recentActivity.length - 1 ? (
                        <span
                          className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                          aria-hidden="true"
                        />
                      ) : null}
                      <div className="relative flex space-x-3">
                        <div>
                          <span className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center ring-8 ring-white">
                            {activity.action === 'create' && <PlusIcon className="h-5 w-5 text-white" aria-hidden="true" />}
                            {activity.action === 'update' && <PencilIcon className="h-5 w-5 text-white" aria-hidden="true" />}
                            {activity.action === 'delete' && <TrashIcon className="h-5 w-5 text-white" aria-hidden="true" />}
                            {activity.action === 'login' && <KeyIcon className="h-5 w-5 text-white" aria-hidden="true" />}
                            {activity.action === 'view' && <EyeIcon className="h-5 w-5 text-white" aria-hidden="true" />}
                            {activity.action === 'upload' && <ArrowUpTrayIcon className="h-5 w-5 text-white" aria-hidden="true" />}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                          <div>
                            <p className="text-sm text-gray-900">
                              {(() => {
                                const action = activity.action;
                                let actionText = '';
                                switch(action) {
                                  case 'create': actionText = 'Created'; break;
                                  case 'update': actionText = 'Updated'; break;
                                  case 'delete': actionText = 'Deleted'; break;
                                  case 'upload': actionText = 'Uploaded'; break;
                                  case 'login': actionText = 'Logged in'; break;
                                  case 'view': actionText = 'Viewed'; break;
                                  default: actionText = action.charAt(0).toUpperCase() + action.slice(1) + 'ed';
                                }
                                return actionText;
                              })()} {' '}
                              <span className="font-medium">{activity.entity_type}</span>
                              {activity.entity_id && <span className="text-gray-500"> (ID: {activity.entity_id})</span>}
                            </p>
                            {activity.details && (
                              <p className="text-xs text-gray-500 mt-1">
                                {typeof activity.details === 'string' ? activity.details : JSON.stringify(activity.details)}
                              </p>
                            )}
                          </div>
                          <div className="text-right text-sm whitespace-nowrap text-gray-500">
                            {(() => {
                              if (!activity.created_at) return 'Just now';
                              const d = new Date(activity.created_at);
                              if (isNaN(d.getTime())) return 'Recent';
                              const day = String(d.getDate()).padStart(2, '0');
                              const month = String(d.getMonth() + 1).padStart(2, '0');
                              const year = d.getFullYear();
                              let hours = d.getHours();
                              const minutes = String(d.getMinutes()).padStart(2, '0');
                              const seconds = String(d.getSeconds()).padStart(2, '0');
                              const ampm = hours >= 12 ? 'PM' : 'AM';
                              hours = hours % 12;
                              hours = hours ? hours : 12;
                              return `${day}/${month}/${year}, ${hours}:${minutes}:${seconds} ${ampm}`;
                            })()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-12 h-12 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-gray-400 text-2xl">📋</span>
              </div>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No recent activity</h3>
              <p className="mt-1 text-sm text-gray-500">Start managing your content to see activity here.</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={() => router.push('/admin/hero-sections')}
              className="relative group bg-blue-50 p-6 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <div>
                <span className="text-blue-600 text-2xl">🎬</span>
                <div className="mt-2">
                  <h3 className="text-sm font-medium text-gray-900">Manage Hero Sections</h3>
                  <p className="text-sm text-gray-500">Add or edit hero content</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => router.push('/admin/showreels')}
              className="relative group bg-purple-50 p-6 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-purple-500 rounded-lg hover:bg-purple-100 transition-colors"
            >
              <div>
                <span className="text-purple-600 text-2xl">🎥</span>
                <div className="mt-2">
                  <h3 className="text-sm font-medium text-gray-900">Manage Showreels</h3>
                  <p className="text-sm text-gray-500">Add YouTube showreels</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => router.push('/admin/projects')}
              className="relative group bg-green-50 p-6 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-green-500 rounded-lg hover:bg-green-100 transition-colors"
            >
              <div>
                <span className="text-green-600 text-2xl">📁</span>
                <div className="mt-2">
                  <h3 className="text-sm font-medium text-gray-900">Manage Projects</h3>
                  <p className="text-sm text-gray-500">Add project cards</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => router.push('/admin/media')}
              className="relative group bg-orange-50 p-6 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-orange-500 rounded-lg hover:bg-orange-100 transition-colors"
            >
              <div>
                <span className="text-orange-600 text-2xl">🖼️</span>
                <div className="mt-2">
                  <h3 className="text-sm font-medium text-gray-900">Media Library</h3>
                  <p className="text-sm text-gray-500">Manage files</p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
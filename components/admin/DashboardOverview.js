'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAdmin } from '../../contexts/AdminContext';
import { useRealtimeActivityLogs } from '../../hooks/useRealtimeActivityLogs';
import { FilmIcon, PlayCircleIcon, FolderIcon, PhotoIcon, PlusIcon, PencilIcon, TrashIcon, KeyIcon, EyeIcon, ArrowUpTrayIcon, ClipboardDocumentIcon } from '@heroicons/react/24/outline';
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
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white font-medium drop-shadow-lg">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="backdrop-blur-md bg-red-500/20 border border-red-300/30 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-200" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-white drop-shadow">Error loading dashboard</h3>
            <p className="mt-1 text-sm text-white/90 drop-shadow">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="backdrop-blur-md bg-white/10 overflow-hidden shadow-lg border border-white/20 rounded-xl hover:bg-white/15 transition-all">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-blue-500/80 rounded-lg flex items-center justify-center backdrop-blur-sm">
                  <FilmIcon className="h-6 w-6 text-white" aria-hidden="true" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-white/80 truncate drop-shadow">Hero Sections</dt>
                  <dd className="text-3xl font-bold text-white drop-shadow-lg">{stats?.hero_sections?.total || 0}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="backdrop-blur-md bg-white/10 overflow-hidden shadow-lg border border-white/20 rounded-xl hover:bg-white/15 transition-all">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-purple-500/80 rounded-lg flex items-center justify-center backdrop-blur-sm">
                  <PlayCircleIcon className="h-6 w-6 text-white" aria-hidden="true" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-white/80 truncate drop-shadow">Showreels</dt>
                  <dd className="text-3xl font-bold text-white drop-shadow-lg">{stats?.showreels?.total || 0}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="backdrop-blur-md bg-white/10 overflow-hidden shadow-lg border border-white/20 rounded-xl hover:bg-white/15 transition-all">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-green-500/80 rounded-lg flex items-center justify-center backdrop-blur-sm">
                  <FolderIcon className="h-6 w-6 text-white" aria-hidden="true" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-white/80 truncate drop-shadow">Projects</dt>
                  <dd className="text-3xl font-bold text-white drop-shadow-lg">{stats?.projects?.total || 0}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="backdrop-blur-md bg-white/10 overflow-hidden shadow-lg border border-white/20 rounded-xl hover:bg-white/15 transition-all">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-orange-500/80 rounded-lg flex items-center justify-center backdrop-blur-sm">
                  <PhotoIcon className="h-6 w-6 text-white" aria-hidden="true" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-white/80 truncate drop-shadow">Media Files</dt>
                  <dd className="text-3xl font-bold text-white drop-shadow-lg">{stats?.media_files?.total || 0}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="backdrop-blur-md bg-white/10 shadow-lg border border-white/20 rounded-xl">
        <div className="px-6 py-4 border-b border-white/20">
          <h3 className="text-lg font-medium text-white drop-shadow-lg">Recent Activity</h3>
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
                          className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-white/20"
                          aria-hidden="true"
                        />
                      ) : null}
                      <div className="relative flex space-x-3">
                        <div>
                          <span className="h-8 w-8 rounded-full bg-blue-500/80 backdrop-blur-sm flex items-center justify-center ring-8 ring-white/10">
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
                            <p className="text-sm text-white drop-shadow">
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
                              {activity.entity_id && <span className="text-white/60"> (ID: {activity.entity_id})</span>}
                            </p>
                            {activity.details && (
                              <p className="text-xs text-white/70 mt-1 drop-shadow">
                                {typeof activity.details === 'string' ? activity.details : JSON.stringify(activity.details)}
                              </p>
                            )}
                          </div>
                          <div className="text-right text-sm whitespace-nowrap text-white/70 drop-shadow">
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
              <div className="w-12 h-12 mx-auto bg-white/10 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm">
                <ClipboardDocumentIcon className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <h3 className="mt-2 text-sm font-medium text-white drop-shadow">No recent activity</h3>
              <p className="mt-1 text-sm text-white/70 drop-shadow">Start managing your content to see activity here.</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="backdrop-blur-md bg-white/10 shadow-lg border border-white/20 rounded-xl">
        <div className="px-6 py-4 border-b border-white/20">
          <h3 className="text-lg font-medium text-white drop-shadow-lg">Quick Actions</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={() => router.push('/admin/hero-sections')}
              className="relative group backdrop-blur-sm bg-blue-500/20 p-6 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-400 rounded-xl hover:bg-blue-500/30 transition-all border border-blue-400/30"
            >
              <div>
                <FilmIcon className="h-8 w-8 text-white drop-shadow-lg mb-2" aria-hidden="true" />
                <div className="mt-2">
                  <h3 className="text-sm font-medium text-white drop-shadow">Manage Hero Sections</h3>
                  <p className="text-sm text-white/80 drop-shadow">Add or edit hero content</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => router.push('/admin/showreels')}
              className="relative group backdrop-blur-sm bg-purple-500/20 p-6 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-purple-400 rounded-xl hover:bg-purple-500/30 transition-all border border-purple-400/30"
            >
              <div>
                <PlayCircleIcon className="h-8 w-8 text-white drop-shadow-lg mb-2" aria-hidden="true" />
                <div className="mt-2">
                  <h3 className="text-sm font-medium text-white drop-shadow">Manage Showreels</h3>
                  <p className="text-sm text-white/80 drop-shadow">Add YouTube showreels</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => router.push('/admin/projects')}
              className="relative group backdrop-blur-sm bg-green-500/20 p-6 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-green-400 rounded-xl hover:bg-green-500/30 transition-all border border-green-400/30"
            >
              <div>
                <FolderIcon className="h-8 w-8 text-white drop-shadow-lg mb-2" aria-hidden="true" />
                <div className="mt-2">
                  <h3 className="text-sm font-medium text-white drop-shadow">Manage Projects</h3>
                  <p className="text-sm text-white/80 drop-shadow">Add project cards</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => router.push('/admin/media')}
              className="relative group backdrop-blur-sm bg-orange-500/20 p-6 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-orange-400 rounded-xl hover:bg-orange-500/30 transition-all border border-orange-400/30"
            >
              <div>
                <PhotoIcon className="h-8 w-8 text-white drop-shadow-lg mb-2" aria-hidden="true" />
                <div className="mt-2">
                  <h3 className="text-sm font-medium text-white drop-shadow">Media Library</h3>
                  <p className="text-sm text-white/80 drop-shadow">Manage files</p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
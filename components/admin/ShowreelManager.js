'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAdmin } from '../../contexts/AdminContext';
import { useRouter } from 'next/navigation';
import { PlayCircleIcon } from '@heroicons/react/24/outline';

export default function ShowreelManager() {
  const [showreels, setShowreels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingShowreel, setEditingShowreel] = useState(null);
  const { apiCall, logActivity, forceRefresh } = useAdmin();
  const router = useRouter();
  const hasLoadedRef = useRef(false); // Track if we've already loaded data

  const [formData, setFormData] = useState({
    video_url: ''
  });

  const loadShowreels = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Loading showreels...');
      const response = await apiCall('/api/admin/showreels');
      console.log('Showreels API response:', response);
      
      // Handle both old and new response formats
      const showreelsData = response.showreels || response.data?.showreels || response.data || [];
      setShowreels(Array.isArray(showreelsData) ? showreelsData : []);
      setError('');
      console.log('Showreels loaded successfully:', showreelsData.length, 'items');
    } catch (error) {
      console.error('Showreels loading error:', error);
      setError(`Failed to load showreels: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  // Load showreels only once on mount - prevent remounts from reloading
  // This prevents loading state when switching between admin tabs
  useEffect(() => {
    if (!hasLoadedRef.current) {
      console.log('🚀 First mount - loading showreels');
      hasLoadedRef.current = true;
      loadShowreels();
    }
  }, []);

  const extractYouTubeId = (url) => {
    if (!url || typeof url !== 'string') return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.video_url || !formData.video_url.trim()) {
      setError('Video URL is required');
      return;
    }
    
    try {
      setError('');
      console.log('Attempting to create showreel with data:', formData);
      
      if (editingShowreel) {
        // Server expects PUT to /api/admin/showreels with JSON body containing id + update fields
        const updatePayload = { id: editingShowreel.id, ...formData };
        const updateResp = await apiCall(`/api/admin/showreels`, {
          method: 'PUT',
          body: JSON.stringify(updatePayload),
          headers: { 'Content-Type': 'application/json' }
        });
        // Try to get the id from multiple possible response shapes
        const updatedId = updateResp?.id || updateResp?.data?.id || editingShowreel.id;
        logActivity('update', 'showreels', updatedId, { video_url: formData.video_url });
        // Refresh server-side data (so public site shows the update)
        try { router.refresh(); } catch (e) { console.warn('router.refresh failed', e); }
      } else {
        // Enhanced API call with bulletproof error handling
        console.log('Making API call to create showreel...', formData);
        const response = await apiCall('/api/admin/showreels', {
          method: 'POST',
          body: JSON.stringify(formData),
          headers: {
            'Content-Type': 'application/json'
          }
        });
        console.log('Showreel creation successful:', response);

        // Normalize created id from various possible response shapes
        const createdId = response?.id || response?.data?.id || null;

        // Try to log activity but don't fail if it doesn't work
        try {
          logActivity('create', 'showreels', createdId, { video_url: formData.video_url });
        } catch (activityError) {
          console.warn('Activity logging failed (non-critical):', activityError);
        }

        // Refresh server-side data so the public site reflects the new showreel immediately
        try { router.refresh(); } catch (e) { console.warn('router.refresh failed', e); }
      }
      
      setShowModal(false);
      setEditingShowreel(null);
      setFormData({
        video_url: ''
      });
      await loadShowreels();
    } catch (error) {
      console.error('Detailed showreel creation error:', {
        error: error,
        message: error.message,
        stack: error.stack,
        formData: formData
      });
      setError(`Failed to create showreel: ${error.message}`);
    }
  };

  const handleEdit = (showreel) => {
    if (!showreel) {
      setError('Invalid showreel data');
      return;
    }
    setEditingShowreel(showreel);
    setFormData({
      video_url: showreel.video_url || ''
    });
    setError('');
    setShowModal(true);
  };

  const handleDelete = async (showreel) => {
    if (!window.confirm('Are you sure you want to delete this showreel?')) return;
    
    try {
      // DELETE endpoint expects id query parameter
      await apiCall(`/api/admin/showreels?id=${showreel.id}`, {
        method: 'DELETE'
      });
      logActivity('delete', 'showreels', showreel.id, { video_url: showreel.video_url || '' });
      
      // Immediately update the local state to remove the deleted item
      setShowreels(prev => prev.filter(item => item.id !== showreel.id));
      
      // Refresh server-side data and reload admin list
      try { router.refresh(); } catch (e) { console.warn('router.refresh failed', e); }
      // Small delay before reloading to ensure database consistency
      setTimeout(() => loadShowreels(), 500);
    } catch (error) {
      setError(error.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white font-medium drop-shadow-lg">Loading showreels...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-white drop-shadow-lg">Showreels</h1>
          <p className="mt-2 text-sm text-white/90 drop-shadow">Manage your YouTube showreel collection</p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none space-x-2">
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center justify-center rounded-md backdrop-blur-sm bg-purple-500/30 border border-purple-400/30 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-purple-500/40 focus:outline-none focus:ring-2 focus:ring-purple-400 drop-shadow-lg"
          >
            Add Showreel
          </button>
        </div>
      </div>

      {error && (
        <div className="backdrop-blur-md bg-red-500/20 border border-red-400/30 rounded-lg p-4">
          <div className="text-white drop-shadow-lg">{error}</div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {showreels.map((showreel) => {
          if (!showreel || !showreel.id) return null;
          
          const videoUrl = showreel.video_url || '';
          const youtubeId = extractYouTubeId(videoUrl);
          const thumbnailUrl = youtubeId ? `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg` : '';

          return (
            <div key={showreel.id} className="bg-white overflow-hidden shadow-sm border border-gray-200 rounded-lg">
              <div className="relative">
                <img 
                  src={thumbnailUrl || '/images/video-placeholder.jpg'} 
                  alt="Showreel thumbnail"
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    e.target.src = '/images/video-placeholder.jpg';
                  }}
                />
                <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <a
                    href={videoUrl || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-red-600 text-white px-4 py-2 rounded-md flex items-center space-x-2 hover:bg-red-700 transition-colors"
                    onClick={!videoUrl ? (e) => e.preventDefault() : undefined}
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                    <span>Watch</span>
                  </a>
                </div>
              </div>
              
              <div className="p-6">
                <div className="mb-4">
                  <p className="text-sm text-gray-600 truncate">
                    <span className="font-medium">URL:</span> {videoUrl || 'No URL provided'}
                  </p>
                </div>
                
                <div className="text-xs text-gray-500 mb-4">
                  <span>Added: {new Date(showreel.created_at).toLocaleDateString()}</span>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(showreel)}
                    className="flex-1 bg-purple-50 text-purple-600 px-3 py-2 rounded-md text-sm font-medium hover:bg-purple-100 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(showreel)}
                    className="flex-1 bg-red-50 text-red-600 px-3 py-2 rounded-md text-sm font-medium hover:bg-red-100 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {showreels.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="w-12 h-12 mx-auto backdrop-blur-sm bg-white/10 rounded-full flex items-center justify-center mb-4 border border-white/20">
            <PlayCircleIcon className="h-6 w-6 text-white drop-shadow-lg" aria-hidden="true" />
          </div>
          <h3 className="mt-2 text-sm font-medium text-white drop-shadow-lg">No showreels</h3>
          <p className="mt-1 text-sm text-white/80 drop-shadow">Get started by adding a new showreel.</p>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                {editingShowreel ? 'Edit Showreel' : 'Add Showreel'}
              </h3>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded text-sm">
                  {error}
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">YouTube URL *</label>
                <input
                  type="url"
                  required
                  value={formData.video_url}
                  onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingShowreel(null);
                    setFormData({
                      video_url: ''
                    });
                    setError('');
                  }}
                  className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-purple-700 transition-colors"
                >
                  {editingShowreel ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

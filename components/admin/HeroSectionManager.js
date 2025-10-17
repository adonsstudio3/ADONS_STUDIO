'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAdmin } from '../../contexts/AdminContext';
import { FilmIcon } from '@heroicons/react/24/outline';

export default function HeroSectionManager() {
  const [heroSections, setHeroSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingHero, setEditingHero] = useState(null);
  const { apiCall, logActivity, forceRefresh } = useAdmin();
  const hasLoadedRef = useRef(false); // Track if data has been loaded

  const [formData, setFormData] = useState({
    title: '',
    media_file: null,
    media_preview: null,
    media_type: null,
    is_active: true
  });

  const [uploading, setUploading] = useState(false);

  const loadHeroSections = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiCall('/api/admin/hero-sections');
      setHeroSections(data.hero_sections || []);
    } catch (error) {
      console.error('Hero sections loading error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  // Load hero sections only once on mount - prevent reload on remounts
  // This prevents loading state when switching between admin tabs
  useEffect(() => {
    if (!hasLoadedRef.current) {
      console.log('🚀 First mount - loading hero sections');
      hasLoadedRef.current = true;
      loadHeroSections();
    }
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      const validVideoTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/mov'];
      
      if (![...validImageTypes, ...validVideoTypes].includes(file.type)) {
        setError('Please select a valid image or video file');
        return;
      }
      
      // Check file size (max 50MB)
      if (file.size > 50 * 1024 * 1024) {
        setError('File size must be less than 50MB');
        return;
      }
      
      // Determine media type
      const mediaType = validImageTypes.includes(file.type) ? 'image' : 'video';
      
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      
      setFormData({
        ...formData,
        media_file: file,
        media_preview: previewUrl,
        media_type: mediaType
      });
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }
    
    if (!editingHero && !formData.media_file) {
      setError('Please select a media file');
      return;
    }
    
    try {
      setUploading(true);
      
      let backgroundValue = editingHero?.background_value || '';
      
      // If there's a new media file, upload it first
      if (formData.media_file) {
        console.log('🔄 Starting media upload...', {
          fileName: formData.media_file.name,
          fileSize: formData.media_file.size,
          fileType: formData.media_file.type,
          mediaType: formData.media_type
        });
        
        const mediaFormData = new FormData();
        mediaFormData.append('file', formData.media_file);
        mediaFormData.append('category', 'hero');
        mediaFormData.append('alt_text', formData.title);
        
        try {
          const mediaResponse = await apiCall('/api/admin/media', {
            method: 'POST',
            body: mediaFormData
          });
          
          console.log('📤 Media upload response:', mediaResponse);
          
          backgroundValue = mediaResponse.url;
          
          if (!backgroundValue) {
            console.error('❌ No URL in media response:', mediaResponse);
            throw new Error('Failed to get media URL from upload response');
          }
          
          console.log('✅ Media upload successful, URL:', backgroundValue);
        } catch (uploadError) {
          console.error('❌ Media upload error:', uploadError);
          console.error('❌ Upload error details:', {
            message: uploadError.message,
            stack: uploadError.stack
          });
          throw new Error(`Failed to upload media: ${uploadError.message}`);
        }
      }
      
      // Prepare hero section data
      const heroData = {
        title: formData.title.trim(),
        background_type: formData.media_type || 'image',
        background_value: backgroundValue,
        is_active: formData.is_active
      };
      
      console.log('🎯 Preparing hero section data:', heroData);
      
      if (editingHero) {
        // Update existing hero section
        console.log('🔄 Updating existing hero section:', editingHero.id);
        const updatePayload = { id: editingHero.id, ...heroData };
        console.log('📝 Update payload:', updatePayload);
        
        const updateResponse = await apiCall('/api/admin/hero-sections', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatePayload)
        });
        
        console.log('✅ Hero section update response:', updateResponse);
        logActivity('update', 'hero_sections', editingHero.id, { title: formData.title });
      } else {
        // Create new hero section
        console.log('➕ Creating new hero section');
        console.log('📝 Create payload:', heroData);
        
        const createResponse = await apiCall('/api/admin/hero-sections', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(heroData)
        });
        
        console.log('✅ Hero section create response:', createResponse);
        logActivity('create', 'hero_sections', null, { title: formData.title });
      }
      
      // Reset form and close modal
      setFormData({
        title: '',
        media_file: null,
        media_preview: null,
        media_type: null,
        is_active: true
      });
      setShowModal(false);
      setEditingHero(null);
      loadHeroSections();
    } catch (error) {
      console.error('Hero section submission error:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        formData: {
          title: formData.title,
          hasFile: !!formData.media_file,
          mediaType: formData.media_type,
          isActive: formData.is_active
        }
      });
      setError(error.message || 'Failed to save hero section');
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (hero) => {
    setEditingHero(hero);
    setFormData({
      title: hero.title || '',
      media_file: null,
      media_preview: hero.media_url || null,
      media_type: hero.media_type || null,
      is_active: hero.is_active !== undefined ? hero.is_active : true
    });
    setShowModal(true);
  };

  const handleDelete = async (hero) => {
    if (!confirm('Are you sure you want to delete this hero section?')) return;
    
    try {
      await apiCall(`/api/admin/hero-sections?id=${hero.id}`, {
        method: 'DELETE'
      });
      logActivity('delete', 'hero_sections', hero.id, { title: hero.title });
      
      // Immediately update the local state to remove the deleted item
      setHeroSections(prev => prev.filter(item => item.id !== hero.id));
      
      // Small delay before reloading to ensure database consistency
      setTimeout(() => loadHeroSections(), 500);
    } catch (error) {
      setError(error.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white font-medium drop-shadow-lg">Loading hero sections...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto"></div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none space-x-2">
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center justify-center rounded-md backdrop-blur-sm bg-blue-500/30 border border-blue-400/30 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-500/40 focus:outline-none focus:ring-2 focus:ring-blue-400 drop-shadow-lg"
          >
            Add Hero Section
          </button>
        </div>
      </div>

      {error && (
        <div className="backdrop-blur-md bg-red-500/20 border border-red-400/30 rounded-lg p-4">
          <div className="text-white drop-shadow-lg">{error}</div>
        </div>
      )}

      {/* Hero Sections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {heroSections.map((hero) => (
          <div key={hero.id} className="bg-white overflow-hidden shadow-sm border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">{hero.title}</h3>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                hero.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {hero.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>

            <div className="text-xs text-gray-500 mb-4">
              <div>Type: {hero.media_type}</div>
              <div>{new Date(hero.created_at).toLocaleDateString()}</div>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => handleEdit(hero)}
                className="flex-1 bg-blue-50 text-blue-600 px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-100 transition-colors"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(hero)}
                className="flex-1 bg-red-50 text-red-600 px-3 py-2 rounded-md text-sm font-medium hover:bg-red-100 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {heroSections.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="w-12 h-12 mx-auto backdrop-blur-sm bg-white/10 rounded-full flex items-center justify-center mb-4 border border-white/20">
            <FilmIcon className="h-6 w-6 text-white drop-shadow-lg" aria-hidden="true" />
          </div>
          <h3 className="mt-2 text-sm font-medium text-white drop-shadow-lg">No hero sections</h3>
          <p className="mt-1 text-sm text-white/80 drop-shadow">Get started by creating a new hero section.</p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                {editingHero ? 'Edit Hero Section' : 'Add Hero Section'}
              </h3>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter hero section title"
                />
              </div>
              
              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Image or Video {!editingHero && '*'}
                </label>
                <input
                  id="file-upload"
                  name="file-upload"
                  type="file"
                  className="sr-only"
                  accept="image/*,video/*"
                  onChange={handleFileChange}
                />
                <label 
                  htmlFor="file-upload"
                  className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-blue-400 transition-colors cursor-pointer"
                >
                  <div className="space-y-1 text-center">
                    {formData.media_preview ? (
                      <div className="mb-4">
                        {formData.media_type === 'video' ? (
                          <video src={formData.media_preview} className="mx-auto h-32 w-auto rounded" controls />
                        ) : (
                          <img src={formData.media_preview} alt="Preview" className="mx-auto h-32 w-auto rounded" />
                        )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setFormData({
                              ...formData,
                              media_file: null,
                              media_preview: null,
                              media_type: null
                            });
                          }}
                          className="mt-2 text-sm text-red-600 hover:text-red-500"
                        >
                          Remove file
                        </button>
                      </div>
                    ) : (
                      <>
                        <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                          <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <div className="flex text-sm text-gray-600">
                          <span className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                            <span>Upload a file</span>
                          </span>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">
                          Images: PNG, JPG, GIF up to 50MB<br />
                          Videos: MP4, WebM, OGG up to 50MB
                        </p>
                      </>
                    )}
                  </div>
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                  Active (Show on homepage)
                </label>
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingHero(null);
                    setFormData({
                      title: '',
                      media_file: null,
                      media_preview: null,
                      media_type: null,
                      is_active: true
                    });
                    setError('');
                  }}
                  className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors"
                  disabled={uploading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {uploading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {editingHero ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    editingHero ? 'Update' : 'Create'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
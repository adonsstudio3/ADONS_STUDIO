'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAdmin } from '../../contexts/AdminContext';

export default function MediaLibrary() {
  const [mediaFiles, setMediaFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingMedia, setEditingMedia] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const { apiCall, logActivity } = useAdmin();
  const hasLoadedRef = useRef(false); // Track if we've already loaded data on mount
  const isInitialFilterChange = useRef(true); // Track first filter change

  const [formData, setFormData] = useState({
    filename: '',
    file_url: '',
    file_type: 'image',
    file_size: '',
    category: 'general',
    alt_text: ''
  });

  // Load media files on mount, then on actual filter changes
  useEffect(() => {
    if (!hasLoadedRef.current) {
      // First load: only on component mount
      console.log('📚 Loading media library on mount');
      loadMediaFiles();
      hasLoadedRef.current = true;
    } else if (!isInitialFilterChange.current) {
      // Subsequent loads: only when filters actually change (after first mount)
      console.log('🔄 Reloading media due to filter change');
      loadMediaFiles();
    }
    isInitialFilterChange.current = false; // Mark that initial filter state is set
  }, [filterType, filterCategory]);

  const loadMediaFiles = async () => {
    try {
      setLoading(true);
      let url = '/api/admin/media';
      const params = new URLSearchParams();
      if (filterType !== 'all') params.append('type', filterType);
      if (filterCategory !== 'all') params.append('category', filterCategory);
      if (params.toString()) url += `?${params.toString()}`;
      
      const data = await apiCall(url);
      setMediaFiles(data.media || []);
    } catch (error) {
      console.error('Media loading error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = {
        ...formData,
        file_size: formData.file_size ? parseInt(formData.file_size) : null
      };

      if (editingMedia) {
        await apiCall(`/api/admin/media/${editingMedia.id}`, {
          method: 'PUT',
          body: JSON.stringify(submitData)
        });
        logActivity('update', 'media_files', editingMedia.id, { filename: formData.filename });
      } else {
        await apiCall('/api/admin/media', {
          method: 'POST',
          body: JSON.stringify(submitData)
        });
        logActivity('upload', 'media_files', null, { filename: formData.filename });
      }
      
      setShowModal(false);
      setEditingMedia(null);
      setFormData({
        filename: '',
        file_url: '',
        file_type: 'image',
        file_size: '',
        category: 'general',
        alt_text: ''
      });
      loadMediaFiles();
    } catch (error) {
      setError(error.message);
    }
  };

  const handleEdit = (media) => {
    setEditingMedia(media);
    setFormData({
      filename: media.filename || '',
      file_url: media.file_url || '',
      file_type: media.file_type || 'image',
      file_size: media.file_size ? media.file_size.toString() : '',
      category: media.category || 'general',
      alt_text: media.alt_text || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (media) => {
    if (!confirm('Are you sure you want to delete this media file?')) return;
    
    try {
      await apiCall(`/api/admin/media/${media.id}`, {
        method: 'DELETE'
      });
      logActivity('delete', 'media_files', media.id, { filename: media.filename });
      loadMediaFiles();
    } catch (error) {
      setError(error.message);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Byte';
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileTypeIcon = (fileType) => {
    if (fileType.startsWith('image/')) return '🖼️';
    if (fileType.startsWith('video/')) return '🎥';
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('document')) return '📝';
    return '📁';
  };

  const filteredMedia = mediaFiles.filter(media => {
    const typeMatch = filterType === 'all' || 
      (filterType === 'image' && media.file_type.startsWith('image/')) ||
      (filterType === 'video' && media.file_type.startsWith('video/')) ||
      (filterType === 'document' && (media.file_type.includes('pdf') || media.file_type.includes('document')));
    
    const categoryMatch = filterCategory === 'all' || media.category === filterCategory;
    
    return typeMatch && categoryMatch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading media files...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">Media Library</h1>
          <p className="mt-2 text-sm text-gray-700">Manage your images, videos, and documents</p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-orange-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
          >
            Upload Media
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-red-800">{error}</div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Type</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">All Types</option>
              <option value="image">Images</option>
              <option value="video">Videos</option>
              <option value="document">Documents</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Category</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">All Categories</option>
              <option value="hero">Hero</option>
              <option value="projects">Projects</option>
              <option value="showreels">Showreels</option>
              <option value="general">General</option>
            </select>
          </div>
        </div>
      </div>

      {/* Media Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredMedia.map((media) => (
          <div key={media.id} className="bg-white overflow-hidden shadow-sm border border-gray-200 rounded-lg hover:shadow-lg transition-shadow">
            <div className="relative group">
              {media.file_type.startsWith('image/') ? (
                <img
                  src={media.file_url}
                  alt={media.alt_text || media.filename}
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    e.target.src = '/images/image-placeholder.jpg';
                  }}
                />
              ) : media.file_type.startsWith('video/') ? (
                <video className="w-full h-48 object-cover">
                  <source src={media.file_url} type={media.file_type} />
                  Your browser does not support the video tag.
                </video>
              ) : (
                <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                  <span className="text-4xl">{getFileTypeIcon(media.file_type)}</span>
                </div>
              )}
              
              <div className="absolute inset-0 bg-black bg-opacity-30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <a
                  href={media.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white text-gray-900 px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100 transition-colors"
                >
                  View Full Size
                </a>
              </div>
              
              <div className="absolute top-2 left-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white bg-opacity-90 text-gray-800">
                  {getFileTypeIcon(media.file_type)} {media.file_type.split('/')[0]}
                </span>
              </div>
              
              <div className="absolute top-2 right-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {media.category}
                </span>
              </div>
            </div>
            
            <div className="p-4">
              <h3 className="text-sm font-medium text-gray-900 truncate mb-1">{media.filename}</h3>
              
              <div className="text-xs text-gray-500 mb-3">
                <div>{formatFileSize(media.file_size)}</div>
                <div>{new Date(media.created_at).toLocaleDateString()}</div>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(media)}
                  className="flex-1 bg-orange-50 text-orange-600 px-2 py-1 rounded text-xs font-medium hover:bg-orange-100 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(media)}
                  className="flex-1 bg-red-50 text-red-600 px-2 py-1 rounded text-xs font-medium hover:bg-red-100 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredMedia.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="w-12 h-12 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <span className="text-gray-400 text-2xl">🖼️</span>
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No media files</h3>
          <p className="mt-1 text-sm text-gray-500">Upload some files to get started.</p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                {editingMedia ? 'Edit Media File' : 'Upload Media File'}
              </h3>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Filename *</label>
                <input
                  type="text"
                  required
                  value={formData.filename}
                  onChange={(e) => setFormData({ ...formData, filename: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">File URL *</label>
                <input
                  type="url"
                  required
                  value={formData.file_url}
                  onChange={(e) => setFormData({ ...formData, file_url: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">File Type *</label>
                <select
                  value={formData.file_type}
                  onChange={(e) => setFormData({ ...formData, file_type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="image">Image</option>
                  <option value="video">Video</option>
                  <option value="document">Document</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">File Size (bytes)</label>
                <input
                  type="number"
                  value={formData.file_size}
                  onChange={(e) => setFormData({ ...formData, file_size: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="general">General</option>
                  <option value="hero">Hero</option>
                  <option value="projects">Projects</option>
                  <option value="showreels">Showreels</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Alt Text / Description</label>
                <textarea
                  value={formData.alt_text}
                  onChange={(e) => setFormData({ ...formData, alt_text: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingMedia(null);
                    setFormData({
                      filename: '',
                      file_url: '',
                      file_type: 'image',
                      file_size: '',
                      category: 'general',
                      alt_text: ''
                    });
                  }}
                  className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-orange-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-orange-700 transition-colors"
                >
                  {editingMedia ? 'Update' : 'Upload'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
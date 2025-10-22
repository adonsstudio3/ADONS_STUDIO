'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAdmin } from '../../contexts/AdminContext';
import { PhotoIcon } from '@heroicons/react/24/outline';
import ModalPortal from '../ModalPortal';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import AdminLoadingSpinner from './AdminLoadingSpinner';

export default function MediaLibrary() {
  const [mediaFiles, setMediaFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingMedia, setEditingMedia] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [mediaToDelete, setMediaToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { apiCall, logActivity } = useAdmin();
  const hasLoadedRef = useRef(false); // Track if we've already loaded data on mount

  const [formData, setFormData] = useState({
    filename: '',
    file_url: '',
    file_type: 'image',
    file_size: '',
    category: 'general',
    alt_text: ''
  });

  // Load media files on mount only
  useEffect(() => {
    if (!hasLoadedRef.current) {
      console.log('📚 Loading media library on mount');
      loadMediaFiles();
      hasLoadedRef.current = true;
    }
  }, []);

  const loadMediaFiles = async () => {
    try {
      setLoading(true);
      const data = await apiCall('/api/admin/media');
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

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (showModal) {
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
    } else {
      document.documentElement.style.overflow = 'auto';
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.documentElement.style.overflow = 'auto';
      document.body.style.overflow = 'auto';
    };
  }, [showModal]);

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

  const handleDelete = (media) => {
    setMediaToDelete(media);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!mediaToDelete) return;
    
    try {
      setIsDeleting(true);
      await apiCall(`/api/admin/media/${mediaToDelete.id}`, {
        method: 'DELETE'
      });
      logActivity('delete', 'media_files', mediaToDelete.id, { filename: mediaToDelete.filename });
      setDeleteConfirmOpen(false);
      setMediaToDelete(null);
      loadMediaFiles();
    } catch (error) {
      setError(error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirmOpen(false);
    setMediaToDelete(null);
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


  if (loading) {
    return <AdminLoadingSpinner message="Loading media files..." />;
  }

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto"></div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center justify-center rounded-md backdrop-blur-sm bg-orange-500/30 border border-orange-400/30 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-orange-500/40 focus:outline-none focus:ring-2 focus:ring-orange-400 drop-shadow-lg"
          >
            Upload Media
          </button>
        </div>
      </div>

      {error && (
        <div className="backdrop-blur-md bg-red-500/20 border border-red-400/30 rounded-lg p-4">
          <div className="text-white drop-shadow-lg">{error}</div>
        </div>
      )}

      {/* Media Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {mediaFiles.map((media) => (
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

      {mediaFiles.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="w-12 h-12 mx-auto backdrop-blur-sm bg-white/10 rounded-full flex items-center justify-center mb-4 border border-white/20">
            <PhotoIcon className="h-6 w-6 text-white drop-shadow-lg" aria-hidden="true" />
          </div>
          <h3 className="mt-2 text-sm font-medium text-white drop-shadow-lg">No media files</h3>
          <p className="mt-1 text-sm text-white/80 drop-shadow">Upload some files to get started.</p>
        </div>
      )}

      {/* Modal */}
      <ModalPortal>
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 pointer-events-auto" onClick={() => setShowModal(false)}>
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 pointer-events-auto" onClick={(e) => e.stopPropagation()}>
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
      </ModalPortal>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteConfirmOpen}
        title="Delete Media File?"
        message="Are you sure you want to delete this media file? This action cannot be undone."
        itemName={mediaToDelete?.filename}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        isLoading={isDeleting}
      />
    </div>
  );
}
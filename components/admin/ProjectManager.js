'use client';

import React, { useState, useEffect } from 'react';
import { useAdmin } from '../../contexts/AdminContext';
import { useRealtimeProjects } from '../../hooks/useRealtimeProjects';
import { supabaseClient } from '../../lib/supabase';
import ModalPortal from '../ModalPortal';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import AdminLoadingSpinner from './AdminLoadingSpinner';

export default function ProjectManager() {
  // Use realtime hook for automatic updates
  const { projects: realtimeProjects, loading: realtimeLoading, error: realtimeError } = useRealtimeProjects();
  
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { apiCall, logActivity } = useAdmin();

  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    project_url: '',
    thumbnail: null,
    tags: [],
    is_active: true
  });

  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Sync realtime projects to local state (no more manual loadProjects!)
  useEffect(() => {
    setProjects(realtimeProjects);
    setLoading(realtimeLoading);
    if (realtimeError) {
      setError(realtimeError);
    }
  }, [realtimeProjects, realtimeLoading, realtimeError]);

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

  // Remove old loadProjects function - not needed anymore!
  const loadProjects = async () => {
    try {
      setLoading(true);
      const response = await apiCall('/api/admin/projects', { method: 'GET' });

      // Handle both response.data and response.projects
      const projectsList = response.projects || response.data || [];
      setProjects(projectsList);
      setError('');
    } catch (error) {
      console.error('Error loading projects:', error);
      setError('Failed to load projects: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }

    try {
      setError(''); // Clear any previous errors
      setUploading(true); // Show uploading state

      // Step 1: Upload thumbnail if provided (new file selected)
      let thumbnailUrl = null;
      if (formData.thumbnail) {
        try {
          setError('Uploading thumbnail...'); // Show progress to user
          thumbnailUrl = await uploadThumbnail(formData.thumbnail);
          setError('Saving project data...'); // Update progress
        } catch (uploadError) {
          console.error('Thumbnail upload failed:', uploadError);
          setError('Failed to upload thumbnail: ' + uploadError.message);
          setUploading(false); // Stop uploading state
          return;
        }
      } else if (editingProject && thumbnailPreview) {
        // When editing and no new file selected, keep existing thumbnail
        thumbnailUrl = editingProject.thumbnail_image_url || editingProject.thumbnail_url;
      }

      // Step 2: Submit project data with thumbnail URL
      const submitData = {
        title: formData.title,
        description: formData.subtitle || formData.title, // API expects description
        short_description: formData.subtitle,
        project_url: formData.project_url,
        tags: formData.tags,
        is_active: formData.is_active,
        thumbnail_image_url: thumbnailUrl // API expects thumbnail_image_url
      };

      // For PUT requests, include the project ID
      if (editingProject) {
        submitData.id = editingProject.id;
      }

      const url = '/api/admin/projects';
      const method = editingProject ? 'PUT' : 'POST';

      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout - API took too long to respond')), 30000)
      );

      // Use apiCall method which handles authentication properly
      const apiPromise = apiCall(url, {
        method: method,
        body: JSON.stringify(submitData),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const result = await Promise.race([apiPromise, timeoutPromise]);

      // Log activity (with error handling)
      try {
        await logActivity(
          editingProject ? 'update' : 'create',
          'projects',
          editingProject ? editingProject.id : result.data?.id || result.project?.id,
          `Project "${formData.title}" ${editingProject ? 'updated' : 'created'}`
        );
      } catch (logError) {
        console.warn('Failed to log activity (non-critical):', logError);
      }

      resetForm();
      setShowModal(false);
      setError(''); // Clear any error messages
      // Realtime will automatically update the list - no manual refresh needed!

    } catch (error) {
      console.error('Error saving project:', error);
      setError('Failed to save project: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (project) => {
    setEditingProject(project);
    setFormData({
      title: project.title || '',
      subtitle: project.subtitle || '',
      project_url: project.project_url || '',
      thumbnail: null,
      tags: Array.isArray(project.tags) ? project.tags : [],
      is_active: project.is_active !== undefined ? project.is_active : true
    });
    setThumbnailPreview(project.thumbnail_image_url || null);
    setShowModal(true);
  };

  const handleDelete = (project) => {
    setProjectToDelete(project);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!projectToDelete) return;

    try {
      setIsDeleting(true);
      const url = `/api/admin/projects?id=${projectToDelete.id}`;
      await apiCall(url, { method: 'DELETE' });
      await logActivity('delete', 'projects', projectToDelete.id, 'Project deleted');
      setDeleteConfirmOpen(false);
      setProjectToDelete(null);
      // Realtime will automatically update the list!
    } catch (error) {
      console.error('Delete failed:', error);
      setError('Failed to delete project: ' + error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirmOpen(false);
    setProjectToDelete(null);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      subtitle: '',
      project_url: '',
      thumbnail: null,
      tags: [],
      is_active: true
    });
    setThumbnailPreview(null);
    setEditingProject(null);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }
      
      setFormData(prev => ({ ...prev, thumbnail: file }));
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setThumbnailPreview(e.target.result);
      };
      reader.readAsDataURL(file);
      
      setError('');
    }
  };

  const uploadThumbnail = async (file) => {
    const uploadFormData = new FormData();
    uploadFormData.append('file', file);
    uploadFormData.append('bucket', 'project-assets');
    uploadFormData.append('folder', 'thumbnails');

    try {
      // Get fresh auth token for upload
      const { data, error: sessionError } = await supabaseClient.auth.getSession();
      if (sessionError || !data?.session?.access_token) {
        throw new Error('No valid session for upload');
      }

      // Direct fetch for FormData (don't use apiCall for multipart)
      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: uploadFormData,
        headers: {
          'Authorization': `Bearer ${data.session.access_token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Upload failed with status ${response.status}`);
      }

      const result = await response.json();

      if (!result || !result.data || !result.data.url) {
        throw new Error('Invalid upload response: ' + JSON.stringify(result));
      }

      return result.data.url;
    } catch (error) {
      console.error('Upload thumbnail error:', error);
      throw error;
    }
  };

  const handleTagsChange = (e) => {
    const tags = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag);
    setFormData(prev => ({ ...prev, tags }));
  };

  if (loading) {
    return <AdminLoadingSpinner message="Loading projects..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end items-center">
        <button
          onClick={() => setShowModal(true)}
          className="backdrop-blur-sm bg-blue-500/30 border border-blue-400/30 text-white px-4 py-2 rounded-lg hover:bg-blue-500/40 transition-all drop-shadow-lg"
        >
          Add New Project
        </button>
      </div>

      {error && (
        <div className="backdrop-blur-md bg-red-500/20 border border-red-400/30 text-white px-4 py-3 rounded drop-shadow-lg">
          {error}
        </div>
      )}

      {projects.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="w-12 h-12 mx-auto backdrop-blur-sm bg-white/10 rounded-full flex items-center justify-center mb-4 border border-white/20">
            <svg className="h-6 w-6 text-white drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="mt-2 text-sm font-medium text-white drop-shadow-lg">No projects</h3>
          <p className="mt-1 text-sm text-white/80 drop-shadow">Get started by adding a new project.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <div key={project.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            {project.thumbnail_image_url && (
              <img 
                src={project.thumbnail_image_url} 
                alt={project.title}
                className="w-full h-48 object-cover"
              />
            )}
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg">{project.title}</h3>
                <span className={`px-2 py-1 rounded text-sm ${
                  project.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {project.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <p className="text-gray-600 mb-2">{project.subtitle}</p>
              {project.tags && project.tags.length > 0 && (
                <div className="mb-2">
                  {project.tags.map((tag, index) => (
                    <span key={index} className="inline-block bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded mr-2 mb-1">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              <div className="flex justify-between items-center">
                {project.project_url && (
                  <a 
                    href={project.project_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    View Project →
                  </a>
                )}
                <div className="space-x-2 ml-auto">
                  <button
                    onClick={() => handleEdit(project)}
                    className="bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(project)}
                    className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <ModalPortal>
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 pointer-events-auto" onClick={() => setShowModal(false)}>
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 pointer-events-auto" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-4">
              {editingProject ? 'Edit Project' : 'Add New Project'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subtitle
                </label>
                <input
                  type="text"
                  name="subtitle"
                  value={formData.subtitle}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project URL (Link when card is clicked) *
                </label>
                <input
                  type="url"
                  name="project_url"
                  value={formData.project_url}
                  onChange={handleInputChange}
                  placeholder="https://example.com/project or https://youtube.com/watch?v=..."
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  This URL will open when users click the project card (can be YouTube, Vimeo, portfolio link, etc.)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Thumbnail Image *
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {thumbnailPreview && (
                  <div className="mt-2">
                    <img 
                      src={thumbnailPreview} 
                      alt="Preview" 
                      className="w-full max-w-xs h-32 object-cover rounded border"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.tags.join(', ')}
                  onChange={handleTagsChange}
                  placeholder="e.g. web, mobile, design"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="is_active"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                  Active
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className={`px-4 py-2 rounded-lg text-white ${
                    uploading 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {uploading 
                    ? 'Uploading...' 
                    : `${editingProject ? 'Update' : 'Create'} Project`
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
        </ModalPortal>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteConfirmOpen}
        title="Delete Project?"
        message="Are you sure you want to delete this project? This action cannot be undone."
        itemName={projectToDelete?.title}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        isLoading={isDeleting}
      />
    </div>
  );
}

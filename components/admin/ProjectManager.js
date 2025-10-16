'use client';

import React, { useState, useEffect } from 'react';
import { useAdmin } from '../../contexts/AdminContext';
import { useRealtimeProjects } from '../../hooks/useRealtimeProjects';

export default function ProjectManager() {
  // Use realtime hook for automatic updates
  const { projects: realtimeProjects, loading: realtimeLoading, error: realtimeError } = useRealtimeProjects();
  
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
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
    console.log('🔄 Syncing realtime projects:', realtimeProjects.length);
    setProjects(realtimeProjects);
    setLoading(realtimeLoading);
    if (realtimeError) {
      setError(realtimeError);
    }
  }, [realtimeProjects, realtimeLoading, realtimeError]);

  // Remove old loadProjects function - not needed anymore!
  const loadProjects = async () => {
    try {
      setLoading(true);
      console.log('🔄 Loading projects...');
      const response = await apiCall('/api/admin/projects', { method: 'GET' });
      console.log('✅ Projects loaded:', response);
      console.log('📊 Response structure:', {
        hasData: !!response.data,
        hasProjects: !!response.projects,
        dataType: typeof response.data,
        projectsType: typeof response.projects,
        dataLength: response.data?.length,
        projectsLength: response.projects?.length
      });
      
      // Handle both response.data and response.projects
      const projectsList = response.projects || response.data || [];
      console.log('📋 Setting projects:', projectsList);
      setProjects(projectsList);
      setError('');
    } catch (error) {
      console.error('❌ Error loading projects:', error);
      setError('Failed to load projects: ' + error.message);
    } finally {
      console.log('🏁 Setting loading to false');
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('🚀 Form submission started');
    console.log('Form data:', formData);
    
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
        console.log('📷 Step 1: Starting thumbnail upload...');
        console.log('🔍 Thumbnail file check:', {
          hasFile: !!formData.thumbnail,
          fileName: formData.thumbnail?.name,
          fileType: formData.thumbnail?.type,
          fileSize: formData.thumbnail?.size
        });
        
        try {
          console.log('🚀 About to call uploadThumbnail...');
          setError('Uploading thumbnail...'); // Show progress to user
          thumbnailUrl = await uploadThumbnail(formData.thumbnail);
          console.log('✅ Thumbnail uploaded successfully:', thumbnailUrl);
          setError('Saving project data...'); // Update progress
          console.log('🔄 Setting progress message: saving project...');
        } catch (uploadError) {
          console.error('❌ Thumbnail upload failed:', uploadError);
          setError('Failed to upload thumbnail: ' + uploadError.message);
          setUploading(false); // Stop uploading state
          return;
        }
      } else if (editingProject && thumbnailPreview) {
        // When editing and no new file selected, keep existing thumbnail
        console.log('ℹ️ No new thumbnail selected, keeping existing thumbnail');
        thumbnailUrl = editingProject.thumbnail_image_url || editingProject.thumbnail_url;
        console.log('🔗 Using existing thumbnail URL:', thumbnailUrl);
      } else {
        console.log('ℹ️ No thumbnail selected, skipping upload step');
      }
      
      // Step 2: Submit project data with thumbnail URL
      console.log('📝 Step 2: Submitting project data...');
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

      console.log('🌐 Making API call to:', url, 'with method:', method);
      console.log('📦 Sending data:', submitData);
      console.log('🕐 About to call project API...');

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

      console.log('✅ Project API call successful:', result);
      
      // Check if response has the expected data structure
      if (!result || (!result.data && !result.project)) {
        console.warn('⚠️ Unexpected API response structure:', result);
      }

      console.log('🔄 About to log activity...');

      // Log activity (with error handling)
      try {
        await logActivity(
          editingProject ? 'update' : 'create', 
          'project', 
          editingProject ? editingProject.id : result.data?.id || result.project?.id,
          `Project "${formData.title}" ${editingProject ? 'updated' : 'created'}`
        );
      } catch (logError) {
        console.warn('⚠️ Failed to log activity (non-critical):', logError);
      }

      console.log('🎉 Project saved successfully, refreshing form and list');
      
      resetForm();
      setShowModal(false);
      setError(''); // Clear any error messages
      // Realtime will automatically update the list - no manual refresh needed!
      console.log('✅ Project saved - realtime will update the list');

    } catch (error) {
      console.error('❌ Error saving project:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      setError('Failed to save project: ' + error.message);
    } finally {
      console.log('🏁 Finished form submission, setting uploading to false');
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

  const handleDelete = async (projectId) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;

    try {
      console.log('🗑️ Deleting project:', projectId);
      const url = `/api/admin/projects?id=${projectId}`;
      console.log('🔗 DELETE URL:', url);
      
      const response = await apiCall(url, { method: 'DELETE' });
      console.log('📥 DELETE response:', response);
      
      await logActivity('delete', 'project', projectId, 'Project deleted');
      // Realtime will automatically update the list!
      console.log('✅ Project deleted successfully - realtime will update');
    } catch (error) {
      console.error('❌ Delete failed:', error);
      setError('Failed to delete project: ' + error.message);
    }
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
    console.log('🔍 Starting thumbnail upload process...');
    console.log('📁 File details:', {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified
    });

    const uploadFormData = new FormData();
    uploadFormData.append('file', file);
    uploadFormData.append('bucket', 'project-assets');
    uploadFormData.append('folder', 'thumbnails');

    console.log('📤 FormData created, making API call...');
    console.log('🔗 Upload URL: /api/admin/upload');
    console.log('⏱️ Starting API call at:', new Date().toISOString());
    
    try {
      console.log('🚀 About to execute apiCall...');
      console.log('🔍 apiCall function exists?', typeof apiCall);
      console.log('🔍 apiCall is:', apiCall);
      console.log('🔍 FormData contents:', {
        hasFile: uploadFormData.has('file'),
        hasBucket: uploadFormData.has('bucket'),
        hasFolder: uploadFormData.has('folder')
      });
      
      console.log('🎯 Calling apiCall now...');
      
      const result = await apiCall('/api/admin/upload', {
        method: 'POST',
        body: uploadFormData
      });

      console.log('⏱️ API call completed at:', new Date().toISOString());
      console.log('✅ Upload API response:', result);
      
      if (!result || !result.data || !result.data.url) {
        throw new Error('Invalid upload response: ' + JSON.stringify(result));
      }
      
      console.log('🎯 Final thumbnail URL:', result.data.url);
      return result.data.url;
    } catch (error) {
      console.error('💥 Upload thumbnail error:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      throw error;
    }
  };

  const handleTagsChange = (e) => {
    const tags = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag);
    setFormData(prev => ({ ...prev, tags }));
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-64">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-600">Loading projects...</p>
        <button 
          onClick={() => {
            console.log('🔄 Retry button clicked');
            loadProjects();
          }}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Retry Loading
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Project Manager</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Add New Project
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
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
                    onClick={() => handleDelete(project.id)}
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
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
      )}
    </div>
  );
}

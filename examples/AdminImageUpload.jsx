// Frontend example - Admin Image Upload Component
// This would go in your frontend admin panel

import React, { useState, useCallback } from 'react';

const AdminImageUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [error, setError] = useState(null);

  // Function to upload thumbnail with automatic optimization
  const uploadThumbnail = useCallback(async (file) => {
    setUploading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('thumbnail', file);
      
      const response = await fetch('/api/admin/upload-thumbnail', {
        method: 'POST',
        headers: {
          // Add your authentication token here
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: formData
      });
      
      const result = await response.json();
      
      if (result.success) {
        setUploadResult(result);
        console.log('✅ Upload successful:', result);
        console.log('🎯 Optimization results:', result.data.optimization);
        
        // The image is now automatically optimized and available at:
        // - Original: result.data.file.path
        // - Optimized versions: Available in mapping file
        
      } else {
        setError(result.error || 'Upload failed');
      }
    } catch (err) {
      setError(err.message);
      console.error('❌ Upload error:', err);
    } finally {
      setUploading(false);
    }
  }, []);

  // Function to upload team photo
  const uploadTeamPhoto = useCallback(async (file, memberData) => {
    setUploading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('photo', file);
      formData.append('memberName', memberData.name);
      formData.append('memberRole', memberData.role);
      formData.append('memberBio', memberData.bio);
      
      const response = await fetch('/api/admin/upload-team-photo', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: formData
      });
      
      const result = await response.json();
      
      if (result.success) {
        setUploadResult(result);
        console.log('✅ Team photo uploaded and optimized:', result);
      } else {
        setError(result.error || 'Upload failed');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  }, []);

  // Function to upload multiple project images
  const uploadProjectImages = useCallback(async (files, projectData) => {
    setUploading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      
      // Add multiple files
      files.forEach(file => {
        formData.append('images', file);
      });
      
      formData.append('projectName', projectData.name);
      formData.append('projectDescription', projectData.description);
      
      const response = await fetch('/api/admin/upload-project-images', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: formData
      });
      
      const result = await response.json();
      
      if (result.success) {
        setUploadResult(result);
        console.log('✅ Project images uploaded and optimized:', result);
        
        // Each file is now available with automatic optimization
        result.data.files.forEach(file => {
          console.log(`📸 Uploaded: ${file.path}`);
        });
      } else {
        setError(result.error || 'Upload failed');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  }, []);

  // Example component render
  return (
    <div className="admin-image-upload">
      <h2>🖼️ Admin Image Upload</h2>
      
      {/* Thumbnail Upload */}
      <div className="upload-section">
        <h3>Upload Thumbnail</h3>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            if (e.target.files[0]) {
              uploadThumbnail(e.target.files[0]);
            }
          }}
          disabled={uploading}
        />
      </div>
      
      {/* Team Photo Upload */}
      <div className="upload-section">
        <h3>Upload Team Photo</h3>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            if (e.target.files[0]) {
              const memberData = {
                name: 'John Doe',
                role: 'Developer',
                bio: 'Experienced developer'
              };
              uploadTeamPhoto(e.target.files[0], memberData);
            }
          }}
          disabled={uploading}
        />
      </div>
      
      {/* Project Images Upload */}
      <div className="upload-section">
        <h3>Upload Project Images</h3>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => {
            if (e.target.files.length > 0) {
              const projectData = {
                name: 'New Project',
                description: 'Project description'
              };
              uploadProjectImages(Array.from(e.target.files), projectData);
            }
          }}
          disabled={uploading}
        />
      </div>
      
      {/* Status Display */}
      {uploading && (
        <div className="status uploading">
          🔄 Uploading and optimizing images...
        </div>
      )}
      
      {error && (
        <div className="status error">
          ❌ Error: {error}
        </div>
      )}
      
      {uploadResult && (
        <div className="status success">
          <h4>✅ Upload Successful!</h4>
          <pre>{JSON.stringify(uploadResult, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

// Example of using the OptimizedImage component with uploaded images
const DisplayOptimizedImage = ({ imageName, width = 800 }) => {
  // This would use your OptimizedImage component
  return (
    <OptimizedImage 
      name={imageName}
      width={width}
      alt="Uploaded and optimized image"
      className="admin-uploaded-image"
    />
  );
};

export default AdminImageUpload;
'use client';

import React from 'react';
import AdminProtectedRoute from '../../../components/admin/AdminProtectedRoute';
import AdminLayout from '../../../components/admin/AdminLayout';
import ProjectManager from '../../../components/admin/ProjectManager';

export default function ProjectsPage() {
  return (
    <AdminProtectedRoute>
      <AdminLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-white shadow-sm border-b border-gray-200">
            <div className="px-6 py-4">
              <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
              <p className="mt-2 text-gray-600">Manage project portfolio with media links and descriptions</p>
            </div>
          </div>

          {/* Content */}
          <div className="px-6">
            <ProjectManager />
          </div>
        </div>
      </AdminLayout>
    </AdminProtectedRoute>
  );
}
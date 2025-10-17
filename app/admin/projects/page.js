'use client';

import React from 'react';
import AdminProtectedRoute from '../../../components/admin/AdminProtectedRoute';
import AdminLayout from '../../../components/admin/AdminLayout';
import ProjectManager from '../../../components/admin/ProjectManager';
import PageHeader from '../../../components/admin/PageHeader';

export default function ProjectsPage() {
  return (
    <AdminProtectedRoute>
      <AdminLayout>
        <div className="space-y-6">
          <PageHeader title="Projects" description="Manage project portfolio with media links and descriptions" />

          {/* Content */}
          <div className="px-6">
            <ProjectManager />
          </div>
        </div>
      </AdminLayout>
    </AdminProtectedRoute>
  );
}
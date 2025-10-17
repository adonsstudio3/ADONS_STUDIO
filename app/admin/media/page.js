'use client';

import React from 'react';
import AdminProtectedRoute from '../../../components/admin/AdminProtectedRoute';
import AdminLayout from '../../../components/admin/AdminLayout';
import MediaLibrary from '../../../components/admin/MediaLibrary';
import PageHeader from '../../../components/admin/PageHeader';

export default function MediaPage() {
  return (
    <AdminProtectedRoute>
      <AdminLayout>
        <div className="space-y-6">
          <PageHeader title="Media Library" description="Manage uploaded files, images, and media assets" />

          {/* Content */}
          <div className="px-6">
            <MediaLibrary />
          </div>
        </div>
      </AdminLayout>
    </AdminProtectedRoute>
  );
}
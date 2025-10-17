'use client';

import React from 'react';
import AdminProtectedRoute from '../../../components/admin/AdminProtectedRoute';
import AdminLayout from '../../../components/admin/AdminLayout';
import ShowreelManager from '../../../components/admin/ShowreelManager';
import PageHeader from '../../../components/admin/PageHeader';

export default function ShowreelsPage() {
  return (
    <AdminProtectedRoute>
      <AdminLayout>
        <div className="space-y-6">
          <PageHeader title="Showreels" description="Manage YouTube showreel videos and content" />

          {/* Content */}
          <div className="px-6">
            <ShowreelManager />
          </div>
        </div>
      </AdminLayout>
    </AdminProtectedRoute>
  );
}
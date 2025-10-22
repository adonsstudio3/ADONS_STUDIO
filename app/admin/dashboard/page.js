'use client';

import React from 'react';
import AdminProtectedRoute from '../../../components/admin/AdminProtectedRoute';
import AdminLayout from '../../../components/admin/AdminLayout';
import DashboardOverview from '../../../components/admin/DashboardOverview';
import PageHeader from '../../../components/admin/PageHeader';

export default function DashboardPage() {
  return (
    <AdminProtectedRoute>
      <AdminLayout>
        <div className="space-y-6">
          <PageHeader title="Admin Dashboard" description="Welcome to the admin panel. Use the sidebar to navigate between sections." />

          {/* Dashboard Content */}
          <div className="px-6">
            <DashboardOverview />
          </div>
        </div>
      </AdminLayout>
    </AdminProtectedRoute>
  );
}
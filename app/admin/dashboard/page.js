'use client';

import React from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useAdmin } from '../../../contexts/AdminContext';
import AdminProtectedRoute from '../../../components/admin/AdminProtectedRoute';
import AdminLayout from '../../../components/admin/AdminLayout';
import DashboardOverview from '../../../components/admin/DashboardOverview';
import PageHeader from '../../../components/admin/PageHeader';

export default function DashboardPage() {
  const { isAuthenticated, isAdmin } = useAuth();

  if (!isAuthenticated || !isAdmin) {
    return null; // AdminProtectedRoute will handle redirect
  }

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
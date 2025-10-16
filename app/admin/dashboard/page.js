'use client';

import React from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useAdmin } from '../../../contexts/AdminContext';
import AdminProtectedRoute from '../../../components/admin/AdminProtectedRoute';
import AdminLayout from '../../../components/admin/AdminLayout';
import DashboardOverview from '../../../components/admin/DashboardOverview';

export default function DashboardPage() {
  const { isAuthenticated, isAdmin } = useAuth();

  if (!isAuthenticated || !isAdmin) {
    return null; // AdminProtectedRoute will handle redirect
  }

  return (
    <AdminProtectedRoute>
      <AdminLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-white shadow-sm border-b border-gray-200">
            <div className="px-6 py-4">
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="mt-2 text-gray-600">Welcome to the admin panel. Use the sidebar to navigate between sections.</p>
            </div>
          </div>

          {/* Dashboard Content */}
          <div className="px-6">
            <DashboardOverview />
          </div>
        </div>
      </AdminLayout>
    </AdminProtectedRoute>
  );
}
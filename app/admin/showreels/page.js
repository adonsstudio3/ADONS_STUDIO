'use client';

import React from 'react';
import AdminProtectedRoute from '../../../components/admin/AdminProtectedRoute';
import AdminLayout from '../../../components/admin/AdminLayout';
import ShowreelManager from '../../../components/admin/ShowreelManager';

export default function ShowreelsPage() {
  return (
    <AdminProtectedRoute>
      <AdminLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-white shadow-sm border-b border-gray-200">
            <div className="px-6 py-4">
              <h1 className="text-3xl font-bold text-gray-900">Showreels</h1>
              <p className="mt-2 text-gray-600">Manage YouTube showreel videos and content</p>
            </div>
          </div>

          {/* Content */}
          <div className="px-6">
            <ShowreelManager />
          </div>
        </div>
      </AdminLayout>
    </AdminProtectedRoute>
  );
}
'use client';

import React from 'react';
import AdminProtectedRoute from '../../../components/admin/AdminProtectedRoute';
import AdminLayout from '../../../components/admin/AdminLayout';
import HeroSectionManager from '../../../components/admin/HeroSectionManager';

export default function HeroSectionsPage() {
  return (
    <AdminProtectedRoute>
      <AdminLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-white shadow-sm border-b border-gray-200">
            <div className="px-6 py-4">
              <h1 className="text-3xl font-bold text-gray-900">Hero Sections</h1>
              <p className="mt-2 text-gray-600">Manage homepage hero section content and media</p>
            </div>
          </div>

          {/* Content */}
          <div className="px-6">
            <HeroSectionManager />
          </div>
        </div>
      </AdminLayout>
    </AdminProtectedRoute>
  );
}
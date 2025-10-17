'use client';

import React from 'react';
import AdminProtectedRoute from '../../../components/admin/AdminProtectedRoute';
import AdminLayout from '../../../components/admin/AdminLayout';
import HeroSectionManager from '../../../components/admin/HeroSectionManager';
import PageHeader from '../../../components/admin/PageHeader';

export default function HeroSectionsPage() {
  return (
    <AdminProtectedRoute>
      <AdminLayout>
        <div className="space-y-6">
          <PageHeader title="Hero Sections" description="Manage homepage hero section content and media" />

          {/* Content */}
          <div className="px-6">
            <HeroSectionManager />
          </div>
        </div>
      </AdminLayout>
    </AdminProtectedRoute>
  );
}
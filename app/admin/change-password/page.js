'use client';

import AdminProtectedRoute from '../../../components/admin/AdminProtectedRoute';
import AdminLayout from '../../../components/admin/AdminLayout';
import ChangePassword from '../../../components/admin/ChangePassword';

export default function ChangePasswordPage() {
  return (
    <AdminProtectedRoute>
      <AdminLayout>
        <ChangePassword />
      </AdminLayout>
    </AdminProtectedRoute>
  );
}
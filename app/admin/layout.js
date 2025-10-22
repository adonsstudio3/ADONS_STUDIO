'use client';

import '../../styles/admin.css';
import { AuthProvider } from '../../contexts/AuthContext';
import { AdminProvider } from '../../contexts/AdminContext';

export default function AdminLayout({ children }) {
  return (
    <AuthProvider>
      <AdminProvider>
        <div className="admin-root">
          {children}
        </div>
      </AdminProvider>
    </AuthProvider>
  );
}

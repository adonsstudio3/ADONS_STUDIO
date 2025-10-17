import '../../styles/admin.css';

export const metadata = {
  title: 'Admin'
};

export default function AdminLayout({ children }) {
  return (
    <div className="admin-root">
      {children}
    </div>
  );
}

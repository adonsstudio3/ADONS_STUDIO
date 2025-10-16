'use client';

import { useAuth } from '../../contexts/AuthContext';

export default function AuthChecker() {
  const { user, session, isAdmin, loading } = useAuth();

  return (
    <div style={{ 
      position: 'fixed', 
      top: '10px', 
      right: '10px', 
      background: '#000', 
      color: '#fff', 
      padding: '10px', 
      fontSize: '12px',
      zIndex: 1000,
      border: '1px solid #333'
    }}>
      <div>Loading: {loading ? 'Yes' : 'No'}</div>
      <div>User: {user?.email || 'None'}</div>
      <div>Is Admin: {isAdmin ? 'Yes' : 'No'}</div>
      <div>Session: {session?.access_token ? 'Yes' : 'No'}</div>
      <div>Token: {session?.access_token ? session.access_token.slice(0, 20) + '...' : 'None'}</div>
    </div>
  );
}
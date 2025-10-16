'use client';

import { useAdmin } from '../../contexts/AdminContext';
import { useAuth } from '../../contexts/AuthContext';
import { useState } from 'react';

export default function AuthTester() {
  const { apiCall } = useAdmin();
  const { session, user, isAdmin } = useAuth();
  const [testResult, setTestResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const testApiCall = async () => {
    setLoading(true);
    try {
      // Test a simple admin API call
      const data = await apiCall('/api/admin/debug-auth');
      setTestResult({ success: true, data });
    } catch (error) {
      setTestResult({ success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      position: 'fixed', 
      bottom: '10px', 
      right: '10px', 
      background: '#1a1a1a', 
      color: '#fff', 
      padding: '15px', 
      fontSize: '12px',
      zIndex: 1000,
      border: '1px solid #333',
      maxWidth: '300px'
    }}>
      <h4>Auth Tester</h4>
      <div>Session Token: {session?.access_token ? 'Present' : 'Missing'}</div>
      <div>User Email: {user?.email || 'None'}</div>
      <div>Is Admin: {isAdmin ? 'Yes' : 'No'}</div>
      
      <button 
        onClick={testApiCall} 
        disabled={loading}
        style={{ 
          marginTop: '10px', 
          padding: '5px 10px', 
          background: '#007acc', 
          color: 'white', 
          border: 'none',
          cursor: 'pointer'
        }}
      >
        {loading ? 'Testing...' : 'Test Admin API'}
      </button>
      
      {testResult && (
        <div style={{ marginTop: '10px', fontSize: '10px' }}>
          <strong>Result:</strong>
          <pre style={{ background: '#000', padding: '5px', overflow: 'auto' }}>
            {JSON.stringify(testResult, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
'use client';

import { useState } from 'react';
import { useAdmin } from '../../contexts/AdminContext';
import styles from './ChangePassword.module.css';

export default function ChangePassword() {
  const [step, setStep] = useState(1); // 1: Verify current password, 2: Enter OTP and new password
  const [formData, setFormData] = useState({
    currentPassword: '',
    verificationCode: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [errors, setErrors] = useState({});
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [otpExpiresAt, setOtpExpiresAt] = useState(null);

  const { apiCall, admin } = useAdmin();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear errors when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    // Clear general message
    if (message) {
      setMessage(null);
    }
  };

  const requestOTP = async (e) => {
    e.preventDefault();
    
    if (!formData.currentPassword) {
      setErrors({ currentPassword: 'Current password is required' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const response = await apiCall('/api/admin/send-password-otp', {
        method: 'POST',
        body: JSON.stringify({
          currentPassword: formData.currentPassword
        })
      });

      if (response.success) {
        setStep(2);
        setOtpExpiresAt(Date.now() + response.expiresIn * 1000);
        setMessage({
          type: 'success',
          text: 'Verification code sent to your email! Check your inbox.'
        });
      } else {
        setMessage({
          type: 'error',
          text: response.error || 'Failed to send verification code'
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.message || 'Network error. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.verificationCode) {
      newErrors.verificationCode = 'Verification code is required';
    } else if (!/^\d{6}$/.test(formData.verificationCode)) {
      newErrors.verificationCode = 'Verification code must be 6 digits';
    }

    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = 'New password must be at least 8 characters';
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/.test(formData.newPassword)) {
      newErrors.newPassword = 'Password must contain uppercase, lowercase, number and special character';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Password confirmation does not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const response = await apiCall('/api/admin/change-password', {
        method: 'POST',
        body: JSON.stringify({
          verificationCode: formData.verificationCode,
          newPassword: formData.newPassword,
          confirmPassword: formData.confirmPassword
        })
      });

      if (response.success) {
        setMessage({
          type: 'success',
          text: 'Password changed successfully!'
        });
        // Reset form
        setFormData({
          currentPassword: '',
          verificationCode: '',
          newPassword: '',
          confirmPassword: ''
        });
        setStep(1);
        setOtpExpiresAt(null);
      } else {
        setMessage({
          type: 'error',
          text: response.error || 'Failed to change password'
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.message || 'Network error. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Change Password</h1>
        <p>{step === 1 ? 'Verify your current password to continue' : 'Enter verification code and new password'}</p>
        {admin?.email && (
          <p className={styles.emailInfo}>
            📧 Account: <strong>{admin.email}</strong>
          </p>
        )}
      </div>

      <div className={styles.stepIndicator}>
        <div className={`${styles.step} ${step >= 1 ? styles.active : ''}`}>
          <div className={styles.stepNumber}>1</div>
          <span>Verify Identity</span>
        </div>
        <div className={styles.stepLine}></div>
        <div className={`${styles.step} ${step >= 2 ? styles.active : ''}`}>
          <div className={styles.stepNumber}>2</div>
          <span>Change Password</span>
        </div>
      </div>

      {step === 1 && (
        <form onSubmit={requestOTP} className={styles.form}>
          {message && (
            <div className={`${styles.message} ${styles[message.type]}`}>
              {message.text}
            </div>
          )}

          <div className={styles.stepContent}>
            <div className={styles.verificationInfo}>
              <div className={styles.iconBox}>
                🔐
              </div>
              <h3>Email Verification Required</h3>
              <p>
                For security purposes, we'll send a verification code to your email address before allowing you to change your password.
              </p>
              <ul className={styles.securityFeatures}>
                <li>✅ Verify current password</li>
                <li>✅ Receive 6-digit verification code</li>
                <li>✅ Code expires in 5 minutes</li>
                <li>✅ Activity logging for audit</li>
              </ul>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="currentPassword">Current Password</label>
              <div className={styles.passwordInput}>
                <input
                  type={showPasswords.current ? 'text' : 'password'}
                  id="currentPassword"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  disabled={loading}
                  className={errors.currentPassword ? styles.error : ''}
                  placeholder="Enter your current password"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className={styles.togglePassword}
                  onClick={() => togglePasswordVisibility('current')}
                  disabled={loading}
                  aria-label={showPasswords.current ? 'Hide password' : 'Show password'}
                >
                  {showPasswords.current ? '👁️' : '🙈'}
                </button>
              </div>
              {errors.currentPassword && (
                <span className={styles.errorMessage}>{errors.currentPassword}</span>
              )}
            </div>

            <div className={styles.actions}>
              <button
                type="submit"
                className={styles.submitButton}
                disabled={loading}
              >
                {loading ? 'Sending Code...' : 'Send Verification Code'}
              </button>
            </div>
          </div>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleSubmit} className={styles.form}>
          {message && (
            <div className={`${styles.message} ${styles[message.type]}`}>
              {message.text}
            </div>
          )}

          <div className={styles.stepContent}>
            <div className={styles.formGroup}>
              <label htmlFor="verificationCode">Email Verification Code</label>
              <input
                type="text"
                id="verificationCode"
                name="verificationCode"
                value={formData.verificationCode}
                onChange={handleChange}
                disabled={loading}
                className={errors.verificationCode ? styles.error : ''}
                placeholder="Enter 6-digit code"
                maxLength="6"
                pattern="\d{6}"
                autoComplete="one-time-code"
              />
              {errors.verificationCode && (
                <span className={styles.errorMessage}>{errors.verificationCode}</span>
              )}
              <small className={styles.codeHelp}>
                ⏰ Check your email for the verification code. Valid for 5 minutes.
              </small>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="newPassword">New Password</label>
              <div className={styles.passwordInput}>
                <input
                  type={showPasswords.new ? 'text' : 'password'}
                  id="newPassword"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  disabled={loading}
                  className={errors.newPassword ? styles.error : ''}
                  placeholder="Enter your new password"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className={styles.togglePassword}
                  onClick={() => togglePasswordVisibility('new')}
                  disabled={loading}
                  aria-label={showPasswords.new ? 'Hide new password' : 'Show new password'}
                >
                  {showPasswords.new ? '👁️' : '🙈'}
                </button>
              </div>
              {errors.newPassword && (
                <span className={styles.errorMessage}>{errors.newPassword}</span>
              )}
              <small className={styles.passwordHelp}>
                Password must be at least 8 characters with uppercase, lowercase, number and special character
              </small>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="confirmPassword">Confirm New Password</label>
              <div className={styles.passwordInput}>
                <input
                  type={showPasswords.confirm ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  disabled={loading}
                  className={errors.confirmPassword ? styles.error : ''}
                  placeholder="Confirm your new password"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className={styles.togglePassword}
                  onClick={() => togglePasswordVisibility('confirm')}
                  disabled={loading}
                  aria-label={showPasswords.confirm ? 'Hide confirm password' : 'Show confirm password'}
                >
                  {showPasswords.confirm ? '👁️' : '🙈'}
                </button>
              </div>
              {errors.confirmPassword && (
                <span className={styles.errorMessage}>{errors.confirmPassword}</span>
              )}
            </div>

            <div className={styles.actions}>
              <button
                type="button"
                className={styles.backButton}
                onClick={() => {
                  setStep(1);
                  setOtpExpiresAt(null);
                  setFormData(prev => ({
                    ...prev,
                    verificationCode: '',
                    newPassword: '',
                    confirmPassword: ''
                  }));
                  setMessage(null);
                }}
                disabled={loading}
              >
                ← Back
              </button>
              <button
                type="submit"
                className={styles.submitButton}
                disabled={loading}
              >
                {loading ? 'Changing Password...' : 'Change Password'}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
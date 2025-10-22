'use client';

import React, { useEffect } from 'react';
import ModalPortal from '../ModalPortal';
import { XMarkIcon } from '@heroicons/react/24/outline';

// A modal delete card
export default function DeleteConfirmationModal({ 
  isOpen, 
  title = 'Delete Item?',
  message = 'Are you sure you want to delete this?',
  itemName = '',
  onConfirm, 
  onCancel,
  isLoading = false
}) {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
    } else {
      document.documentElement.style.overflow = 'auto';
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.documentElement.style.overflow = 'auto';
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    // Only close if clicking on backdrop, not on the card
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  return (
    <ModalPortal>
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 pointer-events-auto"
        onClick={handleBackdropClick}
      >
        {/* Modal Card */}
        <div 
          className="bg-white rounded-lg shadow-2xl w-full max-w-md mx-4 pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header with Close Button */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              {title}
            </h3>
            <button
              onClick={onCancel}
              disabled={isLoading}
              className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Close modal"
              title="Cancel delete (Esc)"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-4">
            <p className="text-gray-700 text-sm leading-relaxed">
              {message}
            </p>
            {itemName && (
              <p className="mt-3 text-sm font-medium text-red-600 bg-red-50 px-3 py-2 rounded">
                Item: <span className="font-semibold">{itemName}</span>
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
            <button
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Deleting...
                </>
              ) : (
                'Yes, Delete'
              )}
            </button>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}

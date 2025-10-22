import React from 'react';
import Lottie from 'lottie-react';
import wolfAnimation from '../../public/lottie/Fox Runing.json';

/**
 * AdminLoadingSpinner - Displays a running wolf animation
 * Used as a loading indicator on all admin pages
 * @param {string} message - Loading message text
 * @param {boolean} fullScreen - If true, uses full screen; if false, uses compact inline size (default: false)
 */
export default function AdminLoadingSpinner({ message = 'Loading', fullScreen = false }) {
  if (fullScreen) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        {/* Wolf Animation - Full Screen */}
        <div className="w-64 h-64">
          <Lottie
            animationData={wolfAnimation}
            loop={true}
            autoplay={true}
            style={{
              width: '100%',
              height: '100%',
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-64">
      {/* Wolf Animation - Inline/Compact */}
      <div className="w-32 h-32">
        <Lottie
          animationData={wolfAnimation}
          loop={true}
          autoplay={true}
          style={{
            width: '100%',
            height: '100%',
          }}
        />
      </div>
      {message && (
        <p className="text-white font-medium drop-shadow-lg mt-4">{message}</p>
      )}
    </div>
  );
}

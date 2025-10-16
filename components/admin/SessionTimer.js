'use client';

import { useState, useEffect } from 'react';
import { ClockIcon } from '@heroicons/react/24/outline';

export default function SessionTimer() {
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    const updateTimer = () => {
      const loginTime = localStorage.getItem('admin_login_time');
      if (loginTime) {
        const loginTimestamp = parseInt(loginTime);
        const currentTime = Date.now();
        const twentyFourHours = 24 * 60 * 60 * 1000;
        const timeRemaining = twentyFourHours - (currentTime - loginTimestamp);

        if (timeRemaining > 0) {
          const hours = Math.floor(timeRemaining / (60 * 60 * 1000));
          const minutes = Math.floor((timeRemaining % (60 * 60 * 1000)) / (60 * 1000));
          setTimeLeft({ hours, minutes, total: timeRemaining });
        } else {
          setTimeLeft(null);
        }
      } else {
        setTimeLeft(null);
      }
    };

    // Update immediately
    updateTimer();

    // Update every minute
    const interval = setInterval(updateTimer, 60000);

    return () => clearInterval(interval);
  }, []);

  if (!timeLeft) {
    return null;
  }

  const isWarning = timeLeft.total < 2 * 60 * 60 * 1000; // Less than 2 hours
  const isCritical = timeLeft.total < 30 * 60 * 1000; // Less than 30 minutes

  return (
    <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm ${
      isCritical 
        ? 'bg-red-100 text-red-800' 
        : isWarning 
        ? 'bg-yellow-100 text-yellow-800' 
        : 'bg-blue-100 text-blue-800'
    }`}>
      <ClockIcon className="h-4 w-4" />
      <span>
        Session: {timeLeft.hours}h {timeLeft.minutes}m left
      </span>
    </div>
  );
}
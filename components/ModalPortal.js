'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

/**
 * ModalPortal - Renders modal content outside the normal DOM tree
 * This ensures modals can be fixed to the viewport without being constrained
 * by parent container overflow or positioning
 */
export default function ModalPortal({ children }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Only render after hydration to avoid mismatch
  if (!mounted) return null;

  return createPortal(children, document.body);
}

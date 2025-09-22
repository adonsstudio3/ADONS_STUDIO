"use client";
import React, { useState } from "react";

export function Popover({ children, open: openProp, onOpenChange, ...props }) {
  const [openInternal, setOpenInternal] = useState(false);
  const open = openProp !== undefined ? openProp : openInternal;
  const setOpen = (v) => {
    if (onOpenChange) onOpenChange(v);
    if (openProp === undefined) setOpenInternal(v);
  };

  // Expect children: [PopoverTrigger, PopoverContent]
  return React.Children.map(children, (child) => {
    if (!child) return null;
    if (child.type && child.type.displayName === 'PopoverTrigger') {
      return React.cloneElement(child, { onToggle: () => setOpen(!open), open });
    }
    if (child.type && child.type.displayName === 'PopoverContent') {
      return React.cloneElement(child, { open });
    }
    return child;
  });
}

export function PopoverTrigger({ children, onToggle, open, ...props }) {
  return (
    <button type="button" onClick={onToggle} {...props}>
      {children}
    </button>
  );
}
PopoverTrigger.displayName = 'PopoverTrigger';

export function PopoverContent({ children, open, className = "", ...props }) {
  return open ? (
    <div className={className} {...props}>
      {children}
    </div>
  ) : null;
}
PopoverContent.displayName = 'PopoverContent';

export default Popover;

"use client";
import React from "react";

export function Command({ children, className = "", ...props }) {
  return (
    <div className={className} {...props}>
      {children}
    </div>
  );
}

export function CommandList({ children, className = "", ...props }) {
  return (
    <div className={className} {...props}>
      {children}
    </div>
  );
}

export function CommandGroup({ children, className = "", ...props }) {
  return (
    <div className={className} {...props}>
      {children}
    </div>
  );
}

export function CommandItem({ children, onSelect, className = "", ...props }) {
  return (
    <button
      type="button"
      className={className}
      onClick={() => onSelect && onSelect()}
      {...props}
    >
      {children}
    </button>
  );
}

export function CommandInput({ value, onChange, placeholder = "", className = "", ...props }) {
  return (
    <input value={value} onChange={onChange} placeholder={placeholder} className={className} {...props} />
  );
}

export function CommandEmpty({ children }) {
  return <div className="p-2 text-sm text-muted">{children}</div>;
}

export default Command;

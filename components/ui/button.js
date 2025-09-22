"use client";
import React from "react";

export function Button({ children, className = "", ...props }) {
  return (
    <button
      className={["inline-flex items-center justify-center rounded-md px-3 py-1.5 text-sm font-medium shadow-sm", className].join(" ")}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;

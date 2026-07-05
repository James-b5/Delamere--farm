"use client";

import React from 'react';

type InputGroupProps = {
  left?: React.ReactNode;
  right?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
};

export default function InputGroup({ left, right, children, className = '' }: InputGroupProps) {
  return (
    <div className={className}>
      <div className="group flex items-center rounded-2xl border border-slate-300 bg-white shadow-sm transition focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-100">
        <div className="flex shrink-0 items-center justify-center rounded-l-2xl bg-slate-50 px-4 py-3">
          {left}
        </div>
        <div className="flex-1">
          {children}
        </div>
        {right && <div className="shrink-0 px-3">{right}</div>}
      </div>
    </div>
  );
}

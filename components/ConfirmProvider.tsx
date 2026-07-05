"use client";

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';

type ConfirmOptions = {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
};

type ConfirmContextType = {
  confirm: (opts: ConfirmOptions | string) => Promise<boolean>;
};

const ConfirmContext = createContext<ConfirmContextType | null>(null);

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [opts, setOpts] = useState<ConfirmOptions>({ message: '' });
  const resolverRef = useRef<(value: boolean) => void>(() => {});
  const cancelButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault();
        doCancel();
      }
      if (event.key === 'Enter') {
        event.preventDefault();
        doConfirm();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    cancelButtonRef.current?.focus();

    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  function confirm(input: ConfirmOptions | string) {
    const options = typeof input === 'string' ? { message: input } : input;
    setOpts({ confirmText: 'Delete', cancelText: 'Cancel', ...options });
    setOpen(true);
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
    });
  }

  function doCancel() {
    setOpen(false);
    resolverRef.current(false);
  }

  function doConfirm() {
    setOpen(false);
    resolverRef.current(true);
  }

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div role="dialog" aria-modal="true" aria-labelledby="confirm-dialog-title" className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl border border-gray-200">
            <div className="flex items-start gap-3 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-700">
                <span aria-hidden="true">!</span>
              </div>
              <div>
                <h3 id="confirm-dialog-title" className="text-xl font-semibold text-gray-900">{opts.title ?? 'Please confirm'}</h3>
              </div>
            </div>
            <p className="text-sm text-gray-700 mb-6 leading-relaxed">{opts.message}</p>
            <div className="flex justify-end gap-3">
              <button
                ref={cancelButtonRef}
                onClick={doCancel}
                className="px-4 py-2 bg-gray-100 text-gray-900 border border-gray-200 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
              >
                {opts.cancelText}
              </button>
              <button
                onClick={doConfirm}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                {opts.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm must be used within ConfirmProvider');
  return ctx.confirm;
}

export default ConfirmProvider;

"use client";

import React, { useState } from 'react';
import InputGroup from './InputGroup';
import { Lock, Eye, EyeOff } from 'lucide-react';

type PasswordFieldProps = {
  id?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  name?: string;
};

export default function PasswordField({ id = 'password', value, onChange, placeholder = 'Password', required = true, name = 'password' }: PasswordFieldProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState(false);

  return (
    <InputGroup
      left={<Lock className="h-5 w-5 text-gray-300" />}
      right={(
        <button
          type="button"
          aria-label={showPassword ? 'Hide password' : 'Show password'}
          onClick={() => setShowPassword(s => !s)}
          className="rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
        >
          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>
      )}
    >
      <div className="relative">
        <input
          id={id}
          name={name || 'password'}
          type={showPassword ? 'text' : 'password'}
          autoComplete="current-password"
          required={required}
          title="Password"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="w-full rounded-r-2xl bg-transparent py-3 pl-0 pr-4 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
        />

        {value.length === 0 && !focused && !showPassword && (
          <div className="absolute left-0 inset-y-0 flex items-center pl-0 pointer-events-none" aria-hidden>
            <div className="flex items-center gap-1 ml-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <span key={i} className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" />
              ))}
            </div>
          </div>
        )}
      </div>
    </InputGroup>
  );
}

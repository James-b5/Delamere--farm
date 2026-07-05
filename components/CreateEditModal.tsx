import React, { useState, useEffect, FormEvent } from 'react';

interface CreateEditModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  onSubmit: (data: Record<string, any>) => Promise<void>;
  /**
   * Initial values for the form fields, e.g. { name: 'Apple', price: 10 }
   */
  initialValues?: Record<string, any>;
  /**
   * Fields definition to generate form inputs dynamically.
   * Each field: { name, label, type, required, options }
   */
  fields: Array<{
    name: string;
    label: string;
    type?: string;
    required?: boolean;
    options?: string[];
  }>;
}

/**
 * Generic modal used by admin pages for creating or editing an entity.
 * It renders a simple form based on the supplied `fields` definition.
 * Styling follows the premium design system (glassmorphism, subtle shadow).
 */
export function CreateEditModal({ open, title, onClose, onSubmit, initialValues = {}, fields }: CreateEditModalProps) {
  const [formData, setFormData] = useState<Record<string, any>>(initialValues);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setFormData(initialValues);
  }, [initialValues]);

  if (!open) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target as any;
    const checked =
      type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (err) {
      // errors are handled by the caller via toast, etc.
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50">
      <div className="bg-white/90 backdrop-filter backdrop-blur-lg rounded-xl shadow-xl max-w-lg w-full mx-4 p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">{title}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {fields.map(field => (
            <div key={field.name}>
              <label htmlFor={field.name} className="block text-sm font-medium text-gray-700 mb-1">
                {field.label}
              </label>
              {field.type === 'textarea' ? (
                <textarea
                  id={field.name}
                  name={field.name}
                  required={field.required}
                  value={formData[field.name] ?? ''}
                  onChange={handleChange}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                />
              ) : field.type === 'select' && field.options ? (
                <select
                  id={field.name}
                  name={field.name}
                  required={field.required}
                  value={formData[field.name] ?? ''}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                >
                  <option value="">Select {field.label.toLowerCase()}</option>
                  {field.options.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              ) : (
                <input
                  id={field.name}
                  name={field.name}
                  type={field.type ?? 'text'}
                  required={field.required}
                  value={field.type === 'checkbox' ? undefined : formData[field.name] ?? ''}
                  checked={field.type === 'checkbox' ? !!formData[field.name] : undefined}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                />
              )}
            </div>
          ))}
          <div className="flex justify-end space-x-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition disabled:opacity-50"
              disabled={submitting}
            >
              {submitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

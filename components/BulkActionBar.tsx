import React from 'react';
import toast from 'react-hot-toast';
import { useConfirm } from '@/components/ConfirmProvider';

interface BulkActionBarProps {
  selectedIds: string[];
  onAction: (action: string) => void;
  disabled?: boolean;
}

export const BulkActionBar: React.FC<BulkActionBarProps> = ({ selectedIds, onAction, disabled }) => {
  const confirm = useConfirm();
  const handleDelete = () => {
    (async () => {
      const ok = await confirm('Delete the selected items?');
      if (!ok) return;
      onAction('delete');
    })();
  };
  const handleExport = () => {
    onAction('export');
  };

  return (
    <div className="flex items-center space-x-4 mb-4">
      <span className="text-gray-600">{selectedIds.length} selected</span>
      <button
        type="button"
        onClick={handleDelete}
        disabled={disabled || selectedIds.length === 0}
        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
      >
        Delete
      </button>
      <button
        type="button"
        onClick={handleExport}
        disabled={disabled || selectedIds.length === 0}
        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
      >
        Export CSV
      </button>
    </div>
  );
};

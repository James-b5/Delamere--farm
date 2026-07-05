import React from 'react';
import { BulkActionBar } from '@/components/BulkActionBar';

interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => any);
  render?: (value: any, row: T) => React.ReactNode;
  sortable?: boolean;
}

interface AdminTableProps<T> {
  columns: Column<T>[];
  data: T[];
  selectedIds: string[];
  onSelect: (ids: string[]) => void;
  onBulkAction: (action: string) => Promise<void>;
  rowActions?: (row: T) => React.ReactNode;
  loading?: boolean;
}

export function AdminTable<T extends { id: string }>({
  columns,
  data,
  selectedIds,
  onSelect,
  onBulkAction,
  rowActions,
  loading = false,
}: AdminTableProps<T>) {
  const toggleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      onSelect(data.map((row) => row.id));
    } else {
      onSelect([]);
    }
  };

  const toggleRow = (id: string) => {
    if (selectedIds.includes(id)) {
      onSelect(selectedIds.filter((sid) => sid !== id));
    } else {
      onSelect([...selectedIds, id]);
    }
  };

  return (
    <div className="space-y-4">
      <BulkActionBar selectedIds={selectedIds} onAction={onBulkAction} disabled={loading} />
      <div className="overflow-x-auto rounded-lg shadow-sm bg-white">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2">
                <label htmlFor="select-all-rows" className="sr-only">
                  Select all rows
                </label>
                <input
                  id="select-all-rows"
                  type="checkbox"
                  checked={selectedIds.length === data.length && data.length > 0}
                  onChange={toggleSelectAll}
                  className="form-checkbox h-4 w-4 text-green-600"
                />
              </th>
              {columns.map((col) => (
                <th
                  key={String(col.accessor)}
                  className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase"
                >
                  {col.header}
                </th>
              ))}
              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-2">
                  <label htmlFor={`select-row-${row.id}`} className="sr-only">
                    Select row {row.id}
                  </label>
                  <input
                    id={`select-row-${row.id}`}
                    type="checkbox"
                    checked={selectedIds.includes(row.id)}
                    onChange={() => toggleRow(row.id)}
                    className="form-checkbox h-4 w-4 text-green-600"
                    aria-label={`Select row ${row.id}`}
                  />
                </td>
                {columns.map((col) => (
                  <td key={String(col.accessor)} className="px-4 py-2 text-sm text-gray-900">
                    {col.render ? col.render(
                      typeof col.accessor === 'function' ? col.accessor(row) : row[col.accessor as keyof T],
                      row
                    ) : String(typeof col.accessor === 'function' ? col.accessor(row) : row[col.accessor as keyof T])}
                  </td>
                ))}
                <td className="px-4 py-2 text-right space-x-2">
                  {rowActions ? rowActions(row) : (
                    <>
                      <button
                        type="button"
                        className="text-green-600 hover:underline"
                        onClick={() => console.log('Edit', row.id)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="text-red-600 hover:underline"
                        onClick={() => console.log('Delete', row.id)}
                      >
                        Delete
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import { Table } from '@tanstack/react-table';
import React from 'react';

type Props<T> = {
  table: Table<T>;
};

export function TablePagination<T>({ table }: Props<T>) {
  return (
    <div className="flex items-center gap-10">
      <div className="flex items-center gap-4">
        <button
          className="border p-1"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </button>
        <span>
          Page{' '}
          <strong>
            {table.getState().pagination.pageIndex + 1} of{' '}
            {table.getPageCount()}
          </strong>
        </span>
        <button
          className="border p-1"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </button>
      </div>

      <div className="flex items-center gap-4">
        <span>Show </span>
        <select
          className="border p-1"
          value={table.getState().pagination.pageSize}
          onChange={(e) => {
            table.setPageSize(Number(e.target.value));
          }}
        >
          {[10, 20, 30, 40, 50].map((pageSize) => (
            <option key={pageSize} value={pageSize}>
              {pageSize}
            </option>
          ))}
        </select>
        <span> entries</span>
      </div>
    </div>
  );
}

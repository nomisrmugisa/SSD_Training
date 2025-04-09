import React from 'react';
import { Table } from '@tanstack/react-table';
import './table-pagination.css';

type Props<T> = {
  table: Table<T>;
};

export function TablePagination<T>({ table }: Props<T>) {
  return (
    <div className="pagination-container">
      <div className="pagination-controls">
        <button
          className="pagination-button"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </button>
        <span className="pagination-info">
          Page{' '}
          <strong>
            {table.getState().pagination.pageIndex + 1} of{' '}
            {table.getPageCount()}
          </strong>
        </span>
        <button
          className="pagination-button"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </button>
      </div>

      <div className="pagination-controls">
        <span className="pagination-info">Show </span>
        <select
          className="page-size-select"
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
        <span className="pagination-info"> entries</span>
      </div>
    </div>
  );
}
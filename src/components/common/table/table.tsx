import {
    FilterFn,
    flexRender,
    Column,
    Table as ReactTable,
    Row,
} from '@tanstack/react-table';
import React from 'react';
import './Table.css';


declare module '@tanstack/react-table' {
    interface FilterFns {
        fuzzy: FilterFn<unknown>;
    }
}

type Props<T> = {
    table: ReactTable<T>;
    // data: T[]; // Add the data prop here
    columns?: Column<T>[]; // Ensure columns are part of the props
    onRowClick?: (row: Row<T>) => void;
    className?: string;
};

export function Table<T>({ table, columns, onRowClick, className }: Props<T>) {
    return (
        <div className={`table-responsive ${className}`}>
            <table className="table table-striped table-bordered table-hover table-dark-header">
                <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                            <th key={header.id} className="text-nowrap">
                                {header.isPlaceholder
                                    ? null
                                    : flexRender(
                                        header.column.columnDef.header,
                                        header.getContext()
                                    )}
                            </th>
                        ))}
                    </tr>
                ))}
                </thead>
                <tbody>
                {table.getRowModel().rows.map((row) => (
                    <tr key={row.id} onClick={() => onRowClick?.(row)} className="cursor-pointer">
                        {row.getVisibleCells().map((cell) => (
                            <td key={cell.id}>
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </td>
                        ))}
                    </tr>
                ))}
                </tbody>
                <tfoot>
                {table.getFooterGroups().map((footerGroup) => {
                    const pointer = onRowClick === undefined ? '' : 'cursor-pointer';

                    return (
                        <tr key={footerGroup.id} className={pointer}>
                            {footerGroup.headers.map((header) => (
                                <th key={header.id}>
                                    {header.isPlaceholder
                                        ? null
                                        : flexRender(
                                            header.column.columnDef.footer,
                                            header.getContext()
                                        )}
                                </th>
                            ))}
                        </tr>
                    );
                })}
                </tfoot>
            </table>
        </div>
    );
}
import { useState } from 'react';

import {
  ColumnDef,
  FilterFn,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { rankItem } from '@tanstack/match-sorter-utils';

declare module '@tanstack/react-table' {
  interface FilterFns {
    fuzzy: FilterFn<unknown>;
  }
}

const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value);

  addMeta({
    itemRank,
  });

  return itemRank.passed;
};

type Props<T> = {
  columns: ColumnDef<T, any>[];
  data: T[];
  globalFilter: string;
  setGlobalFilter: (value: string) => void;
};

export function useTable<T>(props: Props<T>) {
  const [data] = useState(() => [...props.data]);

  return useReactTable({
    data,
    columns: props.columns,
    getCoreRowModel: getCoreRowModel(),
    state: {
      globalFilter: props.globalFilter,
    },
    onGlobalFilterChange: props.setGlobalFilter,
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    globalFilterFn: 'fuzzy',
    filterFns: {
      fuzzy: fuzzyFilter,
    },
  });
}

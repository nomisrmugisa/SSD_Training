import { createColumnHelper } from '@tanstack/react-table';

import { GroupActivities } from '../types/org-unit-about';
import React from 'react';
import {deleteGroup} from "../components/org-unit-about/deleteGroup";

const columnHelper = createColumnHelper<GroupActivities>();

export const GroupActivitiesColumns =  (credentials: string, setMessage: any, setIsError: any) => [
  columnHelper.accessor('directIndirect', {
    cell: (info) => info.getValue(),
    header: () => 'Beneficiary type',
  }),
  // columnHelper.accessor('beneficiaryType', {
  //   cell: (info) => info.getValue(),
  //   header: 'Beneficiary Type',
  // }),
  columnHelper.accessor('code', {
    cell: (info) => info.getValue(),
    header: 'GAT. Individual Code',
  }),
  columnHelper.accessor('name', {
    cell: (info) => info.getValue(),
    header: 'Name',
  }),
  columnHelper.accessor('sex', {
    cell: (info) => info.getValue(),
    header: 'Sex',
  }),
  columnHelper.accessor('age', {
    cell: (info) => info.getValue(),
    header: 'Age',
  }),
  // Custom delete column
  columnHelper.display({
    id: 'delete', // This can be any string as it is a custom column
    header: 'Delete',
    cell: (info) => (
        <button
            onClick={(event) => {
              event.stopPropagation();  // Prevent row click event
              const rowId = info.row.original.id;
              deleteGroup(rowId, credentials, setMessage, setIsError)
            }}
            className="delete-button"
        >
          x
        </button>
    ),
  }),
];

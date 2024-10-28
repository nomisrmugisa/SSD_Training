import { createColumnHelper } from '@tanstack/react-table';

import { OrgUnitDetails } from '../types/org-unit-details';
import React, {useState} from 'react';
import {handleDelete} from "../components/org-unit-details/deleteRecord";
import './table-styles.css'; // Ensure this path is correct


const columnHelper = createColumnHelper<OrgUnitDetails>();

export const orgUnitDetailsColumns =  (credentials: string, setMessage: any, setIsError: any) => [
  columnHelper.accessor('id', {
    id: 'id',
  }),
  columnHelper.accessor('recordDate', {
    cell: (info) => info.getValue(),
    header: () => 'Record Date',
  }),
  columnHelper.accessor('beneficiaryName', {
    cell: (info) => info.getValue(),
    header: () => 'Name of CSO/Partner',
  }),
  columnHelper.accessor('topicTrainedOn', {
    cell: (info) => info.getValue(),
    header: () => 'Group Type',
  }),
  columnHelper.accessor('track', {
    cell: (info) => info.getValue(),
    header: () => 'Activity',
  }),
  columnHelper.accessor('sex', {
    cell: (info) => info.getValue(),
    header: () => 'Description',
  }),
  
  columnHelper.accessor('venue', {
    cell: (info) => info.getValue(),
    header: () => 'Venue',
  }),
  // Custom delete column
  columnHelper.display({
    id: 'delete', // This can be any string as it is a custom column
    header: 'Delete',
    cell: (info) => (
        <button
            onClick={(event) => {
              event.stopPropagation();  // Prevent row click event
              const rowId = String(info.row.original.id); // Convert to string if necessary
              handleDelete(rowId, credentials, setMessage, setIsError)
            }}
            className="delete-button"
        >
          x
        </button>
    ),
  }),
];


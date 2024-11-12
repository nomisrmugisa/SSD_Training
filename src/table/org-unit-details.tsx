import { createColumnHelper } from '@tanstack/react-table';
import { OrgUnitDetails } from '../types/org-unit-details';
import React from 'react';
import { handleDelete } from "../components/org-unit-details/deleteRecord";

const columnHelper = createColumnHelper<OrgUnitDetails>();


export const orgUnitDetailsColumns = (credentials: any, setMessage: any, setIsError: any) => [
  // Row ID column to display row number
  columnHelper.display({
    id: 'rowNumber',
    header: 'Row ID',
    cell: (info) => info.row.index + 1,  // Add 1 to make it 1-based instead of 0-based
  }),
  columnHelper.accessor('id', {
    id: 'Record ID',
  }),
  columnHelper.accessor('recordDate', {
    cell: (info) => info.getValue(),
    header: () => 'Record Date',
  }),
  columnHelper.accessor('track', {
    cell: (info) => info.getValue(),
    header: () => 'Track',
  }),
  columnHelper.accessor('topicTrainedOn', {
    cell: (info) => info.getValue(),
    header: () => 'Topic Trained On',
  }),
  columnHelper.accessor('beneficiaryName', {
    cell: (info) => info.getValue(),
    header: () => 'Beneficiary Name',
  }),
  columnHelper.accessor('nonBeneficiaryName', {
    cell: (info) => info.getValue(),
    header: () => 'Name (Non Beneficiary)',
  }),
  columnHelper.accessor('sex', {
    cell: (info) => info.getValue(),
    header: () => 'Sex',
  }),
  columnHelper.accessor('age', {
    cell: (info) => info.getValue(),
    header: () => 'Age',
  }),
  columnHelper.accessor('venue', {
    cell: (info) => info.getValue(),
    header: () => 'Venue',
  }),
  columnHelper.accessor('action', {
    cell: (info) => info.getValue(),
    header: () => 'Action',
  }),
  // Custom delete column
  columnHelper.display({
    id: 'delete',
    header: 'Delete',
    cell: (info) => (
      <button
        onClick={(event) => {
          event.stopPropagation();
          const rowId = info.row.original.id;
          handleDelete(rowId, credentials, setMessage, setIsError);
        }}
        className="delete-button"
      >
        x
      </button>
    ),
  }),
];
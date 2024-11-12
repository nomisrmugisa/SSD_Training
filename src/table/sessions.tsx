import { createColumnHelper } from '@tanstack/react-table';
import { Session } from '../types/org-unit-about';



const columnHelper = createColumnHelper<Session>();

export const sessionsColumns = (credentials: string, setMessage: any, setIsError: any) => [
    columnHelper.accessor('code', {
        cell: (info) => info.getValue() || '',
        header: 'Code',
        meta: { className: 'sticky-col-left' },
    }),
    columnHelper.accessor('age', {
        cell: (info) => info.getValue() || '',
        header: 'Age',
        meta: { className: 'sticky-col-left' },
    }),
    columnHelper.accessor('sex', {
        cell: (info) => info.getValue() || '',
        header: 'Sex',
        meta: { className: 'sticky-col-left' },
    }),
    columnHelper.accessor((row) => row.sessions[0], {
        id: 'sessionName1',
        cell: (info) => info.getValue() || '',
        header: 'Session 1 Name',
    }),
    columnHelper.accessor((row) => row.sessions[1], {
        id: 'sessionDate1',
        cell: (info) => info.getValue() || '',
        header: 'Session 1 Date',
    }),
    columnHelper.accessor((row) => row.sessions[2], {
        id: 'sessionName2',
        cell: (info) => info.getValue() || '',
        header: 'Session 2 Name',
    }),
    columnHelper.accessor((row) => row.sessions[3], {
        id: 'sessionDate2',
        cell: (info) => info.getValue() || '',
        header: 'Session 2 Date',
    }),
    columnHelper.accessor((row) => row.sessions[4], {
        id: 'sessionName3',
        cell: (info) => info.getValue() || '',
        header: 'Session 3 Name',
    }),
    columnHelper.accessor((row) => row.sessions[5], {
        id: 'sessionDate3',
        cell: (info) => info.getValue() || '',
        header: 'Session 3 Date',
    }),
    columnHelper.accessor((row) => row.sessions[6], {
        id: 'sessionName4',
        cell: (info) => info.getValue()  || '',
        header: 'Session 4 Name',
    }),
    columnHelper.accessor((row) => row.sessions[7], {
        id: 'sessionDate4',
        cell: (info) => info.getValue() || '',
        header: 'Session 4 Date',
    }),
    columnHelper.accessor((row) => row.sessions[8], {
        id: 'sessionName5',
        cell: (info) => info.getValue() || '',
        header: 'Session 5 Name',
    }),
    columnHelper.accessor((row) => row.sessions[9], {
        id: 'sessionDate5',
        cell: (info) => info.getValue() || '',
        header: 'Session 5 Date',
    }),
    // Custom delete column
    // columnHelper.display({
    //     id: 'delete', // This can be any string as it is a custom column
    //     header: 'Delete',
    //     cell: (info) => (
    //         <button
    //             onClick={(event) => {
    //                 event.stopPropagation();  // Prevent row click event
    //                 const rowId = info.row.original.id;
    //                 deleteGroup(rowId, credentials, setMessage, setIsError)
    //             }}
    //             className="delete-button"
    //         >
    //             x
    //         </button>
    //     ),
    // }),
    // columnHelper.accessor((row) => row.sessions[4], {
    //     id: 'sessionName3',
    //     cell: (info) => info.getValue() || '',  // Use empty string if value is undefined to avoid errors
    //     header: 'Session 3 Name',
    // }),
    // columnHelper.accessor((row) => row.sessions[5], {
    //     id: 'sessionDate3',
    //     cell: (info) => info.getValue() || '',  // Use empty string if value is undefined
    //     header: 'Session 3 Date',
    // }),
];

// use this to avoid errors incase sessions are missing
// columnHelper.accessor((row) => row.sessions[4], {
//     id: 'sessionName3',
//     cell: (info) => info.getValue() || '',  // Use empty string if value is undefined
//     header: 'Session 3 Name',
// }),
//     columnHelper.accessor((row) => row.sessions[5], {
//         id: 'sessionDate3',
//         cell: (info) => info.getValue() || '',  // Use empty string if value is undefined
//         header: 'Session 3 Date',
//     }),


// import { createColumnHelper } from '@tanstack/react-table';
//
// import { Session } from '../types/org-unit-about';
//
// const columnHelper = createColumnHelper<Session>();
//
// export const sessionsColumns = [
//   columnHelper.accessor('code', {
//     cell: (info) => info.getValue(),
//     header: 'Code',
//   }),
// ];

// export const generateSessionColumns = (
//   session: Session
// ): ColumnDef<Session, any>[] => {
//   const columns = [...sessionsColumns]; // Start with the 'code' column

//   for (let i = 0; i < session.sessions.length; i += 2) {
//     const dateIndex = i;
//     const sessionIndex = i + 1;

//     columns.push(
//       columnHelper.accessor((row) => row.sessions[dateIndex], {
//         id: `date-${i / 2 + 1}`,
//         cell: (info) => info.getValue(),
//         header: `Date ${i / 2 + 1}`,
//       })
//     );

//     columns.push(
//       columnHelper.accessor((row) => row.sessions[sessionIndex], {
//         id: `session-${i / 2 + 1}`,
//         cell: (info) => info.getValue(),
//         header: `Session ${i / 2 + 1}`,
//       })
//     );
//   }

//   return columns;
// };

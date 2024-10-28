// import { useState } from 'react';
// import { useHistory } from 'react-router-dom';
// import { IOrgUnit } from '../../types/org-unit';
// import { getOrgUnits } from '../../api/get-org-units';
// import React from 'react';
// import '../org-unit-search/OrgUnitSearch.css';

// export function OrgUnitSearch() {
//     const [search, setSearch] = useState('');
//     const [orgUnits, setOrgUnits] = useState<IOrgUnit[]>([]);
//     const history = useHistory();


//     return (
//         <header className="org-unit-search-header">
//             <input
//                 className="search-input"
//                 placeholder="Search for org unit"
//                 value={search}
//                 onChange={async (e) => {
//                     const inputValue = e.target.value;
//                     setSearch(inputValue);

//                     if (inputValue.length === 0) return;

//                     const data = await getOrgUnits(inputValue);
//                     setOrgUnits(data);
//                 }}
//             />
//             <ul className="org-unit-list">
//                 {orgUnits.map((orgUnit) => (
//                     <li
//                         onClick={() => {
//                             setSearch(orgUnit.displayName);
//                             history.push(`/${orgUnit.id}`);
//                             setOrgUnits([]);
//                         }}
//                         key={orgUnit.id}
//                         className="org-unit-item"
//                     >
//                         {orgUnit.displayName}
//                     </li>
//                 ))}
//             </ul>
//         </header>
//     );
// }


import { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { IOrgUnit } from '../../types/org-unit';
import { getOrgUnits } from '../../api/get-org-units';
import React from 'react';
import '../org-unit-search/OrgUnitSearch.css';

export function OrgUnitSearch() {
    const [search, setSearch] = useState('');
    const [orgUnits, setOrgUnits] = useState<IOrgUnit[]>([]);
    const history = useHistory();

    return (
        <header className="org-unit-search-header">
            <input
                className="search-input"
                placeholder="Search for org unit"
                value={search}
                onChange={async (e) => {
                    const inputValue = e.target.value;
                    setSearch(inputValue);

                    if (inputValue.length === 0) {
                        setOrgUnits([]); // Reset to empty array if search is cleared
                        return;
                    }

                    try {
                        const data = await getOrgUnits(inputValue);
                        setOrgUnits(data || []); // Default to an empty array if data is undefined
                    } catch (error) {
                        console.error("Error fetching org units:", error);
                        setOrgUnits([]); // Set to empty array in case of error
                    }
                }}
            />
            <ul className="org-unit-list">
                {search && Array.isArray(orgUnits) && orgUnits.length > 0 ? (
                    orgUnits.map((orgUnit) => (
                        <li
                            onClick={() => {
                                setSearch(orgUnit.displayName);
                                history.push(`/${orgUnit.id}`);
                                setOrgUnits([]); // Clear the list after selection
                            }}
                            key={orgUnit.id}
                            className="org-unit-item"
                        >
                            {orgUnit.displayName}
                        </li>
                    ))
                ) : (
                    search && <li className="no-results">No results found</li>
                )}
            </ul>
        </header>
    );
}


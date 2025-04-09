import { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { IOrgUnit } from '../../types/org-unit';
import { getOrgUnits } from '../../api/get-org-units';
import React from 'react';
import '../org-unit-search/OrgUnitSearch.css';

export function OrgUnitSearch() {
    const [search, setSearch] = useState('');
    const [orgUnits, setOrgUnits] = useState<IOrgUnit[]>([]);
    const [placeholder, setPlaceholder] = useState('Search for Org Unit');
    const history = useHistory();

    // Add this useEffect to log placeholder changes
    useEffect(() => {
        console.log('Placeholder state updated to:', placeholder);
    }, [placeholder]);

    return (
        <header className="org-unit-search-header">
            <input
                className="search-input"
                placeholder={placeholder}
                value={search}
                onChange={async (e) => {
                    const inputValue = e.target.value;
                    setSearch(inputValue);

                    if (inputValue.length === 0) {
                        setOrgUnits([]); // Clear org units if input is empty
                        return;
                    }

                    const data = await getOrgUnits(inputValue);
                    setOrgUnits(data);
                    console.log('Org Units:', data);
                }}
            />
            <ul className="org-unit-list">
                {orgUnits.map((orgUnit) => (
                    <li
                        onClick={() => {
                            console.log('Selected Org Unit:', orgUnit.displayName);
                            setSearch(orgUnit.displayName);                            
                            history.push(`/${orgUnit.id}`);
                            setPlaceholder(orgUnit.displayName);
                            console.log('Placeholder updated to:', placeholder); 
                            setOrgUnits([]);
                        }}
                        key={orgUnit.id}
                        className="org-unit-item"
                    >
                        {orgUnit.displayName}
                    </li>
                ))}
            </ul>
        </header>
    );
}

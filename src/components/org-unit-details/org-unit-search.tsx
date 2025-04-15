import { useState, useEffect } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { IOrgUnit } from '../../types/org-unit';
import { getOrgUnits } from '../../api/get-org-units';
import React from 'react';
import '../org-unit-search/OrgUnitSearch.css';

export function OrgUnitSearch() {
    const [search, setSearch] = useState('');
    const [orgUnits, setOrgUnits] = useState<IOrgUnit[]>([]);
    const history = useHistory();
    const location = useLocation();

    // Get initial placeholder from URL or use default
    const [placeholder, setPlaceholder] = useState(
        new URLSearchParams(location.search).get('orgUnit') || 'Search for Org Unit'
    );

    useEffect(() => {
        // Update placeholder when URL changes
        const params = new URLSearchParams(location.search);
        const orgUnitName = params.get('orgUnit');
        if (orgUnitName) {
            setPlaceholder(orgUnitName);
        }
    }, [location.search]);

    return (
        <header className="org-unit-search-header">
            <input
                className="search-input {`search-input ${placeholder !== 'Search for Org Unit' ? 'has-org-unit' : ''}`}"
                placeholder={placeholder}
                value={search}
                onChange={async (e) => {
                    const inputValue = e.target.value;
                    setSearch(inputValue);

                    if (inputValue.length === 0) {
                        setOrgUnits([]);
                        return;
                    }

                    const data = await getOrgUnits(inputValue);
                    setOrgUnits(data);
                }}
            />
            <ul className="org-unit-list">
                {orgUnits.map((orgUnit) => (
                    <li
                        onClick={() => {
                            // Update URL with selected org unit
                            history.push({
                                pathname: `/${orgUnit.id}`,
                                search: `?orgUnit=${encodeURIComponent(orgUnit.displayName)}`
                            });
                            setSearch('');
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
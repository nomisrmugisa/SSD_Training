import {ReactNode, useState} from 'react';
import React from 'react';

type Props = {
//   search: string;
//   onSearch: (value: string) => void;
  onAdd: () => void;
//  onDownloadCSV: () => void;  
  back?: ReactNode;
  front?: ReactNode;
};

export function Header(props: Props) {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: '16px' }}>
                {props.back}
                {/* <input
                    style={{ border: '1px solid #ccc', padding: '0.25rem 1rem', borderRadius: '0.25rem', fontSize: '0.875rem' }}
                    placeholder="Search"
                    // value={props.search}
                    // onChange={(e) => props.onSearch(e.target.value)}
                /> */}
            </div>

            <div style={{ display: 'flex', gap: '16px', marginLeft: 'auto', alignItems: 'center' }}>
                {/* New Download CSV Button */}
                {/* <button
                    style={{
                        padding: '0.25rem 1rem',
                        backgroundColor: '#2563eb', // Tailwind blue-600 color
                        color: 'white',
                        borderRadius: '0.375rem',
                        fontSize: '0.875rem',
                        cursor: 'pointer',
                        transition: 'background-color 0.3s ease',
                    }}
                    onClick={}
                >
                    Download CSV
                </button> */}

                {/* Existing Add + Button */}
                <button
                    style={{
                        padding: '0.25rem 1rem',
                        backgroundColor: isHovered ? '#059669' : '#10b981', // Darker green on hover
                        color: 'white',
                        borderRadius: '0.375rem',
                        fontSize: '0.875rem',
                        cursor: 'pointer',
                        transition: 'background-color 0.3s ease',
                    }}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    onClick={props.onAdd}
                >
                    Add +
                </button>
                {props.front}
            </div>
        </header>
    );
}

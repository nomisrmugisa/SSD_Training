import React, { useState } from 'react';
import { Header } from '../header';
import '../org-unit-about/form-styles.css';
import './table-styles.css';

// Define the type for the org unit details
type OrgUnitDetails = {
    id: number;
    recordDate: string;
    track: string;
    topicTrainedOn: string;
    beneficiaryName: string;
    nonBeneficiaryName: string;
    sex: string;
    age: number;
    venue: string;
};

type OrgUnitTableProps = {
    orgUnitId: string;
};

export function OrgUnitTable({ orgUnitId }: OrgUnitTableProps) {
    const [data, setData] = useState<OrgUnitDetails[]>([]);
    const [formData, setFormData] = useState<Partial<OrgUnitDetails>>({});
    const [editingId, setEditingId] = useState<number | null>(null);

    const handleEdit = (id: number) => {
        setEditingId(id);
        const record = data.find(item => item.id === id);
        setFormData(record || {});
    };

    const handleSave = (id: number) => {
        setData(prevData => prevData.map(item => item.id === id ? { ...item, ...formData } : item));
        setEditingId(null);
    };

    const handleDelete = (id: number) => {
        setData(prevData => prevData.filter(item => item.id !== id));
    };

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>, field: keyof OrgUnitDetails) => {
        const value = event.target?.value || '';
        setFormData(prevData => ({ ...prevData, [field]: value }));
    };

    const handleAddRecord = () => {
        const newRecord: OrgUnitDetails = {
            id: data.length + 1,
            recordDate: '',
            track: '',
            topicTrainedOn: '',
            beneficiaryName: '',
            nonBeneficiaryName: '',
            sex: '',
            age: 0,
            venue: ''
        };
        setData([...data, newRecord]);
        setEditingId(newRecord.id);
        setFormData(newRecord);
    };

    const renderTableRows = () => {
        return data.map((row) => (
            <tr key={row.id}>
                {Object.keys(row).map((key) => (
                    <td key={key}>
                        {editingId === row.id ? (
                            key === 'recordDate' ? (
                                <input
                                    type="date"
                                    value={formData[key as keyof OrgUnitDetails] || ''}
                                    onChange={(e) => handleInputChange(e, key as keyof OrgUnitDetails)}
                                />
                            ) : (
                                <input
                                    type="text"
                                    value={formData[key as keyof OrgUnitDetails] || ''}
                                    onChange={(e) => handleInputChange(e, key as keyof OrgUnitDetails)}
                                />
                            )
                        ) : (
                            row[key as keyof OrgUnitDetails]
                        )}
                    </td>
                ))}
                <td>
                    {editingId === row.id ? (
                        <button className="button" onClick={() => handleSave(row.id)}>Save</button>
                    ) : (
                        <>
                            <button className="edit-button" onClick={() => handleEdit(row.id)}>Edit</button>
                            <button className="delete-button" onClick={() => handleDelete(row.id)}>Delete</button>
                        </>
                    )}
                </td>
            </tr>
        ));
    };

    return (
        <main className="space-y-4">
            <Header search={''} onSearch={() => { }} onAdd={handleAddRecord} /><br />
            <button className="add-button" onClick={handleAddRecord}>Add Record</button>
            <div className="table-responsive">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Record ID</th>
                            <th>Record Date</th>
                            <th>Track</th>
                            <th>Topic Trained On</th>
                            <th>Beneficiary Name</th>
                            <th>Name (Non Beneficiary)</th>
                            <th>Sex</th>
                            <th>Age</th>
                            <th>Venue</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {renderTableRows()}
                    </tbody>
                </table>
            </div>
        </main>
    );
}

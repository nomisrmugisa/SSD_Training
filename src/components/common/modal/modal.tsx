import React, { useState } from 'react';

import './modal.css';

type ModalProps = {
    // onClose: () => void;
    orgUnitId: string;
    trackInstanceId: string;
    children: React.ReactNode;
    trainingFilter: string; // Add trainingFilter as a prop
    LivelihoodForm: React.FC<{ place: string; track: string; orgUnit: string, trackInstance: string }>;
    WaterSanitationForm: React.FC<{ place: string; track: string; orgUnit: string, trackInstance: string }>;
    NutritionForm: React.FC<{ place: string; track: string; orgUnit: string, trackInstance: string }>;
};

const Modal: React.FC<ModalProps> = ({ orgUnitId, trackInstanceId, children, trainingFilter, LivelihoodForm, WaterSanitationForm, NutritionForm}) => {
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [showFilterForm, setShowFilterForm] = useState(false);

    const handleRecordClick = (record) => {
        setSelectedRecord(record);
        setShowFilterForm(true);
    };

    // console.log({selectedRecord});

    return (
        <div className="modal-frame fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="modal-content bg-white rounded-lg shadow-lg p-4">
                <button onClick={() => {setShowFilterForm(false)}} className="absolute top-2 right-2 text-gray-500">
                    &times;
                </button>
                {children}
                {showFilterForm && selectedRecord && (
                    <div>
                        {trainingFilter === 'Livelihood' && (<LivelihoodForm place={selectedRecord.registeringUnit} track={selectedRecord.beneficiaryTrack} orgUnit={orgUnitId} trackInstance={trackInstanceId}  />)}
                        {trainingFilter === 'Water Sanitation & Hygiene' && (<WaterSanitationForm place={selectedRecord.registeringUnit} track={selectedRecord.beneficiaryTrack} orgUnit={orgUnitId} trackInstance={trackInstanceId} />)}
                        {trainingFilter === 'Nutrition' && (<NutritionForm place={selectedRecord.registeringUnit} track={selectedRecord.beneficiaryTrack} orgUnit={orgUnitId} trackInstance={trackInstanceId} />)}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Modal;
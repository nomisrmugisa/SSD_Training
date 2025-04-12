import React, { useState } from 'react';
import './formStyles.css';

const WaterSanitationForm: React.FC<{ place: string; track: string; orgUnit: string; trackInstance: string }> = ({ place, track, orgUnit, trackInstance }) => {
    const [formData, setFormData] = useState({
        reportDate: '',
        dueDate: '',
        foodSafety: false,
        promotersAttendance: false,
        personalHygiene: false,
        householdHygiene: false,
        cleanSafeWater: false,
        latrineDisposal: false,
    });

    const [isLoading, setIsLoading] = useState(false);

    const handleInputChange = (event) => {
        const { name, type, checked, value } = event.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const generateEvent = async (length = 11): Promise<string> => {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        return new Promise((resolve) => {
            let result = '';
            setTimeout(() => {
                for (let i = 0; i < length; i++) {
                    const randomIndex = Math.floor(Math.random() * characters.length);
                    result += characters[randomIndex];
                }
                resolve(result);
            }, 100);
        });
    };

    const handleComplete = async () => {
        try {
            const event = await generateEvent();
            console.log({"event": event})

            const payload = {
                "dataValues": [
                    { "value": formData.foodSafety, "dataElement": "Q4dJyNwdyyJ" },
                    { "value": formData.promotersAttendance, "dataElement": "zwumtCV5d8h" },
                    { "value": formData.personalHygiene, "dataElement": "POMbjIgo3EF" },
                    { "value": formData.householdHygiene, "dataElement": "ss6pDJe2k6h" },
                    { "value": formData.cleanSafeWater, "dataElement": "xyaOOPDyjoN" },
                    { "value": formData.latrineDisposal, "dataElement": "dnlAV3tubDJ" }
                ],
                "event": event,
                "program": "n2iAPy3PGx7",
                "programStage": "bTVReRuHapT",
                "orgUnit": orgUnit,//"DGY1RFEb7sO",
                "trackedEntityInstance": trackInstance, //"kfJ7DFRjnuA",
                "status": "ACTIVE",
                "dueDate": formData.dueDate,
                "eventDate": formData.reportDate
            };

            const response = await fetch(`${process.env.REACT_APP_DHIS2_BASE_URL}api/events`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Basic ' + btoa('admin:Precommunicate30-#Helle17') // Replace with your actual credentials
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.message || response.statusText}`);
            }

            const data = await response.json();
            console.log('Data submitted successfully:', data);
            alert('Form submitted successfully!');

        } catch (error) {
            console.error('Error submitting data:', error);
            alert('Error submitting form. Please try again later.');
        }
    };

    const handleSubmit = async (event) => {
        await event.preventDefault();
        console.log('Water Sanitation Form submitted:', formData);
        // onClose();
        await handleComplete();
    };

    const resetForm = () => {
        setFormData({
            reportDate: '',
            dueDate: '',
            foodSafety: false,
            promotersAttendance: false,
            personalHygiene: false,
            householdHygiene: false,
            cleanSafeWater: false,
            latrineDisposal: false,
        });
    };

    return (
        <form onSubmit={handleSubmit} className="form-container">
            <h2>Water Sanitation Form</h2>
            <div className="form-row">
                <label className='form-label'>Place</label>
                <span className='form-data'><b>{place}</b></span>
            </div>
            <div className="form-row">
                <label
                    className='form-label'
                    style={{ marginLeft: '-100px' }}
                >Track</label>
                <span><b>{track}</b></span>
            </div>
            <div className="form-row">
                <label>Report Date</label>
                <input
                    type="date"
                    name="reportDate"
                    className='form-data'
                    value={formData.reportDate}
                    onChange={handleInputChange}
                    required
                />
            </div>
            <div className="form-row">
                <label>Due Date</label>
                <input
                    type="date"
                    name="dueDate"
                    className='form-data'
                    value={formData.dueDate}
                    onChange={handleInputChange}
                    required
                />
            </div>
            <div className="form-row track">
                <label>
                    Food Safety
                    
                </label>
                <input
                        type="checkbox"
                        name="foodSafety"
                        className='form-data'
                        checked={formData.foodSafety}
                        onChange={handleInputChange}
                    />
            </div>
            <div className="form-row track">
                <label>
                    Promoters Attendance: 1. CLTS
                    
                </label>
                <input
                        type="checkbox"
                        name="promotersAttendance"
                        className='form-data'
                        checked={formData.promotersAttendance}
                        onChange={handleInputChange}
                    />
            </div>
            <div className="form-row track">
                <label>
                    Personal Hygiene
                    
                </label>
                <input
                        type="checkbox"
                        name="personalHygiene"
                        className='form-data'
                        checked={formData.personalHygiene}
                        onChange={handleInputChange}
                    />
            </div>
            <div className="form-row track">
                <label>
                    Household Hygiene
                    
                </label>
                <input
                        type="checkbox"
                        name="householdHygiene"
                        className='form-data'
                        checked={formData.householdHygiene}
                        onChange={handleInputChange}
                    />
            </div>
            <div className="form-row track">
                <label>
                    Clean and Safe Water
                    
                </label>
                <input
                        type="checkbox"
                        name="cleanSafeWater"
                        className='form-data'
                        checked={formData.cleanSafeWater}
                        onChange={handleInputChange}
                    />
            </div>
            <div className="form-row track">
                <label>
                    Use of Latrine and Excreta Disposal
                    
                </label>
                <input
                        type="checkbox"
                        name="latrineDisposal"
                        className='form-data'
                        checked={formData.latrineDisposal}
                        onChange={handleInputChange}
                    />
            </div>
            <div className="button-container">
                <button type="submit" disabled={isLoading}>
                    {isLoading ? 'Submitting...' : 'Complete'}
                </button>
                <button type="button" onClick={resetForm}>Cancel</button>
            </div>
        </form>
    );
};

export default WaterSanitationForm;
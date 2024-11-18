import React, { useState } from 'react';
import './formStyles.css';

const WaterSanitationForm: React.FC<{ place: string; track: string }> = ({ place, track }) => {
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

    const handleInputChange = (event) => {
        const { name, type, checked, value } = event.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        console.log('Water Sanitation Form submitted:', formData);
        // onClose();
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
            <div className="form-row">
                <label>
                    Food Safety
                    <input
                        type="checkbox"
                        name="foodSafety"
                        className='form-data'
                        checked={formData.foodSafety}
                        onChange={handleInputChange}
                    />
                </label>
            </div>
            <div className="form-row">
                <label>
                    Promoters Attendance: 1. CLTS
                    <input
                        type="checkbox"
                        name="promotersAttendance"
                        className='form-data'
                        checked={formData.promotersAttendance}
                        onChange={handleInputChange}
                    />
                </label>
            </div>
            <div className="form-row">
                <label>
                    Personal Hygiene
                    <input
                        type="checkbox"
                        name="personalHygiene"
                        className='form-data'
                        checked={formData.personalHygiene}
                        onChange={handleInputChange}
                    />
                </label>
            </div>
            <div className="form-row">
                <label>
                    Household Hygiene
                    <input
                        type="checkbox"
                        name="householdHygiene"
                        className='form-data'
                        checked={formData.householdHygiene}
                        onChange={handleInputChange}
                    />
                </label>
            </div>
            <div className="form-row">
                <label>
                    Clean and Safe Water
                    <input
                        type="checkbox"
                        name="cleanSafeWater"
                        className='form-data'
                        checked={formData.cleanSafeWater}
                        onChange={handleInputChange}
                    />
                </label>
            </div>
            <div className="form-row">
                <label>
                    Use of Latrine and Excreta Disposal
                    <input
                        type="checkbox"
                        name="latrineDisposal"
                        className='form-data'
                        checked={formData.latrineDisposal}
                        onChange={handleInputChange}
                    />
                </label>
            </div>
            <div className="button-container">
                <button type="submit">Complete</button>
                <button type="button" onClick={()=>{}}>Cancel</button>
            </div>
        </form>
    );
};

export default WaterSanitationForm;
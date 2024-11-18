import React, { useState } from 'react';
import './formStyles.css';

const NutritionForm: React.FC<{ place: string; track: string }> = ({ place, track }) => {
    const [formData, setFormData] = useState({
        reportDate: '',
        dueDate: '',
        nutritionPregnancy: false,
        earlyInitiation: false,
        breastfeedingFirst6Months: false,
        exclusiveBreastfeeding: false,
        goodHygienePractices: false,
        complementaryFeeding: false,
        healthSeekingBehavior: false,
        growthMonitoring: false,
        kitchenGardens: false,
        cookingDemonstration: false,
        pregnant: false,
        lactating: false,
        other: '',
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
        console.log('Nutrition Form submitted:', formData);
        // onClose();
    };

    return (
        <form onSubmit={handleSubmit} className="form-container">
            <h2>Nutrition Form</h2>
            <div className="form-row">
                <label className='form-label'>Place</label>
                <span className='form-data'><b>{place}</b></span>
            </div>
            <div className="form-row">
                <label 
                    className='form-label'
                    style={{ marginLeft: '-100px' }}
                >Track</label>
                <span className='form-data'><b>{track}</b></span>
            </div>
            <div className="form-row">
                <label className='form-label'>Report Date</label>
                <input
                    className='form-input'
                    type="date"
                    name="reportDate"
                    value={formData.reportDate}
                    onChange={handleInputChange}
                    required
                />
            </div>
            <div className="form-row">
                <label className='form-label'>Due Date</label>
                <input
                    className='form-input'
                    type="date"
                    name="dueDate"
                    value={formData.dueDate}
                    onChange={handleInputChange}
                    required
                />
            </div>
            <div className="form-row">
                <label className='form-label'>
                    Nutrition during pregnancy and lactation                    
                </label>
                <input
                        className='form-input'
                        type="checkbox"
                        name="nutritionPregnancy"
                        checked={formData.nutritionPregnancy}
                        onChange={handleInputChange}
                />
            </div>
            <div className="form-row">
                <label className='form-label'>
                    Importance of early initiation of breastfeeding                    
                </label>
                <input
                        className='form-input'
                        type="checkbox"
                        name="earlyInitiation"
                        checked={formData.earlyInitiation}
                        onChange={handleInputChange}
                />
            </div>
            <div className="form-row">
                <label className='form-label'>
                    Breastfeeding in the first 6 months                    
                </label>
                <input
                        className='form-input'
                        type="checkbox"
                        name="breastfeedingFirst6Months"
                        checked={formData.breastfeedingFirst6Months}
                        onChange={handleInputChange}
                />
            </div>
            <div className="form-row">
                <label className='form-label'>
                    Exclusive breastfeeding during the first 6 months                    
                </label>
                <input
                        className='form-input'
                        type="checkbox"
                        name="exclusiveBreastfeeding"
                        checked={formData.exclusiveBreastfeeding}
                        onChange={handleInputChange}
                />
            </div>
            <div className="form-row">
                <label className='form-label'>
                    Good hygiene practices                    
                </label>
                <input
                        className='form-input'
                        type="checkbox"
                        name="goodHygienePractices"
                        checked={formData.goodHygienePractices}
                        onChange={handleInputChange}
                />
            </div>
            <div className="form-row">
                <label className='form-label'>
                    Complementary feeding                    
                </label>
                <input
                        className='form-input'
                        type="checkbox"
                        name="complementaryFeeding"
                        checked={formData.complementaryFeeding}
                        onChange={handleInputChange}
                />
            </div>
            <div className="form-row">
                <label className='form-label'>
                    Health seeking behavior                    
                </label>
                <input
                        className='form-input'
                        type="checkbox"
                        name="healthSeekingBehavior"
                        checked={formData.healthSeekingBehavior}
                        onChange={handleInputChange}
                />
            </div>
            <div className="form-row">
                <label className='form-label'>
                    Growth monitoring
                </label>
                <input
                        className='form-input'
                        type="checkbox"
                        name="growthMonitoring"
                        checked={formData.growthMonitoring}
                        onChange={handleInputChange}
                />
            </div>
            <div className="form-row">
                <label className='form-label'>
                    Kitchen gardens and fruit trees
                </label>
                <input
                        className='form-input'
                        type="checkbox"
                        name="kitchenGardens"
                        checked={formData.kitchenGardens}
                        onChange={handleInputChange}
                />
            </div>
            <div className="form-row">
                <label className='form-label'>
                    Cooking Demonstration                    
                </label>
                <input
                        className='form-input'
                        type="checkbox"
                        name="cookingDemonstration"
                        checked={formData.cookingDemonstration}
                        onChange={handleInputChange}
                />
            </div>
            <div className="form-row">
                <label className='form-label'>
                    Pregnant                    
                </label>
                <input
                        className='form-input'
                        type="checkbox"
                        name="pregnant"
                        checked={formData.pregnant}
                        onChange={handleInputChange}
                />
            </div>
            <div className="form-row">
                <label className='form-label'> 
                    Lactating                    
                </label>
                <input
                        className='form-input'
                        type="checkbox"
                        name="lactating"
                        checked={formData.lactating}
                        onChange={handleInputChange}
                />
            </div>
            <div className="form-row">
                <label className='form-label'>Other</label>
                <input
                    className='form-input'
                    type="text"
                    name="other"
                    value={formData.other}
                    onChange={handleInputChange}
                />
            </div>
            <div className="button-container">
                <button type="submit">Complete</button>
                <button type="button" onClick={()=>{}}>Cancel</button>
            </div>
        </form>
    );
};

export default NutritionForm;
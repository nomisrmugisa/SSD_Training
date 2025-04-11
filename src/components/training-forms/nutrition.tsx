import React, { useState } from 'react';
import './formStyles.css';

const NutritionForm: React.FC<{ place: string; track: string; orgUnit: string; trackInstance: string }> = ({ place, track, orgUnit, trackInstance}) => {
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

    const [isLoading, setIsLoading] = useState(false);

    const handleInputChange =  (event) => {
        const { name, type, checked, value } =  event.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const generateEvent = async (length = 11) => {
        return new Promise((resolve) => {
            const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            let result = '';

            // Simulate async task (e.g., a delay)
            setTimeout(() => {
                for (let i = 0; i < length; i++) {
                    const randomIndex = Math.floor(Math.random() * characters.length);
                    result += characters[randomIndex];
                }

                // Create the event object with the generated random code
                resolve(result);  // Resolve the Promise with the generated code
            }, 100);  // Adding a small delay of 100ms
        });
    };

    const handleComplete = async () => {
        try {
            const event = await generateEvent();
            const payload = {
                "dataValues": [
                    { "value": formData.nutritionPregnancy, "dataElement": "FVIkGrGWz1s" },
                    { "value": formData.earlyInitiation, "dataElement": "URD2xr6Enhc" },
                    { "value": formData.breastfeedingFirst6Months, "dataElement": "LzFFXJl5Iqu" },
                    { "value": formData.exclusiveBreastfeeding, "dataElement": "ecFLn0i8QrL" },
                    { "value": formData.goodHygienePractices, "dataElement": "ijTViGLk6hP" },
                    { "value": formData.complementaryFeeding, "dataElement": "LzGN50sTSh3" },
                    { "value": formData.healthSeekingBehavior, "dataElement": "C2GoFXyTUj2" },
                    { "value": formData.growthMonitoring, "dataElement": "DK06Y2Viejs" },
                    { "value": formData.kitchenGardens, "dataElement": "NOIbysghola" },
                    { "value": formData.cookingDemonstration, "dataElement": "LhcJpqUzqcp" },
                    { "value": formData.pregnant, "dataElement": "stU3OZCy64s" },
                    { "value": formData.lactating, "dataElement": "NA1ZhjvX47L" },
                    { "value": formData.other, "dataElement": "TQLLkvvbCD2" }
                ],
                "event": event,
                "program": "kmfLZO8ckxY",
                "programStage": "DSFjQPPKuyM",
                "orgUnit": orgUnit, // "DGY1RFEb7sO",
                "trackedEntityInstance": trackInstance, //"kfJ7DFRjnuA",
                "status": "COMPLETED",
                "dueDate": formData.dueDate,
                "eventDate": formData.reportDate,
                "completedDate": new Date().toISOString().split('T')[0] // Today's date
            };

            const response = await fetch(process.env.REACT_APP_DHIS2_BASE_URL + 'api/events', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Basic ' + btoa('admin:Precommunicate30-#Helle17') // Replace with your authentication
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
        console.log('Nutrition Form submitted:', formData);
        // onClose();
        await handleComplete();
    };

    const resetForm = () => {
        setFormData({
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
            <div className="form-row track">
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
            <div className="form-row track">
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
            <div className="form-row track">
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
            <div className="form-row  track">
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
            <div className="form-row track">
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
            <div className="form-row track">
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
            <div className="form-row track">
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
            <div className="form-row track">
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
            <div className="form-row track">
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
            <div className="form-row track">
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
            <div className="form-row track">
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
            <div className="form-row track">
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
            <div className="form-row ">
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
                <button type="submit" disabled={isLoading}>
                    {isLoading ? 'Submitting...' : 'Complete'}
                </button>
                <button type="button" onClick={resetForm}>Cancel</button>
            </div>
        </form>
    );
};

export default NutritionForm;
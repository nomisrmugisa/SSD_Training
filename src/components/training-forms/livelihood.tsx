import React, { useState } from 'react';
import './formStyles.css';

const LivelihoodForm: React.FC<{ place: string; track: string }> = ({ place, track }) => {
    const [formData, setFormData] = useState({
        reportDate: '',
        dueDate: '',
        incomeEarned: '',
        estimatedCatch: '',
        yieldInKgs: '',
        landCultivated: '',
        processingMethod: '',
        fishingMethods: {
            fishingOilPreparation: false,
            fishingMarketing: false,
            fishingMethods: false,
        },
    });

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setFormData((prevData) => ({ ...prevData, [name]: value }));
    };

    const handleCheckboxChange = (event) => {
        const { name, checked } = event.target;
        setFormData((prevData) => ({
            ...prevData,
            fishingMethods: { ...prevData.fishingMethods, [name]: checked },
        }));
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        console.log('Form submitted:', formData);
        // onClose();
    };

    return (
        <form onSubmit={handleSubmit} className="form-container">
            <h2>Livelihood Form</h2>
            <div className="form-row">
                <label 
                    className='form-label'
                    // style={{ marginLeft: '-50px'}}
                >
                Place
                </label>
                <span
                    // style={{ marginLeft: '400px'}}
                ><b>{place}</b></span>
            </div>
            <div className="form-row">
                <label 
                    className='form-label'
                    style={{ marginLeft: '-100px' }}   
                >Track</label>
                <span
                    // style={{ marginLeft: '375px'}}
                ><b>{track}</b></span>
            </div>
            <div className="form-row">
                <label 
                    className='form-label'
                    // style={{ marginLeft: '-140px'}}
                >Report Date</label>
                <input
                    className='form-data'
                    type="date"
                    name="reportDate"
                    value={formData.reportDate}
                    onChange={handleInputChange}
                    // style={{ marginLeft: '250px'}}
                    required
                />
            </div>
            <div className="form-row">
                <label 
                    className='form-label'
                    // style={{ marginLeft: '-160px'}}    
                >Due Date</label>
                <input
                    className='form-data'
                    type="date"
                    name="dueDate"
                    value={formData.dueDate}
                    onChange={handleInputChange}
                    // style={{ marginLeft: '250px'}}
                    required
                />
            </div>
            <div className="form-row">
                <label
                    // style={{ marginLeft: '-180px'}}
                >
                    Topic Trained On: Fishing Oil Preparation
                    
                </label>
                <input
                        type="checkbox"
                        name="fishingOilPreparation"
                        className='form-data'
                        checked={formData.fishingMethods.fishingOilPreparation}
                        // style={{ marginLeft: '152px'}}
                        onChange={handleCheckboxChange}
                        
                    />
            </div>
            <div className="form-row">
                <label
                    // style={{ marginLeft: '-283px'}}
                >
                Topic Trained On: Fishing Marketing and <br /> Record Keeping                    
                </label>
                <input
                        type="checkbox"
                        name="fishingMarketing"
                        className='form-data'
                        checked={formData.fishingMethods.fishingMarketing}
                        style={{ marginLeft: '50px'}}
                        onChange={handleCheckboxChange}
                    />
            </div>
            <div className="form-row">
                <label
                    // style={{ marginLeft: '-250px'}}
                >
                    Topic Trained On: Fishing Methods
                    
                </label>
                <input
                        type="checkbox"
                        name="fishingMethods"
                        className='form-data'
                        checked={formData.fishingMethods.fishingMethods}
                        // style={{ marginLeft: '124px'}}
                        onChange={handleCheckboxChange}
                    />
            </div>
            <div className="form-row">
                <label
                    // style={{ marginLeft: '-52px'}}
                >Income earned/week</label>
                <input
                    type="number"
                    name="incomeEarned"
                    className='form-data'
                    value={formData.incomeEarned}
                    onChange={handleInputChange}
                    // style={{ marginLeft: '250px'}}
                    required
                />
            </div>
            <div className="form-row">
                <label
                    // style={{ marginLeft: '-145px'}}
                >Estimated fish catch in kgs per week</label>
                <input
                    type="number"
                    name="estimatedCatch"
                    className='form-data'
                    value={formData.estimatedCatch}
                    // style={{ marginLeft: '50px'}}
                    onChange={handleInputChange}
                />
            </div>
            <div className="form-row">
                <label
                    // style={{ marginLeft: '-215px'}}
                >Yield in Kgs</label>
                <input
                    type="number"
                    name="yieldInKgs"
                    className='form-data'
                    value={formData.yieldInKgs}
                    // style={{ marginLeft: '150px'}}
                    onChange={handleInputChange}
                />
            </div>
            <div className="form-row">
                <label
                    // style={{ marginLeft: '-110px'}}
                >Land Cultivated in Feddans</label>
                <input
                    type="number"
                    name="landCultivated"
                    className='form-data'
                    value={formData.landCultivated}
                    // style={{ marginLeft: '150px'}}
                    onChange={handleInputChange}
                />
            </div>
            <div className="form-row">
                <label
                    // style={{ marginLeft: '-165px'}}
                >Processing method</label>
                <input
                    type="text"
                    name="processingMethod"
                    className='form-data'
                    value={formData.processingMethod}
                    // style={{ marginLeft: '150px'}}
                    onChange={handleInputChange}
                />
            </div>
            <div className="button-container">
                <button 
                    type="submit"
                    // style={{ marginLeft: '-150px'}}
                >Complete</button>
                <button 
                    type="button" 
                    onClick={() => { }}
                    // style={{ marginLeft: '200px'}}
                >Cancel</button>
            </div>
        </form>
    );
};

export default LivelihoodForm;
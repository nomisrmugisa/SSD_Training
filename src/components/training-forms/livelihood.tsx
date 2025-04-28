import React, { useState } from 'react';

import './formStyles.css';
import { isNumber } from 'lodash';



const LivelihoodForm: React.FC<{ place: string; track: string; orgUnit: string; trackInstance: string }> = ({ place, track, orgUnit, trackInstance }) => {
    const [formData, setFormData] = useState({
        reportDate: '',
        dueDate: '',
        incomeEarned: '',
        yieldInKgs: '',
        caseStories: '',
        landCultivated: '',
        topicsTrainedOn: {
            harvesting: false,
            postHarvestHandling: false,
            landPreparation: false,
            nurseryPreparation: false,
            postHarvestHygiene: false,
            lossesMarking: false,
            weeding: false,
            storage: false,
        },
        fishingMethods: {
            fishingOilPreparation: false,
            fishingMarketing: false,
            fishingMethods: false,
            estimatedFishCatch: '',
        },
    });
    const [isLoading, setIsLoading] = useState(false);

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setFormData((prevData) => ({ ...prevData, [name]: value }));
    };

    const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = event.target;

        if (track === 'Fisher' && name in formData.fishingMethods) {
            setFormData((prevData) => ({
                ...prevData,
                fishingMethods: { ...prevData.fishingMethods, [name]: checked },
            }));
        } else if (track === 'Farmer' && name in formData.topicsTrainedOn) {
            setFormData((prevData) => ({
                ...prevData,
                topicsTrainedOn: { ...prevData.topicsTrainedOn, [name]: checked },
            }));
        }
    };

    const validateForm = (): boolean => {
        const requiredFields = ['reportDate', 'dueDate', 'incomeEarned'];
        for (const field of requiredFields) {
            if (!formData[field]) {
                alert(`${field.replace(/([A-Z])/g, ' $1')} is required!`);
                return false;
            }
        }
        return true;
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

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!validateForm()) return;
        setIsLoading(true);
        try {
            const eventGenerated = await generateEvent();
            console.log({"event": eventGenerated})
            const trackInstGenerated = await generateEvent();
            console.log({ event: eventGenerated });
            const payload = {
                dataValues: [
                    ...(track === 'Farmer'
                        ? [
                            { value: formData.topicsTrainedOn.harvesting ? 'true' : 'false', dataElement: 'RiNixd9BoZE' },
                            { value: formData.topicsTrainedOn.postHarvestHandling ? 'true' : 'false', dataElement: 'oLxkWBGjWkV' },
                            { value: formData.topicsTrainedOn.landPreparation ? 'true' : 'false', dataElement: 'Nmh0TPGuXWS' },
                            { value: formData.topicsTrainedOn.nurseryPreparation ? 'true' : 'false', dataElement: 'VyqyQ0BZISo' },
                            { value: formData.topicsTrainedOn.postHarvestHygiene ? 'true' : 'false', dataElement: 'EpaLpKMZj3y' },
                            { value: formData.topicsTrainedOn.lossesMarking ? 'true' : 'false', dataElement: 'aUrLyHqOf0n' },
                            { value: formData.topicsTrainedOn.weeding ? 'true' : 'false', dataElement: 'vVKfsZ8VgiG' },
                            { value: formData.topicsTrainedOn.storage ? 'true' : 'false', dataElement: 'YzlNvVyLIkn' },
                        ]
                        : [
                            { value: formData.fishingMethods.fishingOilPreparation ? 'true' : 'false', dataElement: 'erCm8YopB1D' },
                            { value: formData.fishingMethods.fishingMarketing ? 'true' : 'false', dataElement: 'QpLUEvB2sdy' },
                            { value: formData.fishingMethods.fishingMethods ? 'true' : 'false', dataElement: 'vsbH6WxHVrN' },
                            { value: formData.fishingMethods.estimatedFishCatch, dataElement: 'KjTJkoFvx93' },
                        ]),
                    // Shared Fields
                    { value: formData.incomeEarned, dataElement: 'td3WOxoQ4wN' },
                    { value: formData.yieldInKgs, dataElement: 'TCSKxlymcyD' },
                    { value: formData.caseStories, dataElement: 'sQShE9oP513' },
                    { value: formData.landCultivated, dataElement: 'PKxWHlkevrG' },
                ],
                event: eventGenerated, // 'UeeUgRVfAIs', //'Hm7ps1SGHZ0',
                program: 'n2iAPy3PGx7',
                programStage: 'H0vCgsI1d4M',
                orgUnit: orgUnit, //'DGY1RFEb7sO',
                trackedEntityInstance: trackInstance, 
                status: 'COMPLETED',
                dueDate: formData.dueDate,
                eventDate: formData.reportDate,
                completedDate: new Date().toISOString().split('T')[0],
            };

            console.log('Payload:', payload);

            const response = await fetch(`${process.env.REACT_APP_DHIS2_BASE_URL}api/events`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Authorization: `Basic ${btoa(process.env.REACT_APP_DHIS2_AUTH)}`,
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || response.statusText);
            }

            const data = await response.json();
            console.log('Data submitted successfully:', data);
            alert('Form submitted successfully!');
        } catch (error) {
            console.error('Error submitting data:', error);
            alert('Error submitting form. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="form-container">
            <h2>Livelihood Form</h2>
            <div className="form-row">
                <label className="form-label">Place</label>
                <span><b>{place}</b></span>
            </div>
            <div className="form-row">
                <label
                    className="form-label"
                    style={{ marginRight: '100px' }}
                >Track</label>
                <span style={{ marginRight: '50px' }}><b>{track}</b></span>
            </div>
            <div className="form-row">
                <label>Report Date</label>
                <input
                    type="date"
                    name="reportDate"
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
                    value={formData.dueDate}
                    onChange={handleInputChange}
                    required
                />
            </div>
            {track === 'Farmer' &&
                Object.keys(formData.topicsTrainedOn).map((topic) => (
                    <div className="form-row trackFarmer" key={topic}>
                        <label>Topic Trained On: {topic.replace(/([A-Z])/g, ' $1')}</label>
                        <input
                            type="checkbox"
                            name={topic}
                            checked={formData.topicsTrainedOn[topic as keyof typeof formData.topicsTrainedOn]}
                            onChange={handleCheckboxChange}
                        />
                    </div>
                ))}
            {/* {track === 'Fisher' &&
                Object.keys(formData.fishingMethods).map((method) => (
                    <div className="form-row trackFisher" key={method}>
                        <label>Fishing Method: {method.replace(/([A-Z])/g, ' $1')}</label>
                        <input
                            type="checkbox"
                            name={method}
                            checked={formData.fishingMethods[method as keyof typeof formData.fishingMethods]}
                            onChange={handleCheckboxChange}
                        />
                    </div>
                ))} */}

            {track === 'Fisher' &&
                Object.keys(formData.fishingMethods).map((method) => (
                    <div className="form-row trackFisher" key={method}>
                        <label className='estCatch'>
                            {method === 'estimatedFishCatch'
                                ? 'Estimated Fish Catch (in Kgs)'
                                : `Fishing Method: ${method.replace(/([A-Z])/g, ' $1')}`}
                        </label>
                        {method === 'estimatedFishCatch' ? (
                            <input
                                type="text" // Use text input to allow strings
                                name={method}
                                value={formData.fishingMethods[method] || ''}
                                style={{ marginRight: '-120px'}}
                                onChange={(event) => {
                                    const { value } = event.target;
                                    setFormData((prevData) => ({
                                        ...prevData,
                                        fishingMethods: {
                                            ...prevData.fishingMethods,
                                            [method]: value, // Store the value as a string
                                        },
                                    }));
                                }}
                            />
                        ) : (
                            <input
                                type="checkbox"
                                name={method}
                                checked={!!formData.fishingMethods[method as keyof typeof formData.fishingMethods]}
                                onChange={handleCheckboxChange}
                            />
                        )}
                    </div>
                ))}



            <div className="form-row">
                <label>Income Earned/Week</label>
                <input
                    type="number"
                    name="incomeEarned"
                    value={formData.incomeEarned}
                    onChange={handleInputChange}
                    required
                />
            </div>
            <div className="form-row">
                <label>Yield in Kgs</label>
                <input
                    type="number"
                    name="yieldInKgs"
                    value={formData.yieldInKgs}
                    onChange={handleInputChange}
                />
            </div>
            <div className="form-row">
                <label>Case Stories Generated</label>
                <input
                    type="number"
                    name="caseStories"
                    value={formData.caseStories}
                    onChange={handleInputChange}
                />
            </div>
            <div className="form-row">
                <label>Land Cultivated in Feddans</label>
                <input
                    type="number"
                    name="landCultivated"
                    value={formData.landCultivated}
                    onChange={handleInputChange}
                />
            </div>
            <div className="button-container">
                <button type="submit" disabled={isLoading}>
                    {isLoading ? 'Submitting...' : 'Complete'}
                </button>
                <button
                    type="button"
                    onClick={() =>
                        setFormData({
                            reportDate: '',
                            dueDate: '',
                            incomeEarned: '',
                            yieldInKgs: '',
                            caseStories: '',
                            landCultivated: '',
                            topicsTrainedOn: {
                                harvesting: false,
                                postHarvestHandling: false,
                                landPreparation: false,
                                nurseryPreparation: false,
                                postHarvestHygiene: false,
                                lossesMarking: false,
                                weeding: false,
                                storage: false,
                            },
                            fishingMethods: {
                                fishingOilPreparation: false,
                                fishingMarketing: false,
                                fishingMethods: false,
                                estimatedFishCatch: '',
                            },
                        })
                    }
                >
                    Cancel
                </button>
            </div>
        </form>
    );
};

export default LivelihoodForm;

import { useEffect, useState } from 'react';
import axios from 'axios';
import { saveAs } from 'file-saver';

import { Header } from '../header';
import { Table, TablePagination } from '../common/table';
import { orgUnitDetailsColumns } from '../../table/org-unit-details';
import { OrgUnitDetails } from '../../types/org-unit-details';
import { useTable } from '../../hooks/use-table';
import { useHistory } from 'react-router-dom';
import Modal from '../common/modal/modal';
import React from 'react';

import LivelihoodForm from '../training-forms/livelihood';
import WaterSanitationForm from '../training-forms/waterSanitation';
import NutritionForm from '../training-forms/nutrition';

import '../org-unit-about/form-styles.css';

type Props = {
    orgUnitDetails: OrgUnitDetails[];
    orgUnitId: string;
};

export function OrgUnitTable(props: Props) {
    const credentials = btoa(`admin:Precommunicate30-#Helle17}`);
    const [search, setSearch] = useState('');
    const history = useHistory();
    const [formVisible, setFormVisible] = useState(false);
    const [trigger, setTrigger] = useState(0); // State to trigger useEffect
    const [isLoading, setIsLoading] = useState(false); // loader for getting code
    const [userData, setUserData] = useState({
        username: '',
        surname: '',
        firstName: '',
        id: ''
    });
    const [formData, setFormData] = useState({
        recordDate: '',
        track: '',
        inactive: '',
        beneficiaryStage: '',
        careGiver: '',
        careGiverAge: '',
        patientID: '',
        firstMiddleName: '',
        surname: '',
        topicTrainedOn: '',
        beneficiaryName: '',
        nonBeneficiaryName: '',
        sex: '',
        age: '',

    }); // Add initial form data
    // console.log("orgUnitDetails", props.orgUnitDetails);
    const [message, setMessage] = useState(null); // State for success or error message
    const [isError, setIsError] = useState(false); // State to track if the message is an error
    const [loading, setLoading] = useState(false); //loader for saving entry
    const [orgUnitCode, setOrgUnitcode] = useState('');
    const table = useTable({
        data: props.orgUnitDetails,
        columns: orgUnitDetailsColumns(credentials, setMessage, setIsError),
        globalFilter: search,
        setGlobalFilter: setSearch,
    });

    const [selectedFilter, setSelectedFilter] = useState(''); // State for radio button selection
    const [beneficiaryFilter, setBeneficiaryFilter] = useState(''); // State for beneficiary dropdown
    const [placeFilter, setPlaceFilter] = useState(''); // State for place search
    const [dateFilter, setDateFilter] = useState(''); // State for date search
    const [trackFilter, setTrackFilter] = useState(''); // State for track search
    const [beneficiarySearch, setBeneficiarySearch] = useState(''); // State for beneficiary search
    const [searchResults, setSearchResults] = useState([]); // State for search results
    const [isModalVisible, setIsModalVisible] = useState(false); // State for modal visibility

    // New state variables for filters
    const [trainingFilter, setTrainingFilter] = useState('');

    const [selectedRecord, setSelectedRecord] = useState(null); // State to hold the selected record
    const [showFilterForm, setShowFilterForm] = useState(false); // State to control filter form visibility

    // Function to handle beneficiary search
    const handleBeneficiarySearch = async (event) => {
        if (event.key === 'Enter') {
            try {
                const response = await fetch(`http://localhost:5001/api/trackedEntityInstances/query.json?ou=${props.orgUnitId}&ouMode=ACCESSIBLE&program=kmfLZO8ckxY&attribute=tUjM7KxKvCO:LIKE:${beneficiarySearch}&attribute=FwEpAEagGeK:LIKE:${trackFilter}&pageSize=50&page=1&totalPages=false`);
                const data = await response.json();
                setSearchResults(data.rows); // Set the search results
                setIsModalVisible(true); // Show the modal
                console.log(trackFilter);
                // console.log({searchResults})
            } catch (error) {
                console.error('Error fetching search results:', error);
            }
        }
    };

    // Function to close the modal
    const closeModal = () => {
        setIsModalVisible(false);

        setBeneficiarySearch(''); // Reset search input
        setSelectedRecord(null); // Reset selected record
        setShowFilterForm(false); // Hide filter form
    };

    const handleRecordClick = (record) => {
        setSelectedRecord(record); // Set the selected record
        setShowFilterForm(true); // Show the filter form
        console.log({ record });
    };

    // Function to handle training filter change
    const handleTrainingChange = async (event) => {
        await setTrainingFilter(event.target.value);
        // Fetch data based on the selected training type
        // Implement your data fetching logic here
    };

    // Function to handle place filter change
    const handlePlaceChange = async (event) => {
        await setPlaceFilter(event.target.value);
        // Implement your data fetching logic here
    };

    // Function to handle date filter change
    const handleDateChange = async (event) => {
        await setDateFilter(event.target.value);
        // Implement your data fetching logic here
    };

    // Function to handle track filter change
    const handleTrackChange = async (event) => {
        await setTrackFilter(event.target.value);
        // Implement your data fetching logic here
    };

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);

            try {
                // First request: Fetch the organization unit code
                const orgUnitCodeResponse = await fetch(
                    `${process.env.REACT_APP_DHIS2_BASE_URL}/api/organisationUnits/${props.orgUnitId}`,
                    // `/api/organisationUnits/${props.orgUnitId}`,
                    {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Basic ${credentials}`,
                        },
                    }
                );
                const orgUnitCodeData = await orgUnitCodeResponse.json();
                const orgUnitCode = orgUnitCodeData.code;
                setOrgUnitcode(orgUnitCode);

                // Wait for the orgUnitCode to be set before making the second request
                if (orgUnitCode) {
                    // Second request: Fetch the generated code using the organization unit code
                    const codeResponse = await fetch(
                        `${process.env.REACT_APP_DHIS2_BASE_URL}/api/trackedEntityAttributes/oqabsHE0ZUI/generate?ORG_UNIT_CODE=${orgUnitCode}`,
                        // `/api/trackedEntityAttributes/oqabsHE0ZUI/generate?ORG_UNIT_CODE=${orgUnitCode}`,
                        {
                            method: 'GET',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Basic ${credentials}`,
                            },
                        }
                    );
                    const codeData = await codeResponse.json();

                    // If the response contains a value, update the formData
                    if (codeData && codeData.value) {
                        setFormData((prevFormData) => ({
                            ...prevFormData,
                            code: codeData.value,
                        }));
                    }
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [trigger]);

    const onAdd = () => {
        setFormVisible(true);
        setTrigger(prevTrigger => prevTrigger + 1);
    }

    // Function to fetch a new ID
    const fetchNewId = async () => {
        try {
            const response = await fetch(
                `${process.env.REACT_APP_DHIS2_BASE_URL}/api/system/id?`,
                // `/api/system/id?`, //with proxy
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Basic ${credentials}`,
                    },
                });
            const data = await response.json();
            return data.codes[0];
        } catch (error) {
            console.error('Error fetching new ID:', error);
            return null;
        }
    };

    // Function to fetch user
    const fetchUser = async () => {
        try {
            const response = await fetch(
                `${process.env.REACT_APP_DHIS2_BASE_URL}/api/me`,
                // `/api/me`, //with proxy
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Basic ${credentials}`,
                    },
                });
            const data = await response.json();
            const userData = {
                username: data.username,
                surname: data.surname,
                firstName: data.firstName,
                id: data.id
            };
            setUserData(userData);

            return userData;

        } catch (error) {
            console.error('Error fetching user:', error);
            return null;
        }
    };


    const generateTrackInstId = async (length = 11): Promise<string> => {
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

    const handleFormSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        // console.log("formData", formData)
        setLoading(true);

        // Fetch new ID for the event
        const newId = await generateTrackInstId();
        // if (!newId) {
        //     console.error('Failed to generate a new trackedEntityInstance ID.');
        //     setLoading(false);
        //     setMessage('Failed to generate a new trackedEntityInstance ID.');
        //     return;
        // }
        // console.log("id", newId)

        // Fetch new ID for the event
        const userData = await fetchUser();
        if (!userData) {
            console.error('Failed to get username.');
            setLoading(false);
            setMessage('Failed to get username.');
            return;
        }

        const enteredValues = {
            created: new Date().toISOString(),
            orgUnit: props.orgUnitId,
            createdAtClient: new Date().toISOString(),
            trackedEntityInstance: newId,
            lastUpdated: new Date().toISOString(),
            trackedEntityType: "b8gedH8Po5d",
            lastUpdatedAtClient: new Date().toISOString(),
            storedBy: "admin",// userData.username
            potentialDuplicate: false,
            deleted: false,
            inactive: false,
            featureType: "NONE",
            lastUpdatedByUserInfo:
            {
                uid: "M5zQapPyTZI",//userData.id,
                firstName: "admin",//userData.firstName,
                surname: "admin",//userData.surname,
                username: "admin",//userData.username
            },
            createdByUserInfo:
            {
                uid: "M5zQapPyTZI",//userData.id,
                firstName: "admin",//userData.firstName,
                surname: "admin",//userData.surname,
                username: "admin",//userData.username
            },
            programOwners: [],
            relationships: [],

            attributes: [
                { "attribute": "FwEpAEagGeK", "value": formData.track }, //hcyi8QjEwyW
                { "attribute": "IVvy19BmIOw", "value": formData.sex },

                { "attribute": "lvpNOLmDEEG", "value": formData.age },                
                { "attribute": "r0AIdmEpPN9", "value": formData.recordDate },
                // { "attribute": "tUjM7KxKvCO", "value": formData.beneficiaryName },
                // { "attribute": "lvpNOLmDEEG", "value": formData.nonBeneficiaryName },
                // { "attribute": "xts0QtWHpnK", "value": formData.inactive },
                { "attribute": "OWR8KrtfN3n", "value": formData.topicTrainedOn},

                { "attribute": "m35qF41KIdK", "value": formData.patientID},
                { "attribute": "PQEHpxr8tzp", "value": formData.careGiver },
                { "attribute": "kfyR35y3k3E", "value": formData.careGiverAge },
                { "attribute": "KmxskLLhS0k", "value": formData.beneficiaryStage },                
                { "attribute": "tUjM7KxKvCO", "value": formData.firstMiddleName },
                { "attribute": "xts0QtWHpnK", "value": formData.surname },
            ],
            enrollments: [
                {
                    program: 'kmfLZO8ckxY',
                    orgUnit: props.orgUnitId,
                    enrollmentDate: new Date().toISOString(),
                    incidentDate: new Date().toISOString()
                }
            ]

        }


        try {
            const response = await fetch(
                `${process.env.REACT_APP_DHIS2_BASE_URL}/api/trackedEntityInstances?`,
                // `/api/trackedEntityInstances?`, //wth proxy
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        // 'Authorization': `Basic ${credentials}`,
                    },
                    body: JSON.stringify(enteredValues),
                });

            if (!response.ok) {
                throw new Error('Failed to post data');
            }

            // Hide the form after submission
            setFormData({
                recordDate: '',
                track: '',
                inactive: '',
                beneficiaryStage: '',
                careGiver: '',
                careGiverAge: '',
                patientID: '',
                firstMiddleName: '',
                surname: '',
                topicTrainedOn: '',
                beneficiaryName: '',
                nonBeneficiaryName: '',
                sex: '',
                age: '',
        
            }); // Reset form data
            setDateFilter('');
            setMessage('Data successfully saved!');
            setIsError(false);
        } catch (error) {
            console.error('Error posting data:', error);
            setMessage('Error saving data. Please try again.');
            setIsError(true);
        }
        setLoading(false);
    }

    const handleInputChange = async (event) => {
        const { name, value } = event.target;
        setFormData((prevData) => ({ ...prevData, [name]: value }));
    }


    // Function to convert the array of arrays (rows) to CSV
    const jsonToCSV = (rows) => {
        if (!rows || !Array.isArray(rows) || rows.length === 0) {
            throw new Error('No valid data available to convert to CSV');
        }

        const csvRows = [];

        // Extract headers from the first row (if applicable)
        const headers = rows[0]; // First array in 'rows' assumed to be headers
        csvRows.push(headers.join(',')); // Join headers with commas

        // Process the remaining rows (data)
        for (let i = 1; i < rows.length; i++) {
            const row = rows[i];
            const csvRow = row.map(value => {
                const escaped = ('' + value).replace(/"/g, '\\"'); // Escape quotes in values
                return `"${escaped}"`; // Wrap each value in quotes
            });
            csvRows.push(csvRow.join(',')); // Join each row's values with commas
        }

        return csvRows.join('\n'); // Join all rows with a new line character
    };

    // Handle the download button click
    const handleDownloadCSV = async (orgUnit) => {
        try {
            // Send a POST request with orgUnitId in the body
            const response = await axios.post('http://localhost:5001/trackedEntityInstances', {
                orgUnitId: orgUnit // Sending orgUnitId in the body
            });

            // Log the API response for debugging
            console.log('API Response:', response.data);

            // Extract rows from the response
            const rows = response.data.rows;

            if (!rows || !Array.isArray(rows) || rows.length === 0) {
                throw new Error('API returned invalid or empty data');
            }

            // Convert rows to CSV format
            const csv = jsonToCSV(rows);

            // Create a blob and trigger download
            const blob = new Blob([csv], { type: 'text/csv' });
            saveAs(blob, 'tracked_entity_instances.csv'); // Change the name as needed

        } catch (error) {
            console.error('Error fetching data or generating CSV:', error);
        }
    };

    const resetForm = () => {
        setFormVisible(false);
        setFormData({
            recordDate: '',
            track: '',
            inactive: '',
            beneficiaryStage: '',
            careGiver: '',
            careGiverAge: '',
            patientID: '',
            firstMiddleName: '',
            surname: '',
            topicTrainedOn: '',
            beneficiaryName: '',
            nonBeneficiaryName: '',
            sex: '',
            age: '',
    
        });
        setSelectedFilter('');
    }

    return (
        <main className="space-y-4">
            {/* <Header
                onAdd={onAdd}
            // onDownloadCSV={() => handleDownloadCSV('')}
            /> */}

            {/* Training Filters */}
            <h5 style={{ padding: '10px' }}>Training</h5>
            <div className="flex space-x-4" style={{
                padding: '0px 10px 10px 10px',
                display: 'flex', gap: '15px'
            }}>
                <label style={{ display: 'flex', gap: '3px' }}>
                    <input
                        type="radio"
                        value="Livelihood"
                        checked={trainingFilter === 'Livelihood'}
                        onChange={handleTrainingChange}
                    />
                    Livelihood
                </label>
                <label style={{ display: 'flex', gap: '3px' }}>
                    <input
                        type="radio"
                        value="Water Sanitation & Hygiene"
                        checked={trainingFilter === 'Water Sanitation & Hygiene'}
                        onChange={handleTrainingChange}
                    />
                    Water Sanitation & Hygiene
                </label>
                <label style={{ display: 'flex', gap: '3px' }}>
                    <input
                        type="radio"
                        value="Nutrition"
                        checked={trainingFilter === 'Nutrition'}
                        onChange={handleTrainingChange}
                    />
                    Nutrition
                </label>
            </div>

            {/* Search Input for Beneficiary and other Filters */}
            <div className="flex space-x-4" style={{
                padding: '10px',
                display: 'flex', gap: '15px'
            }}>
                <input
                    type="text"
                    placeholder="Search Beneficiary"
                    value={beneficiarySearch}
                    onChange={(e) => setBeneficiarySearch(e.target.value)}
                    onKeyDown={handleBeneficiarySearch}
                    className="border border-gray-300 rounded-md p-2"
                    style={{ borderRadius: '5px' }}
                />

                <button
                    type="button"
                    // onChange={handlePlaceChange}
                    onClick={onAdd}
                    className="border border-gray-300 rounded-md p-2"
                    style={{ borderRadius: '5px' }}
                >
                    Non Beneficiary
                </button>    

                {/* <input
                    type="text"
                    placeholder="Place"
                    value={placeFilter}
                    onChange={handlePlaceChange}
                    className="border border-gray-300 rounded-md p-2"
                    style={{ borderRadius: '5px' }}
                /> */}
                {/* <input
                    type="date"
                    value={dateFilter}
                    onChange={handleDateChange}
                    className="border border-gray-300 rounded-md p-2"
                    style={{ borderRadius: '5px' }}
                /> */}
                {/* <select
                    value={trackFilter}
                    onChange={(e) => setTrackFilter(e.target.value)}
                    // onKeyDown={handleBeneficiarySearch}
                    className="border border-gray-300 rounded-md p-2"
                    style={{ borderRadius: '5px' }}
                >
                    <option value="Select Tracker">Select Tracker</option>
                    <option value="Fisher">Fisher</option>
                    <option value="Farmer">Farmer</option>
                </select> */}


            </div>

            {/* Modal for Search Results */}
            {isModalVisible && (
                <Modal
                    // onClose={closeModal}

                    orgUnitId={props.orgUnitId}
                    trackInstanceId={''}
                    trainingFilter={trainingFilter}
                    LivelihoodForm={LivelihoodForm}
                    WaterSanitationForm={WaterSanitationForm}
                    NutritionForm={NutritionForm}

                >
                    <h2>Person Search Results</h2>
                    <table className="min-w-full border-collapse border border-gray-300">
                        <thead>
                            <tr>
                                <th className="border border-gray-300">Registering unit</th>
                                <th className="border border-gray-300">Registration date</th>
                                <th className="border border-gray-300">Inactive</th>
                                <th className="border border-gray-300">First Name and Middle Name</th>
                                <th className="border border-gray-300">Patient ID #</th>
                                <th className="border border-gray-300">Surname</th>
                                <th className="border border-gray-300">Age</th>
                                <th className="border border-gray-300">Date of Birth</th>
                                <th className="border border-gray-300">Sex</th>
                                <th className="border border-gray-300">Beneficiary Track</th>


                            </tr>
                        </thead>
                        <tbody>
                            {searchResults.map((row, index) => (
                                <tr key={index} onClick={() => handleRecordClick(row)}>
                                    <td className="border border-gray-300">{row[4]}</td>
                                    <td className="border border-gray-300">{row[1]}</td>
                                    <td className="border border-gray-300">{"No"}</td>
                                    <td className="border border-gray-300">{row[8]}</td>
                                    <td className="border border-gray-300">{row[12]}</td>
                                    <td className="border border-gray-300">{row[13]}</td>
                                    <td className="border border-gray-300">{row[14]}</td>
                                    <td className="border border-gray-300">{row[15]}</td>
                                    <td className="border border-gray-300">{row[16]}</td>
                                    <td className="border border-gray-300">{row[18]}</td>

                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {showFilterForm && selectedRecord && (
                        <div>
                            {/* Render the specific filter form based on the selected record */}

                            {trainingFilter === 'Livelihood' && (
                                <LivelihoodForm
                                    place={selectedRecord[4]}
                                    track={selectedRecord[18]}
                                    orgUnit={props.orgUnitId}
                                    trackInstance={selectedRecord[0]}
                                />
                            )}
                            {trainingFilter === 'Water Sanitation & Hygiene' && (
                                <WaterSanitationForm
                                    place={selectedRecord[4]}
                                    track={selectedRecord[18]}
                                    orgUnit={props.orgUnitId}
                                    trackInstance={selectedRecord[0]}
                                />
                            )}
                            {trainingFilter === 'Nutrition' && (
                                <NutritionForm
                                    place={selectedRecord[4]}
                                    track={selectedRecord[18]}
                                    orgUnit={props.orgUnitId}
                                    trackInstance={selectedRecord[0]}
                                />
                            )}
                        </div>
                    )}
                </Modal>
            )}

            {loading && <div className="mt-4">
                <div className="loader-container">
                    <div className="spinner"></div>
                    <p>Saving Entry...</p>
                </div>
            </div>}

            {message && (
                <div className={isError ? 'error-message' : 'success-message'}>
                    {message}
                </div>
            )}

            {/* Add record Section */}

            {formVisible && (
                <div className="form-container">
                    <form onSubmit={handleFormSubmit} className="form">
                        {/*loader for getting code*/}
                        {/* {isLoading ? (
                            <div className="mt-4">
                                <div className="loader-container"> */}
                        {/* <div className="spinner"></div> */}
                        {/* <p>Loading code, please wait...</p>
                                </div>
                            </div>
                        ) : ( */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Registration Date</label>
                            <input
                                type="date"
                                name="recordDate"
                                value={formData.recordDate}
                                onChange={handleInputChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                                required
                            />
                        </div>
                        {/*  )} */}
                        {/* <div>
                            <label className="block text-sm font-medium text-gray-700">Registering Unit</label>
                            <input
                                type="text"
                                name="topicTrainedOn"
                                value={formData.topicTrainedOn}
                                onChange={handleInputChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                            />
                        </div> */}
                        {/* <div>
                            <label className="block text-sm font-medium text-gray-700">Inactive</label>
                            <input
                                type="text"
                                name="inactive"
                                value={formData.inactive}
                                onChange={handleInputChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                                required
                            />
                        </div> */}
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Is Beneficiary an Adult or Child</label>
                            <select
                                name="beneficiaryStage"
                                value={formData.beneficiaryStage}
                                onChange={handleInputChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                                required
                            >
                                <option value=""></option>
                                <option value="Adult">Adult</option>
                                <option value="Child">Child</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Name of Care Giver</label>
                            <input
                                type="text"
                                name="careGiver"
                                value={formData.careGiver}
                                onChange={handleInputChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Age of Care Giver</label>
                            <input
                                type="text"
                                name="careGiverAge"
                                value={formData.careGiverAge}
                                onChange={handleInputChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                            />
                        </div>
                        {/* <div>
                            <label className="block text-sm font-medium text-gray-700">Gender of Care Giver</label>
                            <select
                                name="sex"
                                value={formData.sex}
                                onChange={handleInputChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                                required
                            >
                                <option value="">Sex</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                            </select>
                        </div> */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Patient ID</label>
                            <input
                                type="text"
                                name="patientID"
                                value={formData.patientID}
                                onChange={handleInputChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                            />
                        </div>    
                        <div>
                            <label className="block text-sm font-medium text-gray-700">First Name and Middle Name</label>
                            <input
                                type="text"
                                name="firstMiddleName"
                                value={formData.firstMiddleName}
                                onChange={handleInputChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                            />
                        </div> 
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Surname</label>
                            <input
                                type="text"
                                name="surname"
                                value={formData.surname}
                                onChange={handleInputChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700">SSD_Select Training</label>
                            <select
                                name="topicTrainedOn"
                                value={formData.topicTrainedOn}
                                onChange={handleInputChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                                required
                            >
                                <option value=""></option>
                                <option value="Livelihood">Livelihood</option>
                                <option value="Water Sanitation and Hygiene Promotion ">Water Sanitation and Hygiene Promotion</option>
                                <option value="Nutrition Centric Training">Nutrition Centric Training</option>
                            </select>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Name (Beneficiary)</label>
                            <input
                                type="text"
                                name="beneficiaryName"
                                value={formData.beneficiaryName}
                                onChange={handleInputChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                            />
                        </div>
                        {/* <div>
                            <label className="block text-sm font-medium text-gray-700">Name (Non Beneficiary)</label>
                            <input
                                type="text"
                                name="nonBeneficiaryName"
                                value={formData.nonBeneficiaryName}
                                onChange={handleInputChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                            />
                        </div> */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Sex</label>
                            <select
                                name="sex"
                                value={formData.sex}
                                onChange={handleInputChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                                required
                            >
                                <option value=""></option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Age</label>
                            <input
                                type="number"
                                name="age"
                                value={formData.age}
                                onChange={handleInputChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Track</label>
                            <select
                                name="track"
                                value={formData.track}
                                onChange={handleInputChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                                required
                            >
                                <option value=""></option>
                                <option value="Farmer">Farmer</option>
                                <option value="Fisher">Fisher</option>
                            </select>
                        </div><br></br>                        
                        
                        <div className="button-container">
                            <button 
                                type="submit" 
                                className="submit-button"
                                style={{ marginLeft: '5px' }}
                            >
                                Save & Continue
                            </button>
                            <button
                                type="button"
                                onClick={resetForm}
                                className="cancel-button"
                                style={{ marginRight: '200px' }}
                            >
                                Close
                            </button>
                        </div><br></br>
                    </form>
                </div>
            )}

            {!formVisible && <Table
                table={table}
                className="border border-gray-300 rounded-md shadow-md"
                onRowClick={(row) => {
                    const id = row.getValue('id');
                    history.push(`/${props.orgUnitId}/${id}/about`);
                }}
            />}
            {!formVisible && <TablePagination table={table} />}
        </main>

    );



}

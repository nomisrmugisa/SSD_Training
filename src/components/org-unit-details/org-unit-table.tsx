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
import './org-unit-table.css';

// import { InternetStatus } from '../common/InternetStatus';
// import { useOfflineSync } from '../../hooks/useOfflineSync';

type Props = {
    orgUnitDetails: OrgUnitDetails[];
    orgUnitId: string;

};

interface FetchedData {
    reportDate: string;
    dueDate: string;
    eventId: string;
    dataValues: { [key: string]: string }; // To hold the values for each data element
}

type ProgramStage = 'Livelihood' | 'Water Sanitation & Hygiene' | 'Nutrition' | '';

const PROGRAM_STAGE_MAPPING = {
    'Livelihood': 'j3I4HeeEL0K',
    'Water Sanitation & Hygiene': 'QAEEGAsJ5H7',
    'Nutrition': 'DSFjQPPKuyM'
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
        dob: '',
        orgUnit: '',
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

    const [newRowData, setNewRowData] = useState({
        id: '',
        trackInstanceId: '',
        recordDate: '',
        track: '',
        inactive: '',
        beneficiaryStage: '',
        careGiver: '',
        careGiverAge: '',
        patientID: '',
        first_middleName: '',
        surname: '',
        dob: '',
        orgUnit: '',
        // topicTrainedOn: '',
        beneficiaryName: '',
        nonBeneficiaryName: '',
        sex: '',
        age: '',
    });

    const [isAddingNewRow, setIsAddingNewRow] = useState(false);

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
    const [editableRows, setEditableRows] = useState<{ [key: string]: boolean }>({});
    const [originalValues, setOriginalValues] = useState<{ [key: string]: OrgUnitDetails }>({});

    const [selectedRecord, setSelectedRecord] = useState(null); // State to hold the selected record
    const [showFilterForm, setShowFilterForm] = useState(false); // State to control filter form visibility

    const [additionalColumns, setAdditionalColumns] = useState([]); // State to store additional columns
    // Initialize state for additional columns
    const [addColRow_lvh, setaddColRow_lvh] = useState({
        reportDate: '',
        dueDate: '',
        topicsTrainedOn: {
            harvesting: false,
            postHarvestHandling: false,
            landPreparation: false,
            nurseryPreparation: false,
            postHarvestHygiene: false,
            lossesMarking: false,
            weeding: false,
            storage: false,
            appliedLessons: '',
            increasedIncome: false,
            increasedProduction: false,
            newLivelihood: false,
            increasedSkills: false,
            increasedResilience: false,
            others: ''
        },
        fishingMethods: {
            fishingOilPreparation: false,
            fishingMarketing: false,
            fishingMethods: false,
            postHandlingMethods: false,
            appliedLessons: '',
            // estimatedFishCatch: '',
        },
        // incomeEarned: '',
        // yieldInKgs: '',
        // caseStories: '',
        // landCultivated: '',
        // Add other fields as necessary for Nutrition and Water Sanitation & Hygiene
    });

    const [addColRow_Wsh, setaddColRow_Wsh] = useState({
        reportDate: '',
        dueDate: '',
        foodSafety: false,
        promotersAttendance: false,
        personalHygiene: false,
        householdHygiene: false,
        cleanSafeWater: false,
        latrineDisposal: false,
    });

    const [addColRow_Nut, setaddColRow_Nut] = useState({
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

    const [columns, setColumns] = useState([]);

    const filterDataByDate = (data, selectedDate) => {
        if (!selectedDate) return data; // If no date is selected, return all data

        return data.filter(item => {
            const registrationDate = new Date(item.recordDate).toISOString().split('T')[0]; // Convert to YYYY-MM-DD format
            return registrationDate === selectedDate;
        });
    };

    // Filtered data based on the selected date
    // const filteredData = filterDataByDate(props.orgUnitDetails, dateFilter);
    const [filteredData, setFilteredData] = useState(props.orgUnitDetails);

    // const [fetchedDates, setFetchedDates] = useState<{ [key: string]: { reportDate: string; dueDate: string;[key: string]: string } }>({});
    const [fetchedDates, setFetchedDates] = useState<{ [key: string]: FetchedData }>({});
    const [currentFilter, setCurrentFilter] = useState<string>('');

    const [selectedProgramStage, setSelectedProgramStage] = useState<ProgramStage>('');
    const [filteredProgramData, setFilteredProgramData] = useState<any[]>([]);

    // handle date filtering
    useEffect(() => {
        setFilteredData(filterDataByDate(props.orgUnitDetails, dateFilter));
    }, [dateFilter, props.orgUnitDetails]);

    // handle track filtering
    useEffect(() => {
        if (trackFilter) {
            const filteredByTrack = props.orgUnitDetails.filter(item =>
                item.track === trackFilter
            );
            setFilteredData(filteredByTrack);
        } else {
            setFilteredData(props.orgUnitDetails);
        }
    }, [trackFilter, props.orgUnitDetails]);

    // Function to determine additional columns based on the training filter
    const getAdditionalColumns = (filter: string) => {
        const columns = [];
        switch (filter) {
            case 'Livelihood':
                if (trackFilter === 'Fisher') {
                    columns.push(
                        { Header: 'Report Date', accessor: 'reportDate' },
                        { Header: 'Due Date', accessor: 'dueDate' },
                        { Header: 'Fishing Oil Preparation', accessor: 'fishingOilPreparation_checkBox' },
                        { Header: 'Fishing Marketing', accessor: 'fishingMarketing_checkBox' },
                        { Header: 'Fishing Methods', accessor: 'fishingMethods_checkBox' },
                        { Header: 'Post Handling Methods', accessor: 'postHandlingMethods_checkBox' }, // Added
                        {
                            Header: 'Did you apply the lessons from fishery training in your life',
                            accessor: 'appliedLessons_dropdown'
                        }
                        // { Header: 'Estimated Fish Catch', accessor: 'estimatedFishCatch' },
                        // { Header: 'Income Earned/Week', accessor: 'incomeEarned' },
                        // { Header: 'Case Stories Generated', accessor: 'caseStories' }
                    );
                } else if (trackFilter === 'Farmer') {
                    columns.push(
                        { Header: 'Report Date', accessor: 'reportDate' },
                        { Header: 'Due Date', accessor: 'dueDate' },
                        { Header: 'Harvesting', accessor: 'harvesting_checkBox' },
                        { Header: 'Post Harvest Handling', accessor: 'postHarvestHandling_checkBox' },
                        { Header: 'Land Preparation', accessor: 'landPreparation_checkBox' },
                        { Header: 'Nursery Preparation', accessor: 'nurseryPreparation_checkBox' },
                        { Header: 'Post Harvest Hygiene', accessor: 'postHarvestHygiene_checkBox' },
                        { Header: 'Losses Marking', accessor: 'lossesMarking_checkBox' },
                        { Header: 'Weeding', accessor: 'weeding_checkBox' },
                        { Header: 'Storage', accessor: 'storage_checkBox' },
                        { Header: 'Did you apply the lessons from the farming trainings in your life', accessor: 'appliedLessons_dropdown' },
                        { Header: 'Increased income', accessor: 'increasedIncome_checkBox' },
                        { Header: 'Increased agricultural production', accessor: 'increasedProduction_checkBox' },
                        { Header: 'Started a new livelihood activity', accessor: 'newLivelihood_checkBox' },
                        { Header: 'Increased my skills/knowledge', accessor: 'increasedSkills_checkBox' },
                        { Header: 'Increased my family\'s resilience to shocks', accessor: 'increasedResilience_checkBox' },
                        { Header: 'Others (specify)', accessor: 'others_text' }
                        // Comment out these columns
                        // { Header: 'Income Earned/Week', accessor: 'incomeEarned' },
                        // { Header: 'Yield in Kgs', accessor: 'yieldKgs' },
                        // { Header: 'Case Stories Generated', accessor: 'caseStories' },
                        // { Header: 'Land Cultivated in Feddans', accessor: 'landCultivated' }
                    );
                }
                break;
            case 'Water Sanitation & Hygiene':
                columns.push(
                    { Header: 'Report Date', accessor: 'reportDate' },
                    { Header: 'Due Date', accessor: 'dueDate' },
                    { Header: 'Food Safety', accessor: 'foodSafety_checkBox' },
                    { Header: 'Promoters Attendance :1. CLTS', accessor: 'promotersAttendance_checkBox' },
                    { Header: 'Personal Hygiene', accessor: 'personalHygiene_checkBox' },
                    { Header: 'Household Hygene', accessor: 'householdHygiene_checkBox' },
                    { Header: 'Clean and Safe Water', accessor: 'cleanSafeWater_checkBox' },
                    { Header: 'Use of Latrine and Excreta Disposal', accessor: 'latrineDisposal_checkBox' },
                );
                break;
            case 'Nutrition':
                columns.push(
                    { Header: 'Report Date', accessor: 'reportDate' },
                    { Header: 'Due Date', accessor: 'dueDate' },
                    { Header: 'Nutrition during pregnancy and lactation', accessor: 'nutritionPregnancy_checkBox' },
                    { Header: 'Importance of early initiation of breastfeeding', accessor: 'earlyInitiation_checkBox' },
                    { Header: 'Breastfeeding in the first 6 months', accessor: 'breastfeedingFirst6Months_checkBox' },
                    { Header: 'Exclusive breastfeeding during the first 6 months', accessor: 'exclusiveBreastfeeding_checkBox' },
                    { Header: 'Good hygiene practices', accessor: 'goodHygiene_checkBox' },
                    { Header: 'Complementary feeding', accessor: 'complementaryFeeding_checkBox' },
                    { Header: 'Health seeking behavior', accessor: 'healthSeekingBehavior_checkBox' },
                    { Header: 'Growth monitoring', accessor: 'growthMonitoring_checkBox' },
                    { Header: 'Kitchen gardens and fruit trees', accessor: 'kitchenGardens_checkBox' },
                    { Header: 'Cooking Demonstration', accessor: 'cookingDemonstration_checkBox' },
                    { Header: 'Pregnant', accessor: 'pregnant_checkBox' },
                    { Header: 'Lactating', accessor: 'lactating_checkBox' },
                    { Header: 'Other', accessor: 'other' },
                );
                break;
            default:
                break;
        }

        // Add the "Add / Edit Event" column
        if (filter) {
            columns.push({ Header: 'Add / Edit Event', accessor: 'addEditEvent' });
        }

        return columns;
    };


    // Update additional columns when training filter changes
    useEffect(() => {
        setAdditionalColumns(getAdditionalColumns(trainingFilter));
    }, [trainingFilter]);

    const table = useTable({
        data: props.orgUnitDetails,
        columns: columns, // Use the dynamically set columns
        globalFilter: search,
        setGlobalFilter: setSearch,
    });

    // Function to handle beneficiary search
    const handleBeneficiarySearch = async (event) => {
        if (event.key === 'Enter') {
            try {
                const response = await fetch(`${process.env.REACT_APP_DHIS2_BASE_URL}/api/trackedEntityInstances/query.json?ou=${props.orgUnitId}&ouMode=ACCESSIBLE&program=kmfLZO8ckxY&attribute=tUjM7KxKvCO:LIKE:${beneficiarySearch}&attribute=FwEpAEagGeK:LIKE:${trackFilter}&pageSize=50&page=1&totalPages=false`);
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

    // New method to handle beneficiary name search
    const handleBeneficiarySearch1 = (event) => {
        const searchValue = event.target.value.toLowerCase();
        setBeneficiarySearch(searchValue);

        const filteredByName = props.orgUnitDetails.filter(item =>
            item.first_middleName.toLowerCase().includes(searchValue) ||
            item.surname.toLowerCase().includes(searchValue)
        );

        setFilteredData(filterDataByDate(filteredByName, dateFilter));
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

    const handleNewBeneficiaryClick = () => {
        setIsAddingNewRow(true);
    };
    // Function to handle training filter change
    const handleTrainingChange = async (event) => {
        await setTrainingFilter(event.target.value);
        // Fetch data based on the selected training type
        // Implement your data fetching logic here
    };

    // Function to handle place filter change
    const handlePlaceChange = (event) => {
        setPlaceFilter(event.target.value);
        // Implement your data fetching logic here
    };

    // Function to handle date filter change
    const handleDateChange = (event) => {
        setDateFilter(event.target.value);
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
        setLoading(true);

        // Generate track instance ID
        const newId = await generateTrackInstId();
        if (!newId) {
            console.error('Failed to generate a new trackedEntityInstance ID.');
            setLoading(false);
            setMessage('Failed to generate a new trackedEntityInstance ID.');
            return;
        }

        // Fetch user data
        const userData = await fetchUser();
        if (!userData) {
            console.error('Failed to get username.');
            setLoading(false);
            setMessage('Failed to get username.');
            return;
        }

        // First payload for tracked entity instance
        const payload1 = {
            trackedEntityType: "b8gedH8Po5d",
            orgUnit: props.orgUnitId,
            attributes: [
                { attribute: "FwEpAEagGeK", value: newRowData.track },
                { attribute: "IVvy19BmIOw", value: newRowData.sex },
                { attribute: "lvpNOLmDEEG", value: newRowData.age },
                { attribute: "m35qF41KIdK", value: newRowData.patientID },
                { attribute: "r0AIdmEpPN9", value: newRowData.dob },
                { attribute: "KmxskLLhS0k", value: newRowData.beneficiaryStage },
                { attribute: "tUjM7KxKvCO", value: newRowData.first_middleName },
                { attribute: "xts0QtWHpnK", value: newRowData.surname },
            ]
        };


        try {
            // First POST request - Create tracked entity instance
            const response1 = await fetch(
                `${process.env.REACT_APP_DHIS2_BASE_URL}/api/trackedEntityInstances`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        // 'Authorization': `Basic ${credentials}`,
                    },
                    body: JSON.stringify(payload1),
                }
            );

            if (!response1.ok) {
                throw new Error('Failed to create tracked entity instance');
            }

            const responseData = await response1.json();
            const trackedEntityInstance = responseData.response.importSummaries[0].reference;

            // Second payload for enrollment
            const payload2 = {
                trackedEntityInstance: trackedEntityInstance,
                program: "kmfLZO8ckxY",
                status: "ACTIVE",
                orgUnit: props.orgUnitId,
                enrollmentDate: newRowData.recordDate,
                incidentDate: new Date().toISOString()
            };

            // Second POST request - Create enrollment
            const response2 = await fetch(
                `${process.env.REACT_APP_DHIS2_BASE_URL}/api/enrollments`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        // 'Authorization': `Basic ${credentials}`,
                    },
                    body: JSON.stringify(payload2),
                }
            );

            if (!response2.ok) {
                throw new Error('Failed to create enrollment');
            }

            // Reset form and show success message
            setNewRowData({
                id: '',
                trackInstanceId: '',
                recordDate: '',
                track: '',
                inactive: '',
                beneficiaryStage: '',
                careGiver: '',
                careGiverAge: '',
                patientID: '',
                first_middleName: '',
                surname: '',
                dob: '',
                orgUnit: '',
                beneficiaryName: '',
                nonBeneficiaryName: '',
                sex: '',
                age: '',
            });
            setDateFilter('');
            setMessage('Beneficiary successfully created!');
            setIsError(false);
            setIsAddingNewRow(false); // Close the new row form

        } catch (error) {
            console.error('Error creating beneficiary:', error);
            setMessage('Error creating beneficiary. Please try again.');
            setIsError(true);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = async (event) => {
        const { name, value } = event.target;
        setFormData((prevData) => ({ ...prevData, [name]: value }));
    }

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
            dob: '',
            orgUnit: '',
            topicTrainedOn: '',
            beneficiaryName: '',
            nonBeneficiaryName: '',
            sex: '',
            age: '',

        });
        setSelectedFilter('');
    }

    // Function to handle the add action
    const handleAdd = (id: string) => {
        setEditableRows((prev) => ({ ...prev, [id]: true }));
        setOriginalValues((prev) => ({ ...prev, [id]: filteredData.find((d) => d.trackInstanceId === id) }));
    };

    // Function to handle the edit action
    const handleEdit = async (trackInstId: string) => {
        // Set the specific row to editable
        setEditableRows((prev) => ({ ...prev, [trackInstId]: true }));

        // Fetch additional data for the row being edited
        const activity = filteredData.find((d) => d.trackInstanceId === trackInstId);
        if (activity) {
            const additionalData = await fetchAdditionalData(activity.trackInstanceId, trainingFilter);
            // setFetchedDates(additionalData); // Store fetched dates in state
            // Set the fetched dates and data values in the expected structure
            setFetchedDates((prev) => ({
                ...prev,
                [trackInstId]: {
                    reportDate: additionalData.reportDate,
                    dueDate: additionalData.dueDate,
                    eventId: additionalData.eventId,
                    dataValues: additionalData.dataValues || {}, // Spread the data values
                },
            }));

        }
    };

    const generateEventID = (): string => {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        const charactersLength = characters.length;
        for (let i = 0; i < 11; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }

    // Function to handle save action
    const handleSave = async (trackInstId: string, id?: string) => {
        const isEditing = id !== undefined; // Check if we have an ID to determine if we're editing

        // Generate a new event ID if not editing
        const eventId = isEditing ? id : generateEventID();
        // Construct the payload based on the filter
        let payload;
        if (currentFilter === 'Livelihood') {
            payload = {
                dataValues: [
                    ...(newRowData.track === 'Farmer'
                        ? [
                            { value: addColRow_lvh.topicsTrainedOn.harvesting ? 'true' : 'false', dataElement: 'RiNixd9BoZE' },
                            { value: addColRow_lvh.topicsTrainedOn.postHarvestHandling ? 'true' : 'false', dataElement: 'oLxkWBGjWkV' },
                            { value: addColRow_lvh.topicsTrainedOn.landPreparation ? 'true' : 'false', dataElement: 'Nmh0TPGuXWS' },
                            { value: addColRow_lvh.topicsTrainedOn.nurseryPreparation ? 'true' : 'false', dataElement: 'VyqyQ0BZISo' },
                            { value: addColRow_lvh.topicsTrainedOn.postHarvestHygiene ? 'true' : 'false', dataElement: 'EpaLpKMZj3y' },
                            { value: addColRow_lvh.topicsTrainedOn.lossesMarking ? 'true' : 'false', dataElement: 'aUrLyHqOf0n' },
                            { value: addColRow_lvh.topicsTrainedOn.weeding ? 'true' : 'false', dataElement: 'vVKfsZ8VgiG' },
                            { value: addColRow_lvh.topicsTrainedOn.storage ? 'true' : 'false', dataElement: 'YzlNvVyLIkn' },
                            { value: addColRow_lvh.topicsTrainedOn.appliedLessons, dataElement: 'newDataElementId' },
                            { value: addColRow_lvh.topicsTrainedOn.increasedIncome ? 'true' : 'false', dataElement: 'newDataElementId' },
                            { value: addColRow_lvh.topicsTrainedOn.increasedProduction ? 'true' : 'false', dataElement: 'newDataElementId' },
                            { value: addColRow_lvh.topicsTrainedOn.newLivelihood ? 'true' : 'false', dataElement: 'newDataElementId' },
                            { value: addColRow_lvh.topicsTrainedOn.increasedSkills ? 'true' : 'false', dataElement: 'newDataElementId' },
                            { value: addColRow_lvh.topicsTrainedOn.increasedResilience ? 'true' : 'false', dataElement: 'newDataElementId' },
                            { value: addColRow_lvh.topicsTrainedOn.others, dataElement: 'newDataElementId' }
                        ]
                        : [
                            // Fisher track data elements remain unchanged
                        ]),
                    // Remove the commented out fields
                    // { value: addColRow_lvh.incomeEarned, dataElement: 'td3WOxoQ4wN' },
                    // { value: addColRow_lvh.yieldInKgs, dataElement: 'TCSKxlymcyD' },
                    // { value: addColRow_lvh.caseStories, dataElement: 'sQShE9oP513' },
                    // { value: addColRow_lvh.landCultivated, dataElement: 'PKxWHlkevrG' },
                ],
                event: eventId,
                program: 'kmfLZO8ckxY',
                programStage: 'j3I4HeeEL0K',
                orgUnit: props.orgUnitId,
                trackedEntityInstance: trackInstId,
                status: 'COMPLETED',
                dueDate: addColRow_lvh.dueDate,
                eventDate: addColRow_lvh.reportDate,
                completedDate: new Date().toISOString().split('T')[0],
            };
        } else if (currentFilter === 'Nutrition') {
            payload = {
                dataValues: [
                    { "value": addColRow_Nut.nutritionPregnancy, dataElement: 'FVIkGrGWz1s' },
                    { "value": addColRow_Nut.earlyInitiation, "dataElement": "URD2xr6Enhc" },
                    { "value": addColRow_Nut.breastfeedingFirst6Months, "dataElement": "LzFFXJl5Iqu" },
                    { "value": addColRow_Nut.exclusiveBreastfeeding, "dataElement": "ecFLn0i8QrL" },
                    { "value": addColRow_Nut.goodHygienePractices, "dataElement": "ijTViGLk6hP" },
                    { "value": addColRow_Nut.complementaryFeeding, "dataElement": "LzGN50sTSh3" },
                    { "value": addColRow_Nut.healthSeekingBehavior, "dataElement": "C2GoFXyTUj2" },
                    { "value": addColRow_Nut.growthMonitoring, "dataElement": "DK06Y2Viejs" },
                    { "value": addColRow_Nut.kitchenGardens, "dataElement": "NOIbysghola" },
                    { "value": addColRow_Nut.cookingDemonstration, "dataElement": "LhcJpqUzqcp" },
                    { "value": addColRow_Nut.pregnant, "dataElement": "stU3OZCy64s" },
                    { "value": addColRow_Nut.lactating, "dataElement": "NA1ZhjvX47L" },
                    { "value": addColRow_Nut.other, "dataElement": "TQLLkvvbCD2" }
                    // Add other fields as necessary
                ],
                event: eventId,
                program: 'kmfLZO8ckxY',
                programStage: 'DSFjQPPKuyM',
                orgUnit: props.orgUnitId,
                trackedEntityInstance: trackInstId,
                status: 'COMPLETED',
                dueDate: addColRow_lvh.dueDate,
                eventDate: addColRow_lvh.reportDate,
                completedDate: new Date().toISOString().split('T')[0],
            };
        } else if (currentFilter === 'Water Sanitation & Hygiene') {
            payload = {
                dataValues: [
                    { "value": addColRow_Wsh.foodSafety, "dataElement": 'Q4dJyNwdyyJ' },
                    { "value": addColRow_Wsh.promotersAttendance, "dataElement": "zwumtCV5d8h" },
                    { "value": addColRow_Wsh.personalHygiene, "dataElement": "POMbjIgo3EF" },
                    { "value": addColRow_Wsh.householdHygiene, "dataElement": "ss6pDJe2k6h" },
                    { "value": addColRow_Wsh.cleanSafeWater, "dataElement": "xyaOOPDyjoN" },
                    { "value": addColRow_Wsh.latrineDisposal, "dataElement": "dnlAV3tubDJ" }
                    // Add other fields as necessary
                ],
                event: eventId,
                program: 'kmfLZO8ckxY',
                programStage: 'QAEEGAsJ5H7',
                orgUnit: props.orgUnitId,
                trackedEntityInstance: trackInstId,
                status: 'ACTIVE',
                dueDate: addColRow_lvh.dueDate,
                eventDate: addColRow_lvh.reportDate,
            };
        }

        try {
            if (isEditing) {
                // PUT request for editing an existing record
                const response = await axios.put(`${process.env.REACT_APP_DHIS2_BASE_URL}/api/events/${id}`, payload);
                console.log('Entry updated:', response.data);
                // Handle success (e.g., update state, show message)
            } else {
                // POST request for adding a new record
                const response = await axios.post(`${process.env.REACT_APP_DHIS2_BASE_URL}/api/events`, payload);
                console.log('New entry added:', response.data);
                // Handle success (e.g., update state, show message)
            }
        } catch (error) {
            console.error('Error saving entry:', error);
            // Handle error (e.g., show error message)
        }
    };

    // Function to handle cancel action
    const handleCancel = (id: string) => {
        // Revert to original values
        setEditableRows((prev) => ({ ...prev, [id]: false }));
        // Optionally, reset the original values if needed
        setOriginalValues((prev) => {
            const newValues = { ...prev };
            delete newValues[id]; // Remove the original values for this row
            return newValues;
        });
    };

    // Function to handle input change
    const handleInputChange1 = (id: string, accessor: string, value: string | boolean) => {
        // Update the original values for the row
        setOriginalValues((prev) => ({
            ...prev,
            [id]: {
                ...prev[id],
                [accessor]: value,
            },
        }));
    };

    const fetchAdditionalData = async (trackInstanceId: string, trainingFilter: string): Promise<FetchedData> => {
        const programStageMap = {
            'Livelihood': 'j3I4HeeEL0K',
            'Nutrition': 'DSFjQPPKuyM',
            'Water Sanitation & Hygiene': 'QAEEGAsJ5H7',
        };

        const programStage = programStageMap[trainingFilter];
        const url = `${process.env.REACT_APP_DHIS2_BASE_URL}/api/trackedEntityInstances/${trackInstanceId}.json?program=kmfLZO8ckxY&programStage=${programStage}&fields=enrollments[events[*]]`;

        try {
            console.log(`Fetching data from URL: ${url}`); // Log the URL being fetched
            const response = await axios.get(url);
            const data = response.data;

            console.log('Response data:', data); // Log the entire response data

            // Initialize reportDate, dueDate, and dataValues
            let reportDate = '';
            let dueDate = '';
            let eventId = '';
            const dataValues: { [key: string]: string } = {};

            // Extract the report date and due date from the response
            if (data.enrollments && data.enrollments.length > 0) {
                const events = data.enrollments[0].events; // Get all events
                if (events && events.length > 0) {
                    // Iterate through all events
                    events.forEach((event) => {
                        console.log('Fetched Event:', event); // Log each fetched event
                        reportDate = event.eventDate; // Extract reportDate (you may want to handle multiple dates)
                        dueDate = event.dueDate; // Extract dueDate (you may want to handle multiple due dates)
                        eventId = event.event;

                        // Log all dataElement IDs for this event
                        const allDataElementIds: string[] = []; // Array to hold all dataElement IDs
                        event.dataValues.forEach((dataValue) => {
                            const dataElementId = dataValue.dataElement;
                            allDataElementIds.push(dataElementId); // Collect the dataElement ID
                        });
                        console.log('All Data Element IDs from this event:', allDataElementIds); // Log all dataElement IDs

                        // Extract data values based on the dataElementMapping
                        const dataElementMappingForFilter = dataElementMapping[trainingFilter];
                        if (dataElementMappingForFilter) {
                            event.dataValues.forEach((dataValue) => {
                                const dataElementId = dataValue.dataElement;
                                // Check if the dataElementId exists in the mapping
                                const key = Object.keys(dataElementMappingForFilter).find(key => dataElementMappingForFilter[key] === dataElementId);
                                if (key) {
                                    dataValues[key] = dataValue.value; // Store the value
                                }
                            });
                        }
                    });
                }
            }

            // Log the extracted reportDate, dueDate, and dataValues
            console.log('Extracted Data:', { reportDate, dueDate, eventId, dataValues });

            // Return the fetched data including reportDate, dueDate, and dataValues
            return {
                reportDate,
                dueDate,
                eventId,
                dataValues,
            };

        } catch (error) {
            console.error('Error fetching additional data:', error);
        }

        // Return empty values if not found
        return { reportDate: '', dueDate: '', eventId: '', dataValues: {} }; // Ensure dataValues is an empty object
    };

    const getTopicOptions = (track: string, filter: string) => {
        if (filter === 'Livelihood') {
            if (track === 'Fisher') {
                return ['Fishing Oil Preparation', 'Fishing Marketing', 'Fishing Methods'];
            } else if (track === 'Farmer') {
                return [
                    'Harvesting',
                    'Post Harvest Handling',
                    'Land Preparation',
                    'Nursery Preparation',
                    'Post Harvest Hygiene',
                    'Losses Marking',
                    'Weeding',
                    'Storage',
                ];
            }
        } else if (filter === 'Nutrition') {
            return [
                'Nutrition Pregnancy',
                'Early Initiation',
                'Breastfeeding First 6 Months',
                'Exclusive Breastfeeding',
                'Good Hygiene Practices',
                'Complementary Feeding',
                'Health Seeking Behavior',
                'Growth Monitoring',
                'Kitchen Gardens',
                'Cooking Demonstration',
                'Pregnant',
                'Lactating',
            ];
        } else if (filter === 'Water Sanitation & Hygiene') {
            return [
                'Food Safety',
                'Promoters Attendance',
                'Personal Hygiene',
                'Household Hygiene',
                'Clean Safe Water',
                'Latrine Disposal',
            ];
        }
        return [];
    };

    const dataElementMapping = {
        'Livelihood': {
            'Fisher': {
                'Fishing Oil Preparation': 'erCm8YopB1D',
                'Fishing Marketing': 'QpLUEvB2sdy',
                'Fishing Methods': 'vsbH6WxHVrN',
                'Post Handling Methods': 'newDataElementId', // Need correct ID
                'Applied Lessons': 'newDataElementId',       // Need correct ID
                // 'Income Earned/Week': 'td3WOxoQ4wN',
                // 'Case Stories Generated': 'sQShE9oP513'
            },
            'Farmer': {
                'Harvesting': 'RiNixd9BoZE',
                'Post Harvest Handling': 'oLxkWBGjWkV',
                'Land Preparation': 'Nmh0TPGuXWS',
                'Nursery Preparation': 'VyqyQ0BZISo',
                'Post Harvest Hygiene': 'EpaLpKMZj3y',
                'Losses Marking': 'aUrLyHqOf0n',
                'Weeding': 'vVKfsZ8VgiG',
                'Storage': 'YzlNvVyLIkn',
                'Applied Lessons': 'newDataElementId',           // Need correct ID
                'Increased income': 'newDataElementId',         // Need correct ID
                'Increased agricultural production': 'newDataElementId', // Need correct ID
                'Started a new livelihood activity': 'newDataElementId', // Need correct ID
                'Increased my skills/knowledge': 'newDataElementId',    // Need correct ID
                'Increased my family\'s resilience to shocks': 'newDataElementId', // Need correct ID
                'Others': 'newDataElementId'                    // Need correct ID
            }

        },
        'Nutrition': {
            'Nutrition during pregnancy and lactation': 'FVIkGrGWz1s',
            'Importance of early initiation of breastfeeding': 'URD2xr6Enhc',
            'Breastfeeding in the first 6 months': 'LzFFXJl5Iqu',
            'Exclusive breastfeeding during the first 6 months': 'ecFLn0i8QrL',
            'Good hygiene practices': 'ijTViGLk6hP',
            'Complementary feeding': 'LzGN50sTSh3',
            'Health seeking behavior': 'C2GoFXyTUj2',
            'Growth monitoring': 'DK06Y2Viejs',
            'Kitchen gardens and fruit trees': 'NOIbysghola',
            'Cooking Demonstration': 'LhcJpqUzqcp',
            'Pregnant': 'stU3OZCy64s',
            'Lactating': 'NA1ZhjvX47L',
            'Other': 'TQLLkvvbCD2',
        },
        'Water Sanitation & Hygiene': {
            'Food Safety': 'Q4dJyNwdyyJ',
            'Promoters Attendance :1. CLTS': 'zwumtCV5d8h',
            'Personal Hygiene': 'POMbjIgo3EF',
            'Household Hygene': 'ss6pDJe2k6h',
            'Clean and Safe Water': 'xyaOOPDyjoN',
            'Use of Latrine and Excreta Disposal': 'dnlAV3tubDJ',
        },
    };

    const dataValueMapping = {
        // Farmer-specific mappings
        'harvesting_checkBox': 'Harvesting',
        'postHarvestHandling_checkBox': 'Post Harvest Handling',
        'landPreparation_checkBox': 'Land Preparation',
        'nurseryPreparation_checkBox': 'Nursery Preparation',
        'postHarvestHygiene_checkBox': 'Post Harvest Hygiene',
        'lossesMarking_checkBox': 'Losses Marking',
        'weeding_checkBox': 'Weeding',
        'storage_checkBox': 'Storage',
        'appliedLessons_dropdown': 'Applied Lessons',
        'increasedIncome_checkBox': 'Increased income',
        'increasedProduction_checkBox': 'Increased agricultural production',
        'newLivelihood_checkBox': 'Started a new livelihood activity',
        'increasedSkills_checkBox': 'Increased my skills/knowledge',
        'increasedResilience_checkBox': 'Increased my family\'s resilience to shocks',
        'others_text': 'Others',
    
        // Fisher-specific mappings (existing)
        'fishingOilPreparation_checkBox': 'Fishing Oil Preparation',
        'fishingMarketing_checkBox': 'Fishing Marketing',
        'fishingMethods_checkBox': 'Fishing Methods',
        'postHandlingMethods_checkBox': 'Post Handling Methods',
        
        // Other existing mappings (Nutrition, Water Sanitation)
        'foodSafety_checkBox': 'Food Safety',
        'promotersAttendance_checkBox': 'Promoters Attendance :1. CLTS',
        'personalHygiene_checkBox': 'Personal Hygiene',
        'householdHygiene_checkBox': 'Household Hygene',
        'cleanSafeWater_checkBox': 'Clean and Safe Water',
        'latrineDisposal_checkBox': 'Use of Latrine and Excreta Disposal',
        'nutritionPregnancy_checkBox': 'Nutrition during pregnancy and lactation',
        'earlyInitiation_checkBox': 'Importance of early initiation of breastfeeding',
        'breastfeedingFirst6Months_checkBox': 'Breastfeeding in the first 6 months',
        'exclusiveBreastfeeding_checkBox': 'Exclusive breastfeeding during the first 6 months',
        'goodHygiene_checkBox': 'Good hygiene practices',
        'complementaryFeeding_checkBox': 'Complementary feeding',
        'healthSeekingBehavior_checkBox': 'Health seeking behavior',
        'growthMonitoring_checkBox': 'Growth monitoring',
        'kitchenGardens_checkBox': 'Kitchen gardens and fruit trees',
        'cookingDemonstration_checkBox': 'Cooking Demonstration',
        'pregnant_checkBox': 'Pregnant',
        'lactating_checkBox': 'Lactating',
        'other': 'Other'
        
        // Remove commented out mappings
        // 'incomeEarned': 'Income Earned/Week',
        // 'yieldKgs': 'Yield in Kgs',
        // 'caseStories': 'Case Stories Generated',
        // 'landCultivated': 'Land Cultivated in Feddans',
    };


    const renderTableRows = () => {

        // const groupData = data?.groupActivities;
        // console.log("data", groupData);

        if (!filteredData || filteredData.length === 0) {
            return (
                <tr>
                    <td colSpan={6}>No data available for the selected Entry, Please add new Beneficially</td>
                </tr>
            );
        }

        return filteredData.map((activity, index) => {
            // console.log({ activity: activity });
            const fetchedData: FetchedData = fetchedDates[activity.trackInstanceId] || { reportDate: '', dueDate: '', eventId: '', dataValues: {} };

            return (
                <tr key={activity.trackInstanceId || index}>
                    <td>{index + 1}</td>
                    <td>{activity.recordDate}</td>
                    <td>{activity.patientID}</td>
                    <td>{activity.first_middleName}</td>
                    <td>{activity.surname}</td>
                    <td>{activity.age}</td>
                    <td>{activity.dob}</td>
                    <td>{activity.sex}</td>
                    <td>{activity.track}</td>
                    <td>{activity.beneficiaryStage}</td>
                    {/* Render additional data cells */}
                    {additionalColumns.map((col) => (
                        <td key={col.accessor}>
                            {(editableRows[activity.trackInstanceId] && col.accessor !== 'addEditEvent') ?
                                (
                                    col.accessor === 'reportDate' ? (
                                        <input
                                            type="date"
                                            defaultValue={fetchedDates[activity.trackInstanceId]?.reportDate || ''}
                                            onChange={(e) => handleInputChange1(activity.trackInstanceId, 'reportDate', e.target.value)}
                                        />
                                    ) : col.accessor === 'dueDate' ? (
                                        <input
                                            type="date"
                                            defaultValue={fetchedDates[activity.trackInstanceId]?.dueDate || ''}
                                            onChange={(e) => handleInputChange1(activity.trackInstanceId, 'dueDate', e.target.value)}
                                        />
                                    ) : col.accessor.includes('checkBox') ? (
                                        <input
                                            type="checkbox"
                                            checked={activity[col.accessor] || false} // Assuming activity has a boolean value for checkBox
                                            onChange={(e) => handleInputChange1(activity.trackInstanceId, col.accessor, e.target.checked)}
                                        />
                                    ) : col.accessor === 'topicTrainedOn' ? (
                                        <select
                                            defaultValue={activity.topicTrainedOn}
                                            onChange={(e) => handleInputChange1(activity.trackInstanceId, 'topicTrainedOn', e.target.value)}
                                        >
                                            {getTopicOptions(activity.track, trainingFilter).map((topic) => (
                                                <option key={topic} value={topic}>
                                                    {topic}
                                                </option>
                                            ))}
                                        </select>
                                    ) : col.accessor === 'appliedLessons_dropdown' ? (
                                        <select
                                            value={fetchedData.dataValues['Applied Lessons'] || ''}
                                            onChange={(e) => handleInputChange1(activity.trackInstanceId, 'appliedLessons_dropdown', e.target.value)}
                                            className="form-select"
                                        >
                                            <option value="">Select</option>
                                            <option value="Yes">Yes</option>
                                            <option value="No">No</option>
                                        </select>
                                    )

                                        : (
                                            <input
                                                type="text"
                                                defaultValue={activity[col.accessor] || ''}
                                                onChange={(e) => handleInputChange1(activity.trackInstanceId, col.accessor, e.target.value)}
                                            />
                                        )) :
                                (
                                    // Display fetched dates when not editable
                                    col.accessor === 'reportDate' ? (
                                        fetchedData.reportDate || 'N/A'
                                    ) : col.accessor === 'dueDate' ? (
                                        fetchedData.dueDate || 'N/A'
                                    ) : col.accessor === 'addEditEvent' ? null : (
                                        col.accessor in dataValueMapping ? (
                                            // Use mapping to get the correct value
                                            fetchedData.dataValues[dataValueMapping[col.accessor]] !== undefined &&
                                                fetchedData.dataValues[dataValueMapping[col.accessor]] !== ''
                                                ? fetchedData.dataValues[dataValueMapping[col.accessor]]
                                                : 'N/A'// Display 'N/A' if the value is empty or undefined
                                        ) : (
                                            activity[col.accessor] || '' // Fallback to activity value if not in mapping
                                        )
                                    )
                                )}
                            {/* Render the edit button in the last additional column */}
                            {col.accessor === 'addEditEvent' && (
                                <div className="button-container">
                                    {editableRows[activity.trackInstanceId] ? (
                                        <>
                                            <button
                                                onClick={() => handleSave(activity.trackInstanceId, fetchedDates[activity.trackInstanceId]?.eventId)}
                                                style={{ backgroundColor: 'green' }}
                                                className="save-button btn"
                                            >
                                                Save
                                            </button>
                                            <button
                                                onClick={() => handleCancel(activity.trackInstanceId)}
                                                style={{ backgroundColor: 'red' }}
                                                className="cancel-button btn"
                                            >
                                                Cancel
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button
                                                onClick={() => handleAdd(activity.trackInstanceId)}
                                                style={{ backgroundColor: 'grey' }}
                                                className="add-button btn"
                                            >
                                                Add
                                            </button>
                                            <button
                                                onClick={() => handleEdit(activity.trackInstanceId)}
                                                style={{ backgroundColor: 'orange' }}
                                                className="edit-button btn"
                                            >
                                                Edit
                                            </button>
                                        </>
                                    )}
                                </div>
                            )}
                        </td>
                    ))}
                </tr>
            );
        });
    };

    const handleFilterChange = async (newFilter: string) => {
        setTrainingFilter(newFilter); // Update the training filter state
        setSelectedProgramStage(newFilter as ProgramStage); // Update selectedProgramStage

        // Update columns immediately when filter changes
        setAdditionalColumns(getAdditionalColumns(newFilter));

        // Fetch additional data for all rows based on the new filter
        const updatedFetchedDates = await Promise.all(
            filteredData.map(async (activity) => {
                const additionalData = await fetchAdditionalData(activity.trackInstanceId, newFilter);
                console.log({ 'Additional Data': additionalData })
                return {
                    trackInstanceId: activity.trackInstanceId,
                    reportDate: additionalData.reportDate,
                    dueDate: additionalData.dueDate,
                    eventId: additionalData.eventId,
                    dataValues: additionalData.dataValues || {}
                };
            })
        );

        // Update the state with the fetched dates
        // Update the state with the fetched dates
        const newFetchedDates: { [key: string]: FetchedData } = {};
        updatedFetchedDates.forEach(({ trackInstanceId, reportDate, dueDate, eventId, dataValues }) => {
            newFetchedDates[trackInstanceId] = { reportDate, dueDate, eventId, dataValues };
        });
        setFetchedDates(newFetchedDates);
    };

    // update columns when track filter changes
    useEffect(() => {
        if (trainingFilter === 'Livelihood') {
            // Re-run getAdditionalColumns with current training filter to update columns
            setAdditionalColumns(getAdditionalColumns(trainingFilter));
        }
    }, [trackFilter, trainingFilter]);

    // Modified handleFilterChange function
    const handleProgramStageChange = async (newFilter: ProgramStage) => {
        setSelectedProgramStage(newFilter);
        setTrainingFilter(newFilter);

        if (!newFilter) {
            setFilteredData(props.orgUnitDetails);
            return;
        }

        try {
            // Fetch data for the selected program stage
            const programStageId = PROGRAM_STAGE_MAPPING[newFilter];
            const fetchedData = await fetchProgramStageData(programStageId);

            // Update columns based on the selected program stage
            setAdditionalColumns(getAdditionalColumns(newFilter));

            // Filter and merge data
            const mergedData = mergeProgramStageData(props.orgUnitDetails, fetchedData);
            setFilteredData(mergedData);

        } catch (error) {
            console.error('Error fetching program stage data:', error);
        }
    };

    // New function to fetch program stage specific data
    const fetchProgramStageData = async (programStageId: string) => {
        try {
            const response = await fetch(
                `${process.env.REACT_APP_DHIS2_BASE_URL}/api/trackedEntityInstances/pending?programStage=${programStageId}`,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Basic ${credentials}`,
                    },
                }
            );
            const data = await response.json();
            return data.events || [];
        } catch (error) {
            console.error('Error fetching program stage data:', error);
            return [];
        }
    };

    // New function to merge program stage data with org unit details
    const mergeProgramStageData = (orgUnitDetails: any[], programStageData: any[]) => {
        return orgUnitDetails.filter(detail => {
            return programStageData.some(event =>
                event.trackedEntityInstance === detail.trackInstanceId
            );
        });
    };

    return (
        <main className="space-y-4">
            {/* <Header
                onAdd={onAdd}
            // onDownloadCSV={() => handleDownloadCSV('')}
            /> */}

            {/* Training Filters */}
            <h5 style={{ padding: '10px' }}>Training</h5>

            {/* First div block - Track and Program Stage filters */}
            <div className="flex space-x-4" style={{
                padding: '0px 10px 10px 10px',
                display: 'flex',
                alignItems: 'center',
                gap: '20px'
            }}>
                {/* Track Filter */}
                <select
                    value={trackFilter}
                    onChange={(e) => {
                        setTrackFilter(e.target.value);
                        if (trainingFilter === 'Livelihood') {
                            // Force column update when track changes
                            setAdditionalColumns(getAdditionalColumns(trainingFilter));
                        }
                    }}
                    className="border border-gray-300 rounded-md p-2"
                    style={{
                        borderRadius: '5px',
                        width: '150px',        // Standard width
                        height: '40px',        // Standard height
                        padding: '15px 10px '    // Comfortable padding
                    }}
                >
                    <option value="" style={{ marginTop: '-2px' }}>Select Tracker</option>
                    <option value="Fisher">Fisher</option>
                    <option value="Farmer">Farmer</option>
                </select>

                {/* Program Stage Radio Buttons */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '25px'    // Increased gap between radio buttons
                }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <input
                            type="radio"
                            value="Livelihood"
                            checked={trainingFilter === 'Livelihood'}
                            onChange={() => handleFilterChange('Livelihood')}
                        />
                        Livelihood
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <input
                            type="radio"
                            value="Water Sanitation & Hygiene"
                            checked={trainingFilter === 'Water Sanitation & Hygiene'}
                            onChange={() => handleFilterChange('Water Sanitation & Hygiene')}
                        />
                        Water Sanitation & Hygiene
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <input
                            type="radio"
                            value="Nutrition"
                            checked={trainingFilter === 'Nutrition'}
                            onChange={() => setTrainingFilter('Nutrition')}
                        />
                        Nutrition
                    </label>
                </div>
            </div>

            {/* Second div block - Search, New Beneficiary, and Date */}
            <div style={{
                padding: '10px',
                display: 'flex',
                alignItems: 'center',
                gap: '15px',
                marginTop: '-5px'
            }}>
                <input
                    type="text"
                    placeholder="Search Beneficiary"
                    value={beneficiarySearch}
                    onChange={(e) => setBeneficiarySearch(e.target.value)}
                    onKeyDown={handleBeneficiarySearch1}
                    className="border border-gray-300 rounded-md"
                    style={{
                        borderRadius: '5px',
                        width: '200px',
                        height: '40px',
                        padding: '5px 10px'
                    }}
                />

                {selectedProgramStage && (
                    <button
                        type="button"
                        onClick={handleNewBeneficiaryClick}
                        className="border border-gray-300 rounded-md"
                        style={{
                            borderRadius: '5px',
                            height: '40px',
                            padding: '5px 10px',
                            backgroundColor: '#f8f9fa',
                            cursor: 'pointer'
                        }}
                    >
                        New Beneficiary
                    </button>
                )}

                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                }}>
                    <label>Select Date:</label>
                    <input
                        type="date"
                        id="dateFilter"
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                        className="border border-gray-300 rounded-md"
                        style={{
                            borderRadius: '5px',
                            height: '35px',
                            padding: '5px 10px'
                        }}
                    />
                </div>
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

            {!formVisible && (
                <>
                    <div className="table-responsive">
                        <table className="table table-striped table-bordered table-hover table-dark-header">
                            <thead className="text-nowrap">
                                <tr>
                                    <th>No.</th>
                                    <th>Registration Date</th>
                                    <th>Patient ID</th>
                                    <th>First Name & Middle Name</th>
                                    <th>Surname</th>
                                    <th>Age</th>
                                    <th>Date of Birth</th>
                                    <th>Sex</th>
                                    <th>Beneficiary Track</th>
                                    <th>Is Beneficiary Adult / Child</th>
                                    {/* Render additional headers */}
                                    {additionalColumns.map((col) => (
                                        <th key={col.accessor}>{col.Header}</th>
                                    ))}
                                </tr>
                                {/* <tr>
                                    {table.columns.map((column) => (
                                        <th key={column.accessor || column.Header}>{column.Header}</th>
                                    ))}
                                </tr> */}
                            </thead>
                            <tbody>
                                {renderTableRows()}
                                {/* New row form as part of the table */}
                                {isAddingNewRow && (
                                    <tr>
                                        <td>
                                            <input
                                                type="text"
                                                name="id"
                                                value={newRowData.id}
                                                // onChange={handleNewRowInputChange}
                                                onChange={(e) => setNewRowData({ ...newRowData, id: e.target.value })}
                                                placeholder="Row No."
                                            />
                                        </td>

                                        <td>
                                            <input
                                                type="date"
                                                name="recordDate"
                                                value={newRowData.recordDate}
                                                // onChange={handleNewRowInputChange}
                                                onChange={(e) => setNewRowData({ ...newRowData, recordDate: e.target.value })}

                                            />
                                        </td>
                                        <td>
                                            <input
                                                type="text"
                                                name="patientID"
                                                value={newRowData.patientID}
                                                // onChange={handleNewRowInputChange}
                                                onChange={(e) => setNewRowData({ ...newRowData, patientID: e.target.value })}
                                                placeholder="Patient ID"
                                            />
                                        </td>
                                        <td>
                                            <input
                                                type="text"
                                                name="first_middleName"
                                                value={newRowData.first_middleName}
                                                // onChange={handleNewRowInputChange}
                                                onChange={(e) => setNewRowData({ ...newRowData, first_middleName: e.target.value })}
                                                placeholder="First Name and Middle Name"
                                            />
                                        </td>
                                        <td>
                                            <input
                                                type="text"
                                                name="surname"
                                                value={newRowData.surname}
                                                // onChange={handleNewRowInputChange}
                                                onChange={(e) => setNewRowData({ ...newRowData, surname: e.target.value })}
                                                placeholder="Surname"
                                            />
                                        </td>
                                        <td>
                                            <input
                                                type="number"
                                                name="age"
                                                value={newRowData.age}
                                                // onChange={handleNewRowInputChange}
                                                onChange={(e) => setNewRowData({ ...newRowData, age: e.target.value })}
                                                placeholder="Age"
                                            />
                                        </td>
                                        <td>
                                            <input
                                                type="date"
                                                name="dob"
                                                value={newRowData.dob}
                                                // onChange={handleNewRowInputChange}
                                                onChange={(e) => setNewRowData({ ...newRowData, dob: e.target.value })}

                                            />
                                        </td>
                                        <td>
                                            <select
                                                name="sex"
                                                value={newRowData.sex}
                                                onChange={(e) => setNewRowData({ ...newRowData, sex: e.target.value })}
                                            >
                                                <option value="">Select Gender</option>
                                                <option value="Male">Male</option>
                                                <option value="Female">Female</option>
                                            </select>
                                        </td>
                                        <td>
                                            <input
                                                type="text"
                                                name="track"
                                                value={newRowData.track}
                                                // onChange={handleNewRowInputChange}
                                                onChange={(e) => setNewRowData({ ...newRowData, track: e.target.value })}
                                                placeholder="Beneficiary Track"
                                            />
                                        </td>
                                        <td>
                                            <select
                                                name="beneficiaryStage"
                                                value={newRowData.beneficiaryStage}
                                                onChange={(e) => setNewRowData({ ...newRowData, beneficiaryStage: e.target.value })}
                                            >
                                                <option value="">Select Gender</option>
                                                <option value="Adult">Adult</option>
                                                <option value="Child">Child</option>
                                            </select>
                                        </td>
                                        {/* Add more input fields for other data as needed */}
                                        <td>
                                            <button onClick={handleFormSubmit} className="submit-button">Save</button>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            {!formVisible && <TablePagination table={table} />}
        </main>

    );



}

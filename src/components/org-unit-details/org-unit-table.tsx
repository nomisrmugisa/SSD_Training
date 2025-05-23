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
// import { indexedDBManager } from '../../api/offline/indexedDB'; // Adjust the path as necessary
// import { networkStatus } from '../../utils/networkStatus';

type Props = {
    orgUnitDetails: OrgUnitDetails[];
    orgUnitId: string;

};

interface FetchedData {
    reportDate: string;
    dueDate: string;
    eventId: string;
    dataValues: { [key: string]: string | boolean }; // To hold the values for each data element
}

// for indexedDB 
// interface BeneficiaryEvent {
//     id: string; // Unique ID for the beneficiary
//     recordDate: string;
//     track: string;
//     inactive: string;
//     beneficiaryStage: string;
//     careGiver: string;
//     careGiverAge: string;
//     patientID: string;
//     firstMiddleName: string;
//     surname: string;
//     dob: string;
//     orgUnit: string;
//     // topicTrainedOn: string;
//     beneficiaryName: string;
//     nonBeneficiaryName: string;
//     sex: string;
//     age: string;
//     // sentOnline: boolean; // Indicates if the data has been sent to the API
// }

type ProgramStage = 'Livelihood' | 'Water Sanitation & Hygiene' | 'Nutrition' | '';


export function OrgUnitTable(props: Props) {

    const PROGRAM_STAGE_MAPPING = {
        'Livelihood': 'H0vCgsI1d4M',
        'Water Sanitation & Hygiene': 'bTVReRuHapT',
        'Nutrition': 'RXTq2YFOH5c'
    };

    const dataElementIDsByFilter = {
        'Livelihood': {
            'Fisher': {
                'Fishing Oil Preparation': 'erCm8YopB1D',
                'Fishing Marketing': 'QpLUEvB2sdy',
                'Fishing Methods': 'OKc4NRIE3rS',
                'Post Handling Methods': 'SinFNAlonqG',
                'Applied Lessons': 'EvDeWfQDiuz'
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
                'Applied Lessons': 'ZBAx5UMH63F',
                'Increased income': 'Tbnq2F0xX7D',
                'Increased agricultural production': 'GwKxMZ8yaBm',
                'Started a new livelihood activity': 'Ee8oyMX7Aoc',
                'Increased my skills/knowledge': 'I2KTNrvwsHT',
                'Increased my family\'s resilience to shocks': 'RW2BS4l5KcN',
                'Others': 'Si8dOtSlomM'
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
            'Beneficiary Category': 'NA1ZhjvX47L',
            'Other Male': 'TQLLkvvbCD2',
            'Other Female': 'ojr5RiilqCk',
        },
        'Water Sanitation & Hygiene': {
            'Food Safety': 'Q4dJyNwdyyJ',
            'Promoters Attendance :1. CLTS': 'zwumtCV5d8h',
            'Personal Hygiene': 'POMbjIgo3EF',
            'Household Hygene': 'ss6pDJe2k6h',
            'Clean and Safe Water': 'xyaOOPDyjoN',
            'Use of Latrine and Excreta Disposal': 'dnlAV3tubDJ'
        }
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
            'Beneficiary Category': 'NA1ZhjvX47L',
            'Other Male': 'TQLLkvvbCD2',
            'Other Female': 'ojr5RiilqCk',
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

        // Nutrition 
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
        'Beneficiary_Category_dropDown': 'Beneficiary Category',
        'Other_Male_no_input': 'Other Male',
        'Other_Female_no_input': 'Other Female',

        // Remove commented out mappings
        // 'incomeEarned': 'Income Earned/Week',
        // 'yieldKgs': 'Yield in Kgs',
        // 'caseStories': 'Case Stories Generated',
        // 'landCultivated': 'Land Cultivated in Feddans',
    };

    // const credentials = btoa(`admin:Nomisr123$$$}`);
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
        initialMuac: '',
        muacClassification: '',
        ben_facility_RegNo: '',
        directPatientID: '',

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
        initialMuac: '',
        muacClassification: '',
        ben_facility_RegNo: '',
        directPatientID: '',
        beneficiaryType: '',
        muacColor: '#ffffff'
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

    const [selectedBeneficiary, setSelectedBeneficiary] = useState<OrgUnitDetails | null>(null);
    const [indirectBeneficiaries, setIndirectBeneficiaries] = useState<OrgUnitDetails[]>([]);
    const [isAddingIndirect, setIsAddingIndirect] = useState(false);
    const [newIndirectData, setNewIndirectData] = useState({
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
        initialMuac: '',
        muacClassification: '',
        ben_facility_RegNo: '',
        directPatientID: '',

        muacColor: '#ffffff',
    });

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

    const [hasValidDate, setHasValidDate] = useState<{ [key: string]: boolean }>({});

    useEffect(() => {
        // Reset all additional column states when training filter changes
        setaddColRow_lvh({
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
            }
        });

        setaddColRow_Wsh({
            reportDate: '',
            dueDate: '',
            foodSafety: false,
            promotersAttendance: false,
            personalHygiene: false,
            householdHygiene: false,
            cleanSafeWater: false,
            latrineDisposal: false,
        });

        setaddColRow_Nut({
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

        // Clear fetched dates and data values
        setFetchedDates({});
        setHasValidDate({});

    }, [trainingFilter]); // Trigger when trainingFilter changes

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

    // useEffect for MUAC
    // Add this useEffect inside the OrgUnitTable component, after the state declarations
    // useEffect(() => {
    //     const muacValue = parseFloat(newRowData.initialMuac);
    //     let classification = '';

    //     if (!isNaN(muacValue)) {
    //         if (newRowData.beneficiaryStage === 'Child') {
    //             if (muacValue < 11.5) {
    //                 classification = 'Severe <11.5 cm (Red)';
    //             } else if (muacValue >= 11.5 && muacValue < 12.5) {
    //                 classification = 'Moderate >=11.5 - < 12.5 cm (Yellow)';
    //             } else if (muacValue >= 12.5) {
    //                 classification = 'Normal ≥12.5 cm (Green)';
    //             }
    //         } else if (newRowData.beneficiaryStage === 'Adult') {
    //             if (muacValue < 21) {
    //                 classification = 'Less than 21 cm (red)';
    //             } else if (muacValue >= 21 && muacValue < 23) {
    //                 classification = 'Less than 23 cm greater than 21 cm (yellow)';
    //             } else if (muacValue >= 23) {
    //                 classification = 'Equals to or greater than 23 cm (green)';
    //             }
    //         }
    //     }

    //     setNewRowData(prev => ({
    //         ...prev,
    //         muacClassification: classification
    //     }));
    // }, [newRowData.initialMuac, newRowData.beneficiaryStage]);

    // useEffect(() => {

    //     console.log('MUAC Effect triggered', {
    //     muacValue: newIndirectData.initialMuac,
    //     stage: newIndirectData.beneficiaryStage
    //     });
    //     const muacValue = parseFloat(newIndirectData.initialMuac);
    //     let classification = '';

    //     if (!isNaN(muacValue)) {
    //         if (newIndirectData.beneficiaryStage === 'Child') {
    //             if (muacValue < 11.5) {
    //                 classification = 'Severe <11.5 cm (Red)';
    //             } else if (muacValue >= 11.5 && muacValue < 12.5) {
    //                 classification = 'Moderate >=11.5 - < 12.5 cm (Yellow)';
    //             } else if (muacValue >= 12.5) {
    //                 classification = 'Normal ≥12.5 cm (Green)';
    //             }
    //         } else if (newIndirectData.beneficiaryStage === 'Adult') {
    //             if (muacValue < 21) {
    //                 classification = 'Less than 21 cm (red)';
    //             } else if (muacValue >= 21 && muacValue < 23) {
    //                 classification = 'Less than 23 cm greater than 21 cm (yellow)';
    //             } else if (muacValue >= 23) {
    //                 classification = 'Equals to or greater than 23 cm (green)';
    //             }
    //         }
    //     }

    //     setNewIndirectData(prev => ({
    //         ...prev,
    //         muacClassification: classification
    //     }));
    // }, [newIndirectData.initialMuac, newIndirectData.beneficiaryStage]);

    // Update additional columns when training filter changes
    useEffect(() => {
        setAdditionalColumns(getAdditionalColumns(trainingFilter));
    }, [trainingFilter]);

    // update columns when track filter changes
    useEffect(() => {
        if (trainingFilter === 'Livelihood') {
            // Re-run getAdditionalColumns with current training filter to update columns
            setAdditionalColumns(getAdditionalColumns(trainingFilter));
        }
    }, [trackFilter, trainingFilter]);

    // Function to determine additional columns based on the training filter
    const getAdditionalColumns = (filter: string) => {
        const columns = [];
        switch (filter) {
            case 'Livelihood':
                if (trackFilter === 'Fisher') {
                    columns.push(
                        {
                            Header: 'Date of training', accessor: 'reportDate',
                            headerClassName: 'additional-header-cell'
                        },
                        // { Header: 'Due Date', accessor: 'dueDate' },
                        {
                            Header: 'Fishing Oil Preparation', accessor: 'fishingOilPreparation_checkBox',
                            headerClassName: 'additional-header-cell'
                        },
                        {
                            Header: 'Fishing Marketing', accessor: 'fishingMarketing_checkBox',
                            headerClassName: 'additional-header-cell'
                        },
                        {
                            Header: 'Fishing Methods', accessor: 'fishingMethods_checkBox',
                            headerClassName: 'additional-header-cell'
                        },
                        {
                            Header: 'Post Handling Methods', accessor: 'postHandlingMethods_checkBox',
                            headerClassName: 'additional-header-cell'
                        }, // Added
                        {
                            Header: 'Did you apply the lessons from fishery training in your life',
                            accessor: 'appliedLessons_dropdown',
                            headerClassName: 'additional-header-cell'
                        }
                        // { Header: 'Estimated Fish Catch', accessor: 'estimatedFishCatch' },
                        // { Header: 'Income Earned/Week', accessor: 'incomeEarned' },
                        // { Header: 'Case Stories Generated', accessor: 'caseStories' }
                    );
                } else if (trackFilter === 'Farmer') {
                    columns.push(
                        {
                            Header: 'Date of training', accessor: 'reportDate',
                            headerClassName: 'additional-header-cell'
                        },
                        // { Header: 'Due Date', accessor: 'dueDate' },
                        {
                            Header: 'Harvesting', accessor: 'harvesting_checkBox',
                            headerClassName: 'additional-header-cell'
                        },
                        {
                            Header: 'Post Harvest Handling', accessor: 'postHarvestHandling_checkBox',
                            headerClassName: 'additional-header-cell'
                        },
                        {
                            Header: 'Land Preparation', accessor: 'landPreparation_checkBox',
                            headerClassName: 'additional-header-cell'
                        },
                        {
                            Header: 'Nursery Preparation', accessor: 'nurseryPreparation_checkBox',
                            headerClassName: 'additional-header-cell'
                        },
                        {
                            Header: 'Post Harvest Hygiene', accessor: 'postHarvestHygiene_checkBox',
                            headerClassName: 'additional-header-cell'
                        },
                        {
                            Header: 'Losses Marking', accessor: 'lossesMarking_checkBox',
                            headerClassName: 'additional-header-cell'
                        },
                        {
                            Header: 'Weeding', accessor: 'weeding_checkBox',
                            headerClassName: 'additional-header-cell'
                        },
                        {
                            Header: 'Storage', accessor: 'storage_checkBox',
                            headerClassName: 'additional-header-cell'
                        },
                        {
                            Header: 'Did you apply the lessons from the farming trainings in your life', accessor: 'appliedLessons_dropdown',
                            headerClassName: 'additional-header-cell'
                        },
                        {
                            Header: 'Increased income', accessor: 'increasedIncome_checkBox',
                            headerClassName: 'additional-header-cell'
                        },
                        {
                            Header: 'Increased agricultural production', accessor: 'increasedProduction_checkBox',
                            headerClassName: 'additional-header-cell'
                        },
                        {
                            Header: 'Started a new livelihood activity', accessor: 'newLivelihood_checkBox',
                            headerClassName: 'additional-header-cell'
                        },
                        {
                            Header: 'Increased my skills/knowledge', accessor: 'increasedSkills_checkBox',
                            headerClassName: 'additional-header-cell'
                        },
                        {
                            Header: 'Increased my family\'s resilience to shocks', accessor: 'increasedResilience_checkBox',
                            headerClassName: 'additional-header-cell'
                        },
                        {
                            Header: 'Others (specify)', accessor: 'others_text',
                            headerClassName: 'additional-header-cell'
                        }
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
                    {
                        Header: 'Date of training', accessor: 'reportDate',
                        headerClassName: 'additional-header-cell'
                    },
                    // { Header: 'Due Date', accessor: 'dueDate' },
                    {
                        Header: 'Food Safety', accessor: 'foodSafety_checkBox',
                        headerClassName: 'additional-header-cell'
                    },
                    {
                        Header: 'Promoters Attendance :1. CLTS', accessor: 'promotersAttendance_checkBox',
                        headerClassName: 'additional-header-cell'
                    },
                    {
                        Header: 'Personal Hygiene', accessor: 'personalHygiene_checkBox',
                        headerClassName: 'additional-header-cell'
                    },
                    {
                        Header: 'Household Hygene', accessor: 'householdHygiene_checkBox',
                        headerClassName: 'additional-header-cell'
                    },
                    {
                        Header: 'Clean and Safe Water', accessor: 'cleanSafeWater_checkBox',
                        headerClassName: 'additional-header-cell'
                    },
                    {
                        Header: 'Use of Latrine and Excreta Disposal', accessor: 'latrineDisposal_checkBox',
                        headerClassName: 'additional-header-cell'
                    },
                );
                break;
            case 'Nutrition':
                columns.push(
                    {
                        Header: 'Date of training', accessor: 'reportDate',
                        headerClassName: 'additional-header-cell'
                    },
                    // { Header: 'Due Date', accessor: 'dueDate' },
                    {
                        Header: 'Nutrition during pregnancy and lactation', accessor: 'nutritionPregnancy_checkBox',
                        headerClassName: 'additional-header-cell'
                    },
                    {
                        Header: 'Importance of early initiation of breastfeeding', accessor: 'earlyInitiation_checkBox',
                        headerClassName: 'additional-header-cell'
                    },
                    {
                        Header: 'Breastfeeding in the first 6 months', accessor: 'breastfeedingFirst6Months_checkBox',
                        headerClassName: 'additional-header-cell'
                    },
                    {
                        Header: 'Exclusive breastfeeding during the first 6 months', accessor: 'exclusiveBreastfeeding_checkBox',
                        headerClassName: 'additional-header-cell'
                    },
                    {
                        Header: 'Good hygiene practices', accessor: 'goodHygiene_checkBox',
                        headerClassName: 'additional-header-cell'
                    },
                    {
                        Header: 'Complementary feeding', accessor: 'complementaryFeeding_checkBox',
                        headerClassName: 'additional-header-cell'
                    },
                    {
                        Header: 'Health seeking behavior', accessor: 'healthSeekingBehavior_checkBox',
                        headerClassName: 'additional-header-cell'
                    },
                    {
                        Header: 'Growth monitoring', accessor: 'growthMonitoring_checkBox',
                        headerClassName: 'additional-header-cell'
                    },
                    {
                        Header: 'Kitchen gardens and fruit trees', accessor: 'kitchenGardens_checkBox',
                        headerClassName: 'additional-header-cell'
                    },
                    {
                        Header: 'Cooking Demonstration', accessor: 'cookingDemonstration_checkBox',
                        headerClassName: 'additional-header-cell'
                    },
                    {
                        Header: 'Beneficiary Category', accessor: 'Beneficiary_Category_dropDown',
                        headerClassName: 'additional-header-cell'
                    },
                    {
                        Header: 'Other Male', accessor: 'Other_Male_no_input',
                        headerClassName: 'additional-header-cell'
                    },
                    {
                        Header: 'Other Female', accessor: 'Other_Female_no_input',
                        headerClassName: 'additional-header-cell'
                    },
                );
                break;
            default:
                break;
        }

        // Add the "Add / Edit Event" column
        if (filter) {
            columns.push({
                Header: 'Add / Edit Event', accessor: 'addEditEvent',
                headerClassName: 'additional-header-cell'
            });
        }

        return columns;
    };


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
                const response = await fetch(`${process.env.REACT_APP_DHIS2_BASE_URL}/api/trackedEntityInstances/query.json?ou=${props.orgUnitId}&ouMode=ACCESSIBLE&program=n2iAPy3PGx7&attribute=tUjM7KxKvCO:LIKE:${beneficiarySearch}&attribute=FwEpAEagGeK:LIKE:${trackFilter}&pageSize=50&page=1&totalPages=false`);
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

        const filtered = props.orgUnitDetails.filter(item => {
            const searchFields = [
                item.recordDate?.toLowerCase(),
                item.beneficiaryStage?.toLowerCase(),
                item.patientID?.toLowerCase(),
                item.first_middleName?.toLowerCase(),
                item.surname?.toLowerCase(),
                item.sex?.toLowerCase(),
                item.initialMuac?.toString().toLowerCase(),
                item.muacClassification?.toLowerCase(),
                item.ben_facility_RegNo?.toLowerCase(),
                item.directPatientID?.toLowerCase(),
                item.track?.toLowerCase()
            ];

            return searchFields.some(field => field?.includes(searchValue));
        });

        setFilteredData(filterDataByDate(filtered, dateFilter));
    };

    // Function to close the modal
    const closeModal = () => {
        setIsModalVisible(false);

        setBeneficiarySearch(''); // Reset search input
        setSelectedRecord(null); // Reset selected record
        setShowFilterForm(false); // Hide filter form
    };

    const generatePatientId = async (): Promise<string> => {
        try {
            const response = await axios.get(
                `${process.env.REACT_APP_DHIS2_BASE_URL}/api/trackedEntityAttributes/m35qF41KIdK/generate`,
                {
                    headers: { 'Content-Type': 'application/json' }
                }
            );
            return response.data.value;  // patient id
        } catch (error) {
            console.error('Error generating patient ID:', error);
            return ''; // or handle error appropriately
        }
    };

    const handleNewBeneficiaryClick = async () => {
        // Auto generate the Patient ID
        const newPatientId = await generatePatientId();
        // Update newRowData to include the generated patient ID:
        setNewRowData(prev => ({
            ...prev,
            patientID: newPatientId
        }));
        setIsAddingNewRow(true);
    };

    const handleIndirectBeneficiaryAdd = async () => {
        // Generate a Patient ID from the system
        const newIndirectPatientId = await generatePatientId();

        // Ensure that directPatientID is set from the selected beneficiary. 
        // If selectedBeneficiary is null, handle appropriately.
        const directPatientIDValue = selectedBeneficiary ? selectedBeneficiary.patientID : '';

        // Update newIndirectData state with the auto-generated IDs
        setNewIndirectData(prev => ({
            ...prev,
            patientID: newIndirectPatientId,
            directPatientID: directPatientIDValue // auto-populated
        }));

        // Trigger the display of your indirect beneficiary input form
        setIsAddingIndirect(true);
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
        const selectedTrack = event.target.value;
        setTrackFilter(selectedTrack);
        setNewRowData((prevData) => ({ ...prevData, track: selectedTrack })); // Set the selected track in newRowData
        // Implement your data fetching logic here
    };

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);

            try {
                // First request: Fetch the organization unit code
                const orgUnitCodeResponse = await fetch(
                    `${process.env.REACT_APP_DHIS2_BASE_URL}/api/organisationUnits/${props.orgUnitId}`,
                    // `api/organisationUnits/${props.orgUnitId}`,
                    {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            // 'Authorization': `Basic ${credentials}`,
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
                        // `api/trackedEntityAttributes/oqabsHE0ZUI/generate?ORG_UNIT_CODE=${orgUnitCode}`,
                        {
                            method: 'GET',
                            headers: {
                                'Content-Type': 'application/json',
                                // 'Authorization': `Basic ${credentials}`,
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
                // `api/system/id?`, //with proxy
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        // 'Authorization': `Basic ${credentials}`,
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
                // `api/me`, //with proxy
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        // 'Authorization': `Basic ${credentials}`,
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
        // const newId = await generateTrackInstId();
        // if (!newId) {
        //     console.error('Failed to generate a new trackedEntityInstance ID.');
        //     setLoading(false);
        //     setMessage('Failed to generate a new trackedEntityInstance ID.');
        //     return;
        // }

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
                { attribute: "MX1mGZlngtD", value: newRowData.initialMuac },
                { attribute: "KNLojwshHCv", value: newRowData.muacClassification },
                { attribute: "BDFFygBWNSH", value: newRowData.ben_facility_RegNo },
                { attribute: "M9jR50uouZV", value: newRowData.directPatientID },
                { attribute: "fTfrFfUPTDC", value: newRowData.beneficiaryType }
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
                program: "n2iAPy3PGx7",
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

            const enrollmentResponseData = await response2.json();
            const enrollmentId = enrollmentResponseData.response.importSummaries[0].reference;

            // Third payload - create event after enrollment
            const payload3 = {
                events: [{
                    trackedEntityInstance: trackedEntityInstance,
                    program: 'n2iAPy3PGx7',
                    programStage: PROGRAM_STAGE_MAPPING[trainingFilter], // Dynamic from current filter
                    orgUnit: props.orgUnitId,
                    enrollment: enrollmentId, // Use the enrollment from previous step
                    dueDate: newRowData.recordDate,
                    eventDate: newRowData.recordDate,
                    status: 'ACTIVE'
                }]
            };

            const response3 = await fetch(
                `${process.env.REACT_APP_DHIS2_BASE_URL}/api/events`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        // 'Authorization': `Basic ${credentials}`,
                    },
                    body: JSON.stringify(payload3),
                }
            );

            if (!response3.ok) {
                throw new Error('Failed to create event');
            }

            const eventResponseData = await response3.json();
            const createdEventId = eventResponseData.response.importSummaries[0].reference;

            console.log(`✅ Event created with ID: ${createdEventId}`);


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
                initialMuac: '',
                muacClassification: '',
                ben_facility_RegNo: '',
                directPatientID: '',
                beneficiaryType: '',
                muacColor: '#ffffff'
            });
            setDateFilter('');

            // await indexedDBManager.markBeneficiaryAsSynced(beneficiaryId); // change savedOnline flag to true
            setMessage('Beneficiary successfully created and saved online!');
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

    const handleSaveIndirect = async () => {
        setLoading(true);

        const userData = await fetchUser();
        if (!userData) {
            console.error('Failed to get username.');
            setMessage('Failed to get username.');
            setIsError(true);
            setLoading(false);
            return;
        }

        try {
            // --- Payload 1: trackedEntityInstance ---
            const payload1 = {
                trackedEntityType: "b8gedH8Po5d",
                orgUnit: props.orgUnitId,
                attributes: [
                    { attribute: "FwEpAEagGeK", value: newIndirectData.track },
                    { attribute: "IVvy19BmIOw", value: newIndirectData.sex },
                    { attribute: "lvpNOLmDEEG", value: newIndirectData.age },
                    { attribute: "m35qF41KIdK", value: newIndirectData.patientID },
                    { attribute: "r0AIdmEpPN9", value: newIndirectData.dob },
                    { attribute: "KmxskLLhS0k", value: newIndirectData.beneficiaryStage },
                    { attribute: "tUjM7KxKvCO", value: newIndirectData.first_middleName },
                    { attribute: "xts0QtWHpnK", value: newIndirectData.surname },
                    { attribute: "MX1mGZlngtD", value: newIndirectData.initialMuac },
                    { attribute: "KNLojwshHCv", value: newIndirectData.muacClassification },
                    { attribute: "BDFFygBWNSH", value: newIndirectData.ben_facility_RegNo },
                    { attribute: "M9jR50uouZV", value: newIndirectData.directPatientID }, // Auto-populated
                    // { attribute: "fTfrFfUPTDC", value: 'Indirect Beneficiary' }
                ]
            };

            const response1 = await fetch(`${process.env.REACT_APP_DHIS2_BASE_URL}/api/trackedEntityInstances`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload1)
            });

            if (!response1.ok) throw new Error('Failed to create tracked entity instance');

            const trackedEntityInstance = (await response1.json()).response.importSummaries[0].reference;

            // --- Payload 2: enrollment ---
            const payload2 = {
                trackedEntityInstance: trackedEntityInstance,
                program: "n2iAPy3PGx7",
                status: "ACTIVE",
                orgUnit: props.orgUnitId,
                enrollmentDate: newIndirectData.recordDate,
                incidentDate: new Date().toISOString()
            };

            const response2 = await fetch(`${process.env.REACT_APP_DHIS2_BASE_URL}/api/enrollments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload2)
            });

            if (!response2.ok) throw new Error('Failed to create enrollment');

            const enrollmentId = (await response2.json()).response.importSummaries[0].reference;

            // --- Payload 3: event ---
            const payload3 = {
                events: [{
                    trackedEntityInstance: trackedEntityInstance,
                    program: 'n2iAPy3PGx7',
                    programStage: PROGRAM_STAGE_MAPPING[trainingFilter],
                    orgUnit: props.orgUnitId,
                    enrollment: enrollmentId,
                    dueDate: newIndirectData.recordDate,
                    eventDate: newIndirectData.recordDate,
                    status: 'ACTIVE'
                }]
            };

            const response3 = await fetch(`${process.env.REACT_APP_DHIS2_BASE_URL}/api/events`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload3)
            });

            if (!response3.ok) throw new Error('Failed to create event');

            const createdEventId = (await response3.json()).response.importSummaries[0].reference;
            console.log(`✅ Indirect Event created with ID: ${createdEventId}`);

            // Reset the form
            setNewIndirectData({
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
                initialMuac: '',
                muacClassification: '',
                ben_facility_RegNo: '',
                directPatientID: '', // Still auto-filled before submit
                muacColor: '#ffffff'
            });

            setMessage('Indirect beneficiary successfully saved!');
            setIsError(false);
            setIsAddingIndirect(false);

        } catch (error) {
            console.error('Error saving indirect beneficiary:', error);
            setMessage('Error saving indirect beneficiary.');
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
            initialMuac: '',
            muacClassification: '',
            ben_facility_RegNo: '',
            directPatientID: ''

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
            const additionalData = await fetchAdditionalData(activity.trackInstanceId, trainingFilter, trackFilter);
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

    // Function to handle posting additional columns 
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
                            { value: addColRow_lvh.topicsTrainedOn.appliedLessons, dataElement: 'ZBAx5UMH63F' },
                            { value: addColRow_lvh.topicsTrainedOn.increasedIncome ? 'true' : 'false', dataElement: 'Tbnq2F0xX7D' },
                            { value: addColRow_lvh.topicsTrainedOn.increasedProduction ? 'true' : 'false', dataElement: 'GwKxMZ8yaBm' },
                            { value: addColRow_lvh.topicsTrainedOn.newLivelihood ? 'true' : 'false', dataElement: 'Ee8oyMX7Aoc' },
                            { value: addColRow_lvh.topicsTrainedOn.increasedSkills ? 'true' : 'false', dataElement: 'I2KTNrvwsHT' },
                            { value: addColRow_lvh.topicsTrainedOn.increasedResilience ? 'true' : 'false', dataElement: 'RW2BS4l5KcN' },
                            { value: addColRow_lvh.topicsTrainedOn.others, dataElement: 'Si8dOtSlomM' }
                        ]
                        : [
                            // Fisher track data elements remain unchanged
                            { value: addColRow_lvh.fishingMethods.fishingOilPreparation ? 'true' : 'false', dataElement: 'erCm8YopB1D' },
                            { value: addColRow_lvh.fishingMethods.fishingMarketing ? 'true' : 'false', dataElement: 'QpLUEvB2sdy' },
                            { value: addColRow_lvh.fishingMethods.fishingMethods ? 'true' : 'false', dataElement: 'OKc4NRIE3rS' },
                            { value: addColRow_lvh.fishingMethods.postHandlingMethods ? 'true' : 'false', dataElement: 'SinFNAlonqG' },
                            { value: addColRow_lvh.fishingMethods.appliedLessons ? 'true' : 'false', dataElement: 'EvDeWfQDiuz' }
                        ]),
                    // Remove the commented out fields

                ],
                event: eventId,
                program: 'n2iAPy3PGx7',
                programStage: 'H0vCgsI1d4M',
                orgUnit: props.orgUnitId,
                trackedEntityInstance: trackInstId,
                status: 'COMPLETED',
                // dueDate: addColRow_lvh.dueDate,
                eventDate: fetchedDates[trackInstId]?.reportDate,
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
                program: 'n2iAPy3PGx7',
                programStage: 'RXTq2YFOH5c',
                orgUnit: props.orgUnitId,
                trackedEntityInstance: trackInstId,
                status: 'COMPLETED',
                // dueDate: addColRow_lvh.dueDate,
                eventDate: fetchedDates[trackInstId]?.reportDate,
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
                program: 'n2iAPy3PGx7',
                programStage: 'bTVReRuHapT',
                orgUnit: props.orgUnitId,
                trackedEntityInstance: trackInstId,
                status: 'ACTIVE',
                // dueDate: addColRow_lvh.dueDate,
                eventDate: fetchedDates[trackInstId]?.reportDate,
            };
        }
        console.log({
            'Event Date': fetchedDates[trackInstId]?.reportDate,
            'Event Date 1': addColRow_lvh.reportDate
        })
        try {
            if (isEditing) {
                // PUT request for editing an existing record
                const response = await axios.put(`${process.env.REACT_APP_DHIS2_BASE_URL}/api/events/${id}`,
                    {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            // 'Authorization': `Basic ${credentials}`,
                        },
                        body: JSON.stringify(payload),
                    }
                );
                console.log('Entry updated:', response.data);
                // Handle success (e.g., update state, show message)
            } else {
                // POST request for adding a new record
                const response = await axios.post(`${process.env.REACT_APP_DHIS2_BASE_URL}/api/events`,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            // 'Authorization': `Basic ${credentials}`,
                        },
                        body: JSON.stringify(payload),
                    }
                );
                console.log('New entry added:', response.data);
                // Handle success (e.g., update state, show message)
            }
        } catch (error) {
            console.error('Error saving entry:', error);
            // Handle error (e.g., show error message)
        }
    };

    // POST Date - create event 
    // const handleReportDateSubmit = async (
    //     e: React.KeyboardEvent<HTMLInputElement> | React.FocusEvent<HTMLInputElement>,
    //     trackInstanceId: string
    //   ) => {
    //     const reportDate = fetchedDates[trackInstanceId]?.reportDate;
    //     if (e.type === 'Enter') {           

    //         if (!reportDate) {
    //             setHasValidDate(prev => ({ ...prev, [trackInstanceId]: false }));
    //             setMessage('Date of training is required');
    //             setIsError(true);
    //             return;
    //           }

    //         try {
    //             const payload = {
    //                 events: [{
    //                     trackedEntityInstance: trackInstanceId,
    //                     program: 'n2iAPy3PGx7',
    //                     programStage: PROGRAM_STAGE_MAPPING[trainingFilter],
    //                     enrollment: '', // Optional: can be fetched/stored
    //                     orgUnit: props.orgUnitId,
    //                     notes: [],
    //                     dataValues: [],
    //                     status: 'ACTIVE',
    //                     eventDate: reportDate,
    //                 }]
    //             };

    //             const response = await axios.post(`${process.env.REACT_APP_DHIS2_BASE_URL}/api/events`, payload);
    //             const createdEventId = response.data.response.importSummaries[0].reference;

    //             setFetchedDates(prev => ({
    //                 ...prev,
    //                 [trackInstanceId]: {
    //                     ...prev[trackInstanceId],
    //                     eventId: createdEventId
    //                 }
    //             }));

    //             setHasValidDate(prev => ({ ...prev, [trackInstanceId]: true }));

    //             console.log(`✅ Event created: ${createdEventId}`);
    //         } catch (error) {
    //             console.error('❌ Error creating event:', error);
    //             setHasValidDate(prev => ({ ...prev, [trackInstanceId]: false }));
    //         }
    //     }
    // };
    const handleReportDateSubmit = async (
        e: React.KeyboardEvent<HTMLInputElement> | React.FocusEvent<HTMLInputElement>,
        trackInstanceId: string
    ) => {
        // Handle both Enter key and blur events
        if (e.type === 'keydown') {
            const keyboardEvent = e as React.KeyboardEvent<HTMLInputElement>;
            if (keyboardEvent.key !== 'Enter') return;
        }

        const reportDate = fetchedDates[trackInstanceId]?.reportDate;

        if (!reportDate) {
            setHasValidDate(prev => ({ ...prev, [trackInstanceId]: false }));
            setMessage('Date of training is required');
            setIsError(true);
            return;
        }

        try {
            const payload = {
                events: [{
                    trackedEntityInstance: trackInstanceId,
                    program: 'n2iAPy3PGx7',
                    programStage: PROGRAM_STAGE_MAPPING[trainingFilter],
                    enrollment: '',
                    orgUnit: props.orgUnitId,
                    notes: [],
                    dataValues: [],
                    status: 'ACTIVE',
                    eventDate: reportDate,
                }]
            };

            const response = await axios.post(
                `${process.env.REACT_APP_DHIS2_BASE_URL}/api/events`,
                payload
            );

            const createdEventId = response.data.response.importSummaries[0].reference;

            setFetchedDates(prev => ({
                ...prev,
                [trackInstanceId]: {
                    ...prev[trackInstanceId],
                    eventId: createdEventId
                }
            }));

            setHasValidDate(prev => ({ ...prev, [trackInstanceId]: true }));
            console.log(`✅ Event created: ${createdEventId}`);

        } catch (error) {
            console.error('❌ Error creating event:', error);
            setHasValidDate(prev => ({ ...prev, [trackInstanceId]: false }));
            setMessage('Failed to save training date');
            setIsError(true);
        }
    };

    // PUT remaining data elements 
    const sendDataValueUpdate = async (
        trackInstanceId: string,
        dataElementName: string,
        value: string | boolean
    ) => {
        const eventId = fetchedDates[trackInstanceId]?.eventId;
        const orgUnit = props.orgUnitId;
        const program = 'n2iAPy3PGx7';
        const programStage = PROGRAM_STAGE_MAPPING[trainingFilter];

        if (!eventId || !dataElementName) return;

        console.log('Event ID for addn cols: ', eventId);

        const dataElementId = dataElementIDsByFilter[trainingFilter]?.[trackFilter]?.[dataElementName] ||
            dataElementIDsByFilter[trainingFilter]?.[dataElementName];

        if (!dataElementId) {
            console.warn(`❌ Missing dataElementId for ${dataElementName}`);
            return;
        }

        const payload = {
            event: eventId,
            orgUnit,
            program,
            programStage,
            trackedEntityInstance: trackInstanceId,
            status: 'ACTIVE',
            dataValues: [
                {
                    dataElement: dataElementId,
                    value: typeof value === 'boolean' ? (value ? 'true' : 'false') : value,
                    providedElsewhere: false
                }
            ]
        };

        try {
            await axios.put(`${process.env.REACT_APP_DHIS2_BASE_URL}/api/events/${eventId}/${dataElementId}`, payload);
            console.log(`✅ PUT: ${dataElementName} = ${value}`);
        } catch (error) {
            console.error('❌ Failed to send data value update:', error);
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

    const handleDateChangeForFetchedDates = (trackInstanceId: string, newDate: string) => {
        setFetchedDates((prev) => ({
            ...prev,
            [trackInstanceId]: {
                ...prev[trackInstanceId],
                reportDate: newDate,
            },
        }));
    };

    const handleDataValueChange = (
        trackInstanceId: string,
        dataElementName: string,
        value: string | boolean
    ) => {
        if (!hasValidDate[trackInstanceId]) {
            setMessage('Please set Date of Training first');
            setIsError(true);
            return;
        }
        setFetchedDates((prev) => ({
            ...prev,
            [trackInstanceId]: {
                ...prev[trackInstanceId],
                dataValues: {
                    ...prev[trackInstanceId]?.dataValues,
                    [dataElementName]: value,
                },
            },
        }));

        // Send immediately for checkboxes
        if (typeof value === 'boolean') {
            sendDataValueUpdate(trackInstanceId, dataElementName, value);
        }
    };

    const fetchAdditionalData = async (trackInstanceId: string, trainingFilter: string, trackFilter: string): Promise<FetchedData> => {
        const programStageMap = {
            'Livelihood': 'H0vCgsI1d4M',
            'Nutrition': 'RXTq2YFOH5c',
            'Water Sanitation & Hygiene': 'bTVReRuHapT',
        };

        const programStage = programStageMap[trainingFilter];
        const url = `${process.env.REACT_APP_DHIS2_BASE_URL}/api/trackedEntityInstances/${trackInstanceId}.json?program=n2iAPy3PGx7&programStage=${programStage}&fields=enrollments[events[*]]`;
        console.log('API URL:', url);

        try {
            const response = await axios.get(url);
            const data = response.data;

            // Initialize with empty values
            let reportDate = '';
            let dueDate = '';
            let eventId = '';
            const dataValues: { [key: string]: string } = {};

            if (data.enrollments && data.enrollments.length > 0) {
                const events = data.enrollments[0].events || [];

                // Find the event that matches our program stage
                const matchingEvent = events.find((event: any) =>
                    event.programStage === programStage
                );

                if (matchingEvent) {
                    reportDate = matchingEvent.eventDate;
                    dueDate = matchingEvent.dueDate;
                    eventId = matchingEvent.event;

                    // Process data values
                    matchingEvent.dataValues?.forEach((dataValue) => {
                        Object.entries(dataValueMapping).forEach(([accessorKey, label]) => {
                            const expectedId = dataElementMapping[trainingFilter]?.[trackFilter]?.[label]
                                || dataElementMapping[trainingFilter]?.[label];

                            
                            if (expectedId === dataValue.dataElement) {
                                dataValues[label] = dataValue.value;
                            }


                        });
                    });

                }
            }

            return {
                reportDate,
                dueDate,
                eventId,
                dataValues,
            };



        } catch (error) {
            console.error('Error fetching additional data:', error);
            return { reportDate: '', dueDate: '', eventId: '', dataValues: {} };
        }
    };

    const handleFilterChange = async (newFilter: string) => {
        
        console.log('Filter changed to:', newFilter, 'filteredData:', filteredData); 
        setTrainingFilter(newFilter); // Update the training filter state
        setSelectedProgramStage(newFilter as ProgramStage); // Update selectedProgramStage

        if (newFilter === 'Nutrition') {
            setTrackFilter(''); // Clear track selection
          }

        // Update columns immediately when filter changes
        setAdditionalColumns(getAdditionalColumns(newFilter));

        // Fetch additional data for all rows based on the new filter
        const updatedFetchedDates = await Promise.all(
            filteredData.map(async (activity) => {
                const additionalData = await fetchAdditionalData(activity.trackInstanceId, newFilter, trackFilter);
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

    const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toISOString().split('T')[0];
    };

    // Muac Classification
    const computeMuacClassification = (muac: string, stage: string): string => {
        const muacValue = parseFloat(muac);
        if (isNaN(muacValue)) return '';

        if (stage === 'Child') {
            if (muacValue < 11.5) return 'Severe <11.5 cm (Red)';
            if (muacValue < 12.5) return 'Moderate >=11.5 - < 12.5 cm (Yellow)';
            return 'Normal ≥12.5 cm (Green)';
        }

        if (stage === 'Adult') {
            if (muacValue < 21) return 'Less than 21 cm (red)';
            if (muacValue < 23) return 'Less than 23 cm greater than 21 cm (yellow)';
            return 'Equals to or greater than 23 cm (green)';
        }

        return '';
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
                <tr key={activity.trackInstanceId || index}
                    onClick={(e) => {
                        e.stopPropagation();
                        handleRecordClick(activity)
                    }}
                >
                    <td>{index + 1}</td>
                    <td>{activity.recordDate}</td>
                    <td>{activity.beneficiaryStage}</td>
                    <td>{activity.beneficiaryType}</td>
                    <td>{activity.patientID}</td>
                    <td>{activity.first_middleName}</td>
                    <td>{activity.surname}</td>
                    <td>{activity.sex}</td>
                    <td>{activity.age}</td>
                    <td>{activity.dob}</td>
                    <td>{activity.initialMuac}</td>
                    <td>{activity.muacClassification}</td>
                    <td>{activity.ben_facility_RegNo}</td>
                    <td>{activity.directPatientID}</td>
                    <td>{activity.track}</td>

                    {/* Render additional data cells */}
                    {additionalColumns.map((col) => (
                        <td key={col.accessor}>
                            {(editableRows[activity.trackInstanceId] && col.accessor !== 'addEditEvent') ? (
                                col.accessor === 'reportDate' ? (
                                    <input
                                        type="date"
                                        value={fetchedDates[activity.trackInstanceId]?.reportDate?.split('T')[0] || ''}
                                        onChange={(e) =>
                                            handleDateChangeForFetchedDates(activity.trackInstanceId, e.target.value)
                                        }
                                        onKeyDown={(e) =>
                                            handleReportDateSubmit(e, activity.trackInstanceId)
                                        }
                                        onBlur={(e) =>
                                            handleReportDateSubmit(e, activity.trackInstanceId)
                                        }

                                    />
                                ) : col.accessor.includes('checkBox') ? (
                                    <input
                                        type="checkbox"
                                        disabled={!hasValidDate[activity.trackInstanceId]}
                                        className="form-check-input"
                                        checked={
                                            fetchedDates[activity.trackInstanceId]?.dataValues[
                                            dataValueMapping[col.accessor]
                                            ] === true ||
                                            fetchedDates[activity.trackInstanceId]?.dataValues[
                                            dataValueMapping[col.accessor]
                                            ] === 'true'
                                        }
                                        onChange={(e) =>
                                            handleDataValueChange(
                                                activity.trackInstanceId,
                                                dataValueMapping[col.accessor],
                                                e.target.checked
                                            )
                                        }
                                    />
                                ) : col.accessor === 'appliedLessons_dropdown' ? (
                                    <select
                                        value={
                                            String(
                                                fetchedDates[activity.trackInstanceId]?.dataValues[
                                                dataValueMapping[col.accessor]
                                                ] || ''
                                            )
                                        }
                                        onChange={(e) =>
                                            handleDataValueChange(
                                                activity.trackInstanceId,
                                                dataValueMapping[col.accessor],
                                                e.target.value
                                            )
                                        }
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                sendDataValueUpdate(activity.trackInstanceId, dataValueMapping[col.accessor], e.currentTarget.value === 'Yes' ? true : false);// ✅ boolean here
                                            }
                                        }}
                                        className="form-select"
                                    >
                                        <option value="">Select</option>
                                        <option value="Yes">Yes</option>
                                        <option value="No">No</option>
                                    </select>
                                ) : col.accessor === 'Beneficiary_Category_dropDown' ? (
                                    <select
                                        value={
                                            String(
                                                fetchedDates[activity.trackInstanceId]?.dataValues[
                                                dataValueMapping[col.accessor]
                                                ] || ''
                                            )
                                        }
                                        onChange={(e) =>
                                            handleDataValueChange(
                                                activity.trackInstanceId,
                                                dataValueMapping[col.accessor],
                                                e.target.value
                                            )
                                        }
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                sendDataValueUpdate(activity.trackInstanceId, dataValueMapping[col.accessor], e.currentTarget.value === 'Yes' ? true : false);// ✅ boolean here
                                            }
                                        }}
                                        className="form-select"
                                    >
                                        <option value="">Select</option>
                                        <option value="Pregnant">Pregnant</option>
                                        <option value="Lactating">Lactating</option>
                                        <option value="Care Giver">Care Giver</option>
                                    </select>
                                ) : col.accessor.includes('no_input') ? (
                                    <input
                                        type="number"
                                        value={
                                            Number(
                                                fetchedDates[activity.trackInstanceId]?.dataValues[
                                                dataValueMapping[col.accessor]
                                                ] || ''
                                            )
                                        }
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                sendDataValueUpdate(activity.trackInstanceId, dataValueMapping[col.accessor], e.currentTarget.value);
                                            }
                                        }}
                                        onChange={(e) =>
                                            handleDataValueChange(
                                                activity.trackInstanceId,
                                                dataValueMapping[col.accessor],
                                                e.target.value
                                            )
                                        }
                                    />
                                ) : (
                                    <input
                                        type="text"
                                        value={
                                            String(
                                                fetchedDates[activity.trackInstanceId]?.dataValues[
                                                dataValueMapping[col.accessor]
                                                ] || ''
                                            )
                                        }
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                sendDataValueUpdate(activity.trackInstanceId, dataValueMapping[col.accessor], e.currentTarget.value);
                                            }
                                        }}
                                        onChange={(e) =>
                                            handleDataValueChange(
                                                activity.trackInstanceId,
                                                dataValueMapping[col.accessor],
                                                e.target.value
                                            )
                                        }
                                    />
                                )
                            ) : (
                                col.accessor === 'reportDate' ? (
                                    fetchedDates[activity.trackInstanceId]?.reportDate?.split('T')[0] || 'N/A'
                                ) : col.accessor === 'dueDate' ? (
                                    fetchedDates[activity.trackInstanceId]?.dueDate?.split('T')[0] || 'N/A'
                                ) : col.accessor === 'addEditEvent' ? null : (
                                    col.accessor in dataValueMapping ? (
                                        fetchedDates[activity.trackInstanceId]?.dataValues[
                                        dataValueMapping[col.accessor]
                                        ] || 'N/A'
                                    ) : (
                                        activity[col.accessor] || ''
                                    )
                                )
                            )}

                            {/* Add/Edit Buttons */}
                            {col.accessor === 'addEditEvent' && (
                                <div className="button-container">
                                    {editableRows[activity.trackInstanceId] ? (
                                        <>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleSave(
                                                        activity.trackInstanceId,
                                                        fetchedDates[activity.trackInstanceId]?.eventId
                                                    )
                                                }}
                                                style={{ backgroundColor: 'green' }}
                                                className="save-button btn"
                                            >
                                                Save
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleCancel(activity.trackInstanceId)
                                                }}
                                                style={{ backgroundColor: 'red' }}
                                                className="cancel-button btn"
                                            >
                                                Cancel
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleAdd(activity.trackInstanceId)
                                                }}
                                                style={{ backgroundColor: 'grey' }}
                                                className="add-button btn"
                                            >
                                                Add
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleEdit(activity.trackInstanceId)
                                                }}
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

    const renderIndirectRows = () => {
        if (!indirectBeneficiaries || indirectBeneficiaries.length === 0) {
            return (
                <tr>
                    <td colSpan={14} className="text-center">
                        No indirect beneficiaries found for this record
                    </td>
                </tr>
            );
        }

        return indirectBeneficiaries.map((beneficiary, index) => {
            const fetchedData: FetchedData = fetchedDates[beneficiary.trackInstanceId] || {
                reportDate: '',
                dueDate: '',
                eventId: '',
                dataValues: {}
            };

            return (
                <tr key={beneficiary.trackInstanceId || index}

                    style={{ cursor: 'pointer' }}
                >
                    {/* Main columns */}
                    <td>{index + 1}</td>
                    <td>{beneficiary.recordDate}</td>
                    <td>{beneficiary.beneficiaryStage}</td>
                    <td>{beneficiary.patientID}</td>
                    <td>{beneficiary.first_middleName}</td>
                    <td>{beneficiary.surname}</td>
                    <td>{beneficiary.sex}</td>
                    <td>{beneficiary.age}</td>
                    <td>{beneficiary.dob}</td>
                    <td>{beneficiary.initialMuac}</td>
                    <td>{beneficiary.muacClassification}</td>
                    <td>{beneficiary.ben_facility_RegNo}</td>
                    <td>{beneficiary.directPatientID}</td>
                    <td>{beneficiary.track}</td>

                    {/* Additional columns - same as main table */}
                    {additionalColumns.map((col) => (
                        <td key={col.accessor}>
                            {(editableRows[beneficiary.trackInstanceId] && col.accessor !== 'addEditEvent') ? (
                                col.accessor === 'reportDate' ? (
                                    <input
                                        type="date"
                                        value={fetchedDates[beneficiary.trackInstanceId]?.reportDate?.split('T')[0] || ''}
                                        onChange={(e) =>
                                            handleDateChangeForFetchedDates(beneficiary.trackInstanceId, e.target.value)
                                        }
                                        onKeyDown={(e) =>
                                            handleReportDateSubmit(e, beneficiary.trackInstanceId)
                                        }
                                    />
                                ) : col.accessor.includes('checkBox') ? (
                                    <input
                                        type="checkbox"
                                        checked={
                                            fetchedDates[beneficiary.trackInstanceId]?.dataValues[
                                            dataValueMapping[col.accessor]
                                            ] === true ||
                                            fetchedDates[beneficiary.trackInstanceId]?.dataValues[
                                            dataValueMapping[col.accessor]
                                            ] === 'true'
                                        }
                                        onChange={(e) =>
                                            handleDataValueChange(
                                                beneficiary.trackInstanceId,
                                                dataValueMapping[col.accessor],
                                                e.target.checked
                                            )
                                        }
                                    />
                                ) : col.accessor === 'appliedLessons_dropdown' ? (
                                    <select
                                        value={
                                            String(
                                                fetchedDates[beneficiary.trackInstanceId]?.dataValues[
                                                dataValueMapping[col.accessor]
                                                ] || ''
                                            )
                                        }
                                        onChange={(e) =>
                                            handleDataValueChange(
                                                beneficiary.trackInstanceId,
                                                dataValueMapping[col.accessor],
                                                e.target.value
                                            )
                                        }
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                sendDataValueUpdate(beneficiary.trackInstanceId, dataValueMapping[col.accessor], e.currentTarget.value === 'Yes' ? true : false);// ✅ boolean here
                                            }
                                        }}
                                        className="form-select"
                                    >
                                        <option value="">Select</option>
                                        <option value="Yes">Yes</option>
                                        <option value="No">No</option>
                                    </select>
                                ) : col.accessor === 'Beneficiary_Category_dropDown' ? (
                                    <select
                                        value={
                                            String(
                                                fetchedDates[beneficiary.trackInstanceId]?.dataValues[
                                                dataValueMapping[col.accessor]
                                                ] || ''
                                            )
                                        }
                                        onChange={(e) =>
                                            handleDataValueChange(
                                                beneficiary.trackInstanceId,
                                                dataValueMapping[col.accessor],
                                                e.target.value
                                            )
                                        }
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                sendDataValueUpdate(beneficiary.trackInstanceId, dataValueMapping[col.accessor], e.currentTarget.value === 'Yes' ? true : false);// ✅ boolean here
                                            }
                                        }}
                                        className="form-select"
                                    >
                                        <option value="">Select</option>
                                        <option value="Pregnant">Pregnant</option>
                                        <option value="Lactating">Lactating</option>
                                        <option value="Care Giver">Care Giver</option>
                                    </select>
                                ) : col.accessor.includes('no_input') ? (
                                    <input
                                        type="number"
                                        value={
                                            Number(
                                                fetchedDates[beneficiary.trackInstanceId]?.dataValues[
                                                dataValueMapping[col.accessor]
                                                ] || ''
                                            )
                                        }
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                sendDataValueUpdate(beneficiary.trackInstanceId, dataValueMapping[col.accessor], e.currentTarget.value);
                                            }
                                        }}
                                        onChange={(e) =>
                                            handleDataValueChange(
                                                beneficiary.trackInstanceId,
                                                dataValueMapping[col.accessor],
                                                e.target.value
                                            )
                                        }
                                    />
                                ) : (
                                    <input
                                        type="text"
                                        value={
                                            String(
                                                fetchedDates[beneficiary.trackInstanceId]?.dataValues[
                                                dataValueMapping[col.accessor]
                                                ] || ''
                                            )
                                        }
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                sendDataValueUpdate(beneficiary.trackInstanceId, dataValueMapping[col.accessor], e.currentTarget.value);
                                            }
                                        }}
                                        onChange={(e) =>
                                            handleDataValueChange(
                                                beneficiary.trackInstanceId,
                                                dataValueMapping[col.accessor],
                                                e.target.value
                                            )
                                        }
                                    />
                                )
                            ) : (
                                col.accessor === 'reportDate' ? (
                                    fetchedDates[beneficiary.trackInstanceId]?.reportDate?.split('T')[0] || 'N/A'
                                ) : col.accessor === 'dueDate' ? (
                                    fetchedDates[beneficiary.trackInstanceId]?.dueDate?.split('T')[0] || 'N/A'
                                ) : col.accessor === 'addEditEvent' ? null : (
                                    col.accessor in dataValueMapping ? (
                                        fetchedDates[beneficiary.trackInstanceId]?.dataValues[
                                        dataValueMapping[col.accessor]
                                        ] || 'N/A'
                                    ) : (
                                        beneficiary[col.accessor] || ''
                                    )
                                )
                            )}

                            {/* Add/Edit Buttons */}
                            {col.accessor === 'addEditEvent' && (
                                <div className="button-container">
                                    {editableRows[beneficiary.trackInstanceId] ? (
                                        <>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleSave(
                                                        beneficiary.trackInstanceId,
                                                        fetchedDates[beneficiary.trackInstanceId]?.eventId
                                                    )
                                                }}
                                                style={{ backgroundColor: 'green' }}
                                                className="save-button btn"
                                            >
                                                Save
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleCancel(beneficiary.trackInstanceId)
                                                }}
                                                style={{ backgroundColor: 'red' }}
                                                className="cancel-button btn"
                                            >
                                                Cancel
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleAdd(beneficiary.trackInstanceId)
                                                }}
                                                style={{ backgroundColor: 'grey' }}
                                                className="add-button btn"
                                            >
                                                Add
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleEdit(beneficiary.trackInstanceId)
                                                }}
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
                        // 'Authorization': `Basic ${credentials}`,
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

    const handleRecordClick = (activity: OrgUnitDetails) => {
        setSelectedBeneficiary(activity);

        // Always set indirect beneficiaries (even if empty)
        const indirect = activity.patientID
            ? props.orgUnitDetails.filter(b => b.directPatientID === activity.patientID)
            : [];
        setIndirectBeneficiaries(indirect);
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
                        const selectedTrack = e.target.value;
                        setTrackFilter(e.target.value);
                        setNewRowData((prevData) => ({ ...prevData, track: selectedTrack })); // Set the selected track in newRowData
                        setNewIndirectData((prevData) => ({ ...prevData, track: selectedTrack })) // Set selected track in new Indirect ben Row
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
                            onChange={() => handleFilterChange('Nutrition')}
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
                    // onChange={(e) => setBeneficiarySearch(e.target.value)}
                    onChange={handleBeneficiarySearch1}
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
                        onClick={(e) => {
                            e.stopPropagation();
                            handleNewBeneficiaryClick()
                        }}
                        className="border border-gray-300 rounded-md"
                        style={{
                            borderRadius: '5px',
                            height: '40px',
                            padding: '5px 10px',
                            backgroundColor: '#f8f9fa',
                            cursor: 'pointer'
                        }}
                    >
                        + Beneficiary
                    </button>
                )}

                {/* <div style={{
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
                </div> */}
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
                                <tr key={index}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleRecordClick(row)
                                    }}
                                >
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
                                readOnly
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
                                onClick={(e) => {
                                    e.stopPropagation();
                                    resetForm()
                                }}
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
                                    <th>Is Beneficiary Adult / Child</th>
                                    <th>Beneficiary Type</th>
                                    <th>Patient ID</th>
                                    <th>First Name & Middle Name</th>
                                    <th>Surname</th>
                                    <th>Sex</th>
                                    <th>Age</th>
                                    <th>Date of Birth</th>
                                    <th>Initial Muac</th>
                                    <th>Muac Classification</th>
                                    <th>Beneficiary Facility Registration Number</th>
                                    <th>Direct Patient ID</th>
                                    <th>Beneficiary Track</th>

                                    {/* Render additional headers */}
                                    {additionalColumns.map((col) => (
                                        <th key={col.accessor}
                                            className={col.headerClassName}
                                        >{col.Header}</th>
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
                                                className="table-input"
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
                                            <select
                                                className="table-select"
                                                name="beneficiaryStage"
                                                value={newRowData.beneficiaryStage}
                                                // onChange={(e) => setNewRowData({ ...newRowData, beneficiaryStage: e.target.value })}

                                                onChange={(e) => {
                                                    const newStage = e.target.value;
                                                    const classification = computeMuacClassification(newRowData.initialMuac, newStage);

                                                    setNewRowData((prev) => ({
                                                        ...prev,
                                                        beneficiaryStage: newStage,
                                                        muacClassification: classification,
                                                    }));
                                                }}
                                            >
                                                <option value="">Select Beneficiary Stage</option>
                                                <option value="Adult">Adult</option>
                                                <option value="Child">Child</option>
                                            </select>
                                        </td>
                                        <td>
                                            <select
                                                className="table-select"
                                                name="beneficiaryType"
                                                value={newRowData.beneficiaryType}
                                                onChange={(e) =>
                                                    setNewRowData({ ...newRowData, beneficiaryType: e.target.value })
                                                }
                                            >
                                                <option value="">Select Beneficiary Type</option>
                                                <option value="Direct Beneficiary">Direct Beneficiary</option>
                                                <option value="Indirect Beneficiary">Indirect Beneficiary</option>
                                            </select>
                                        </td>
                                        <td>
                                            <input
                                                type="text"
                                                className="table-input"
                                                name="patientID"
                                                value={newRowData.patientID}
                                                // onChange={handleNewRowInputChange}
                                                onChange={(e) => setNewRowData({ ...newRowData, patientID: e.target.value })}
                                                placeholder="Patient ID"
                                                readOnly
                                            />
                                        </td>
                                        <td>
                                            <input
                                                type="text"
                                                className="table-input"
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
                                                className="table-input"
                                                name="surname"
                                                value={newRowData.surname}
                                                // onChange={handleNewRowInputChange}
                                                onChange={(e) => setNewRowData({ ...newRowData, surname: e.target.value })}
                                                placeholder="Surname"
                                            />
                                        </td>
                                        <td>
                                            <select
                                                className="table-select"
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
                                                type="number"
                                                className="table-input"
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
                                            <input
                                                type="text"
                                                className="table-input"
                                                name="initialMuac"
                                                value={newRowData.initialMuac}
                                                // onChange={handleNewRowInputChange}
                                                // onChange={(e) => {
                                                //     setNewRowData({ ...newRowData, initialMuac: e.target.value })}
                                                // }
                                                onChange={(e) => {
                                                    const newMuac = e.target.value;
                                                    const classification = computeMuacClassification(newMuac, newRowData.beneficiaryStage);

                                                    setNewRowData((prev) => ({
                                                        ...prev,
                                                        initialMuac: newMuac,
                                                        muacClassification: classification,
                                                    }));
                                                }}
                                                placeholder="Initial Muac"
                                            />
                                        </td>
                                        <td>
                                            <input
                                                type="text"
                                                className="table-input"
                                                name="muacClassification"
                                                value={newRowData.muacClassification}

                                                placeholder="Muac Classification"
                                                readOnly
                                            />
                                        </td>
                                        <td>
                                            <input
                                                type="text"
                                                className="table-input"
                                                name="ben_facility_RegNo"
                                                value={newRowData.ben_facility_RegNo}
                                                // onChange={handleNewRowInputChange}
                                                onChange={(e) => setNewRowData({ ...newRowData, ben_facility_RegNo: e.target.value })}
                                                placeholder="Beneficiary Facility Registration Number"
                                            />
                                        </td>
                                        <td>
                                            <input
                                                type="text"
                                                className="table-input"
                                                name="directPatientID"
                                                value={newRowData.directPatientID}
                                                // onChange={handleNewRowInputChange}
                                                onChange={(e) => setNewRowData({ ...newRowData, directPatientID: e.target.value })}
                                                placeholder="Direct Patient ID"
                                            />
                                        </td>
                                        <td>
                                            <input
                                                type="text"
                                                className="table-input"
                                                name="track"
                                                value={newRowData.track}
                                                // onChange={handleNewRowInputChange}
                                                onChange={(e) => setNewRowData({ ...newRowData, track: e.target.value })}
                                                readOnly
                                                placeholder="Beneficiary Track"
                                            />
                                        </td>

                                        {/* Add more input fields for other data as needed */}
                                        <td>
                                            <button onClick={(e) => {
                                                e.stopPropagation();
                                                handleFormSubmit(e);
                                            }}
                                                className="submit-button">Save</button>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            {selectedBeneficiary && (
                <div className="mt-8">
                    <div className="flex justify-between items-center mb-4">
                        <h5 style={{ padding: '10px' }} >Indirect Beneficiaries for Patient: {selectedBeneficiary.patientID}</h5>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleIndirectBeneficiaryAdd();
                            }}
                            className="border border-gray-300 rounded-md"
                            style={{
                                borderRadius: '5px',
                                height: '40px',
                                padding: '5px 10px',
                                backgroundColor: '#f8f9fa',
                                cursor: 'pointer',
                                marginLeft: '10px'
                            }}
                        >
                            + Indirect Beneficiary
                        </button>
                    </div>

                    <div className="table-responsive">
                        <table className="table table-striped table-bordered table-hover table-dark-header">
                            <thead>
                                <tr>
                                    {/* Same headers as main table */}
                                    <th>No.</th>
                                    <th>Registration Date</th>
                                    <th>Is Beneficiary Adult / Child</th>

                                    <th>Patient ID</th>
                                    <th>First Name & Middle Name</th>
                                    <th>Surname</th>
                                    <th>Sex</th>
                                    <th>Age</th>
                                    <th>Date of Birth</th>
                                    <th>Initial Muac</th>
                                    <th>Muac Classification</th>
                                    <th>Beneficiary Facility Registration Number</th>
                                    <th>Direct Patient ID</th>
                                    <th>Beneficiary Track</th>

                                    {/* Additional columns header */}
                                    {additionalColumns.map((col) => (
                                        <th key={col.accessor}
                                            className={col.headerClassName}
                                        >{col.Header}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {indirectBeneficiaries.length === 0 ? (
                                    <tr>
                                        <td colSpan={14} className="text-center">
                                            No indirect beneficiaries found for this record
                                        </td>
                                    </tr>
                                ) : (
                                    renderIndirectRows()
                                )}

                                {/* {renderIndirectRows()} */}

                                {/* Editable row for new indirect beneficiary */}
                                {isAddingIndirect && (
                                    <tr>
                                        <td>NEW</td>
                                        <td>
                                            <input
                                                type="date"
                                                value={newIndirectData.recordDate}
                                                onChange={(e) => setNewIndirectData({ ...newIndirectData, recordDate: e.target.value })}
                                            />
                                        </td>
                                        <td>
                                            <select
                                                className="table-select"
                                                name="beneficiaryStage"
                                                value={newIndirectData.beneficiaryStage}
                                                // onChange={(e) => setNewRowData({ ...newRowData, beneficiaryStage: e.target.value })}

                                                onChange={(e) => {
                                                    const newStage = e.target.value;
                                                    const classification = computeMuacClassification(newIndirectData.initialMuac, newStage);

                                                    setNewIndirectData((prev) => ({
                                                        ...prev,
                                                        beneficiaryStage: newStage,
                                                        muacClassification: classification,
                                                    }));
                                                }}
                                            >
                                                <option value="">Select Beneficiary Stage</option>
                                                <option value="Adult">Adult</option>
                                                <option value="Child">Child</option>
                                            </select>
                                        </td>
                                        <td>
                                            <input
                                                type="text"
                                                className="table-input"
                                                value={newIndirectData.patientID}
                                                onChange={(e) => setNewIndirectData({ ...newIndirectData, patientID: e.target.value })}
                                                readOnly
                                            />
                                        </td>
                                        <td>
                                            <input
                                                type="text"
                                                value={newIndirectData.first_middleName}
                                                onChange={(e) => setNewIndirectData({ ...newIndirectData, first_middleName: e.target.value })}
                                            />
                                        </td>
                                        <td>
                                            <input
                                                type="text"
                                                className="table-input"
                                                value={newIndirectData.surname}
                                                onChange={(e) => setNewIndirectData({ ...newIndirectData, surname: e.target.value })}
                                            />
                                        </td>
                                        <td>
                                            <select
                                                className="table-select"
                                                value={newIndirectData.sex}
                                                onChange={(e) => setNewIndirectData({ ...newIndirectData, sex: e.target.value })}
                                            >
                                                <option value="Male">Male</option>
                                                <option value="Female">Female</option>
                                            </select>
                                        </td>
                                        <td>
                                            <input
                                                type="number"
                                                className="table-input"
                                                name="age"
                                                value={newIndirectData.age}
                                                // onChange={handleNewRowInputChange}
                                                onChange={(e) => setNewIndirectData({ ...newIndirectData, age: e.target.value })}
                                                placeholder="Age"
                                            />
                                        </td>
                                        <td>
                                            <input
                                                type="date"
                                                name="dob"
                                                value={newIndirectData.dob}
                                                // onChange={handleNewRowInputChange}
                                                onChange={(e) => setNewIndirectData({ ...newIndirectData, dob: e.target.value })}

                                            />
                                        </td>
                                        <td>
                                            <input
                                                type="text"
                                                className="table-input"
                                                name="initialMuac"
                                                value={newIndirectData.initialMuac}
                                                // onChange={handleNewRowInputChange}
                                                // onChange={(e) => setNewIndirectData({ ...newIndirectData, initialMuac: e.target.value })}
                                                onChange={(e) => {
                                                    const newMuac = e.target.value;
                                                    const classification = computeMuacClassification(newMuac, newIndirectData.beneficiaryStage);

                                                    setNewIndirectData((prev) => ({
                                                        ...prev,
                                                        initialMuac: newMuac,
                                                        muacClassification: classification,
                                                    }));
                                                }}

                                                placeholder="Initial Muac"
                                            />
                                        </td>
                                        <td>
                                            <input
                                                type="text"
                                                className="table-input"
                                                name="muacClassification"
                                                value={newIndirectData.muacClassification}

                                                placeholder="Muac Classification"
                                                readOnly
                                            />
                                        </td>
                                        <td>
                                            <input
                                                type="text"
                                                className="table-input"
                                                name="ben_facility_RegNo"
                                                value={newIndirectData.ben_facility_RegNo}
                                                // onChange={handleNewRowInputChange}
                                                onChange={(e) => setNewIndirectData({ ...newIndirectData, ben_facility_RegNo: e.target.value })}
                                                placeholder="Beneficiary Facility Registration Number"
                                            />
                                        </td>
                                        <td>
                                            <input
                                                type="text"
                                                className="table-input"
                                                name="directPatientID"
                                                value={newIndirectData.directPatientID}
                                                // onChange={handleNewRowInputChange}
                                                // onChange={(e) => setNewIndirectData({ ...newIndirectData, directPatientID: e.target.value })}
                                                placeholder="Direct Patient ID"
                                                readOnly
                                            />
                                        </td>
                                        <td>
                                            <input
                                                type="text"
                                                className="table-input"
                                                name="track"
                                                value={newIndirectData.track}
                                                // onChange={handleNewRowInputChange}
                                                onChange={(e) => setNewIndirectData({ ...newIndirectData, track: e.target.value })}
                                                readOnly
                                                placeholder="Beneficiary Track"
                                            />
                                        </td>
                                        <td>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleSaveIndirect()
                                                }
                                                }
                                                className="bg-green-500 text-white px-3 py-1 rounded mr-2"
                                            >
                                                Save
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setIsAddingIndirect(false)
                                                }}
                                                className="bg-red-500 text-white px-3 py-1 rounded"
                                            >
                                                Cancel
                                            </button>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {!formVisible && <TablePagination table={table} />}
        </main>

    );



}

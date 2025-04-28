import { useEffect, useRef, useState } from 'react';
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

type Props = {
    orgUnitDetails: OrgUnitDetails[];
    orgUnitId: string;

};

interface FetchedData {
    reportDate: string;
    dueDate: string;
    eventId: string;
    events?: { [training: string]: string };
    dataValues: { [key: string]: string | boolean }; // To hold the values for each data element
    muacEventId?: string; // New field for MUAC-specific event
}


type ProgramStage = 'Livelihood' | 'Water Sanitation & Hygiene' | 'Nutrition' | '';


export function OrgUnitTable(props: Props) {

    const PROGRAM_STAGE_MAPPING = {
        'Livelihood': 'H0vCgsI1d4M',
        'Water Sanitation & Hygiene': 'bTVReRuHapT',
        'Nutrition': 'RXTq2YFOH5c',
        'Muac Assessment': 'HEukVrLC2dT'
    };

    const muacDataElementMapping: Record<string, string> = {
        'Oedema': 'uOJmECsPp5M',
        'Muac': 'LQNXHgUuLbD',
        'Muac Classification': 'zDIgqaXsxjg'
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
            'Dangers of mixed feeding in the first 6 months': 'tcriRRaX8Vb',
            'Breastfeeding on demand, both day and night': 'HVXgSsvtrY3',
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
        },
        'Muac Assessment': {
            'Oedema': 'uOJmECsPp5M',
            'Muac': 'LQNXHgUuLbD',
            'Muac Classification': 'zDIgqaXsxjg'
        }
    };

    const dataElementMapping = {
        'Livelihood': {
            'Fisher': {
                'Fishing Oil Preparation': 'erCm8YopB1D',
                'Fishing Marketing': 'QpLUEvB2sdy',
                'Fishing Methods': 'vsbH6WxHVrN',
                'Post Handling Methods': 'SinFNAlonqG', // Need correct ID
                'Applied Lessons': 'ZBAx5UMH63F',       // Need correct ID
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
                'Applied Lessons': 'ZBAx5UMH63F',           // Need correct ID
                'Increased income': 'Tbnq2F0xX7D',         // Need correct ID
                'Increased agricultural production': 'GwKxMZ8yaBm', // Need correct ID
                'Started a new livelihood activity': 'Ee8oyMX7Aoc', // Need correct ID
                'Increased my skills/knowledge': 'I2KTNrvwsHT',    // Need correct ID
                'Increased my family\'s resilience to shocks': 'RW2BS4l5KcN', // Need correct ID
                'Others': 'Si8dOtSlomM'                    // Need correct ID
            }

        },
        'Nutrition': {
            'Nutrition during pregnancy and lactation': 'FVIkGrGWz1s',
            'Importance of early initiation of breastfeeding': 'URD2xr6Enhc',
            'Breastfeeding in the first 6 months': 'LzFFXJl5Iqu',
            'Exclusive breastfeeding during the first 6 months': 'ecFLn0i8QrL',
            'Dangers of mixed feeding in the first 6 months': 'tcriRRaX8Vb',
            'Breastfeeding on demand, both day and night': 'HVXgSsvtrY3',
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
        'dangersOfMixedFeeding_checkBox': 'Dangers of mixed feeding in the first 6 months',
        'breastFeedingOnDemand_checkBox': 'Breastfeeding on demand, both day and night',
        'goodHygiene_checkBox': 'Good hygiene practices',
        'complementaryFeeding_checkBox': 'Complementary feeding',
        'healthSeekingBehavior_checkBox': 'Health seeking behavior',
        'growthMonitoring_checkBox': 'Growth monitoring',
        'kitchenGardens_checkBox': 'Kitchen gardens and fruit trees',
        'cookingDemonstration_checkBox': 'Cooking Demonstration',
        'Beneficiary_Category_dropDown': 'Beneficiary Category',
        'Other_Male_no_input': 'Other Male',
        'Other_Female_no_input': 'Other Female',

        // Nutrition assessment - Muac

        'oedema_checkBox': 'Oedema',
        'muac_num': 'Muac',
        'muacClassification_text': 'Muac Classification'

        // Remove commented out mappings
        // 'incomeEarned': 'Income Earned/Week',
        // 'yieldKgs': 'Yield in Kgs',
        // 'caseStories': 'Case Stories Generated',
        // 'landCultivated': 'Land Cultivated in Feddans',
    };

    // list out every “original” column you currently render by header/accessor
    const originalColumnOptions = [
        // { Header: '#', accessor: 'index', visible: true },
        { Header: 'Registration Date', accessor: 'recordDate', visible: true },
        { Header: 'Is Beneficiary Adult / Child', accessor: 'beneficiaryStage', visible: true },
        { Header: 'Beneficiary Type', accessor: 'beneficiaryType', visible: true },
        { Header: 'Patient ID', accessor: 'patientID', visible: true },
        { Header: 'First Name & Middle Name', accessor: 'first_middleName', visible: true },
        { Header: 'Surname', accessor: 'surname', visible: true },
        { Header: 'Sex', accessor: 'sex', visible: true },
        { Header: 'Age', accessor: 'age', visible: true },
        { Header: 'Date of Birth', accessor: 'dob', visible: true },
        { Header: 'Initial Muac', accessor: 'initialMuac', visible: true },
        { Header: 'Muac Classification', accessor: 'muacClassification', visible: true },
        { Header: 'Beneficiary Facility Registration Number', accessor: 'ben_facility_RegNo', visible: true },
        { Header: 'Direct Patient ID', accessor: 'directPatientID', visible: true },
        { Header: 'Beneficiary Track', accessor: 'track', visible: true },
    ];

    const [columnsVis, setColumnsVis] = useState(() => {
        const saved = localStorage.getItem('columnsVis');
        return saved
            ? /** parse and validate if you like **/ JSON.parse(saved)
            : originalColumnOptions;
    });


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

    // muac of addn cols
    const [muacClass, setMuacClass] = useState<string>('');


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

    // track each indirect row’s Present/Absent
    const [indirectPresent, setIndirectPresent] = useState<{ [id: string]: boolean }>({});

    const [showColumns, setShowColumns] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const [selectedTrainings, setSelectedTrainings] = useState<string[]>([]); // e.g. ['Water Sanitation & Hygiene', 'Nutrition']

    // for additional colms returning data
    const renderCheckCell = (val?: boolean) => val === true ? '✓' : '✗';

    // number of original (visible) columns
    const originalCount = columnsVis.filter(c => c.visible).length;
    // number of extra data columns (including the “Action” col)
    const extraCount = additionalColumns.length;
    // total columns to span:
    const totalCols = originalCount + extraCount;

    const [showTopics, setShowTopics] = useState(false);

    const topicsRef = useRef<HTMLDivElement>(null);

    const [selectedRecordOnly, setSelectedRecordOnly] = useState(false);

    // which of the “topics” (additional columns) are visible
    const [topicsVis, setTopicsVis] = useState<Record<string, boolean>>(() =>
        additionalColumns.reduce((acc, col) => {
            acc[col.accessor] = true;  // default: all on
            return acc;
        }, {} as Record<string, boolean>)
    );

    // Modify the filteredData logic to account for selectedRecordOnly
    useEffect(() => {
        let data = props.orgUnitDetails;

        if (selectedRecordOnly && selectedBeneficiary) {
            data = [selectedBeneficiary];
        }

        if (trackFilter) {
            data = data.filter(item => item.track === trackFilter);
        }

        setFilteredData(filterDataByDate(data, dateFilter));
    }, [props.orgUnitDetails, dateFilter, trackFilter, selectedRecordOnly, selectedBeneficiary]);


    // re-initialize additional cols arrays for Topics filter
    useEffect(() => {
        const vis: Record<string, boolean> = {};
        additionalColumns.forEach(col => {
            if (
                col.accessor === 'reportDate' ||    // Always show Date of Training
                col.training === 'Muac Assessment' ||  // Always show Muac Assessment columns
                col.accessor === 'addEditEvent'
            ) {
                vis[col.accessor] = true;
            } else {
                vis[col.accessor] = topicsVis[col.accessor] ?? false;
            }
        });
        setTopicsVis(vis);
    }, [additionalColumns]);


    // show / hide dropdown
    useEffect(() => {
        const onClick = (e: MouseEvent) => {
            if (
                showTopics &&
                dropdownRef.current &&
                !dropdownRef.current.contains(e.target as Node)
            ) {
                setShowTopics(false);
            }
        };
        document.addEventListener('mousedown', onClick);
        return () => document.removeEventListener('mousedown', onClick);
    }, [showTopics]);


    // columns filter useEffect
    // useEffect(() => {
    //     const onClick = (e: MouseEvent) => {
    //         if (
    //             showColumns &&
    //             dropdownRef.current &&
    //             !dropdownRef.current.contains(e.target as Node)
    //         ) {
    //             setShowColumns(false);
    //         }
    //     };
    //     document.addEventListener('mousedown', onClick);
    //     return () => document.removeEventListener('mousedown', onClick);
    // }, [showColumns]);

    // 3 Keep localStorage in sync
    useEffect(() => {
        localStorage.setItem('columnsVis', JSON.stringify(columnsVis));
    }, [columnsVis]);

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

    // Update additional columns when training filter changes
    useEffect(() => {
        setAdditionalColumns(getAdditionalColumns(trainingFilter));
    }, [trainingFilter]);

    // update columns when track filter changes
    // useEffect(() => {
    //     if (trainingFilter === 'Livelihood') {
    //         // Re-run getAdditionalColumns with current training filter to update columns
    //         setAdditionalColumns(getAdditionalColumns(trainingFilter));
    //     }
    // }, [trackFilter, trainingFilter]);
    // Addn and Muac columns too 
    useEffect(() => {
        if (!trainingFilter) {
            setAdditionalColumns([]);
            return;
        }

        let selectedTrainings: string[] = [];

        // Livelihood is exclusive
        if (trainingFilter === 'Livelihood') {
            selectedTrainings = ['Livelihood'];
        } else {
            selectedTrainings = trainingFilter.split(',').map(t => t.trim());
        }

        const mergedCols: any[] = [];

        if (selectedTrainings.length > 0) {
            mergedCols.push(
                {
                    Header: ' Oedema  ',
                    accessor: 'oedema_checkBox',
                    headerClassName: 'additional-header-cell',
                    className: 'oedema_checkBox',
                    training: 'Muac Assessment',
                    minWidth: 100,

                },
                {
                    Header: ' Muac',
                    accessor: 'muac_num',
                    headerClassName: 'additional-header-cell',
                    className: 'muac-value-cell', // New class for styling
                    training: 'Muac Assessment',
                    minWidth: 100,
                    // Add custom Cell renderer
                    Cell: ({ row }: { row: any }) => {
                        const muacValue = fetchedDates[row.original.trackInstanceId]?.dataValues?.['Muac'];
                        return muacValue || '—'; // Display the value or dash if empty
                    }
                }
            );
        }

        // Add "Date of Training" first
        mergedCols.push({
            Header: ' Date of Training',
            accessor: 'reportDate',
            headerClassName: 'additional-header-cell date-column',
            className: 'date-column',
            minWidth: 100,
            training: 'shared'
        });

        // Add all topic columns from selected filters
        // Add all topic columns from selected filters
        selectedTrainings.forEach(filter => {
            const cols = getAdditionalColumns(filter);
            // Filter out MUAC columns since we already added them
            const filteredCols = cols.filter(col =>
                col.accessor !== 'oedema_checkBox' &&
                col.accessor !== 'muac_num'
            );
            mergedCols.push(...filteredCols);
        });

        // Add Action last
        mergedCols.push({
            Header: ' Add / Edit Event',
            accessor: 'addEditEvent',
            headerClassName: 'additional-header-cell actions-header',
            className: 'actions-cell',
            minWidth: 140,
            width: 140,
            training: 'Action'
        });

        setAdditionalColumns(mergedCols);
    }, [trainingFilter, trackFilter]);

    useEffect(() => {
        if (!indirectBeneficiaries.length) return;
        const loadIndirects = async () => {
            const updates: { [key: string]: FetchedData } = {};
            for (const ben of indirectBeneficiaries) {
                // re‑use your existing helper to fetch the event + dataValues for each indirect
                updates[ben.trackInstanceId] =
                    await fetchAdditionalData(ben.trackInstanceId, trainingFilter, trackFilter);
            }
            setFetchedDates(prev => ({ ...prev, ...updates }));
        };
        loadIndirects();
    }, [indirectBeneficiaries, trainingFilter, trackFilter]);

    // ensure hasValidDate is set to true if a valid reportDate exists in fetchedDates even without triggering handleReportDateSubmit
    useEffect(() => {
        if (filteredData) {
            const initialValidDates: Record<string, boolean> = {};
            filteredData.forEach(item => {
                const date = fetchedDates[item.trackInstanceId]?.reportDate;
                if (date) {
                    initialValidDates[item.trackInstanceId] = true;
                }
            });
            setHasValidDate(prev => ({ ...prev, ...initialValidDates }));
        }
    }, [filteredData, fetchedDates]);

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

    // Function to determine additional columns based on the training filter
    const getAdditionalColumns = (filter: string) => {
        const columns = [];

        switch (filter) {
            case 'Livelihood':
                if (trackFilter === 'Fisher') {
                    columns.push(
                        // {
                        //     Header: ' Date of Training', accessor: 'reportDate',
                        //     headerClassName: 'additional-header-cell date-column', // Add class
                        //     className: 'date-column',
                        //     minWidth: 100,
                        //     training: filter
                        // },
                        // { Header: 'Due Date', accessor: 'dueDate' },                                                
                        {
                            Header: ' 1. Fishing Methods', accessor: 'fishingMethods_checkBox',
                            headerClassName: 'additional-header-cell',
                            training: 'Livelihood'
                        },
                        {
                            Header: ' 2. Post Handling and Hygiene', accessor: 'postHandlingMethods_checkBox',
                            headerClassName: 'additional-header-cell',
                            training: 'Livelihood'
                        }, // Added
                        {
                            Header: ' 3. Fishing Marketing and Record Keeping', accessor: 'fishingMarketing_checkBox',
                            headerClassName: 'additional-header-cell',
                            training: 'Livelihood'
                        },
                        {
                            Header: ' 4. Fishing Oil Preparation', accessor: 'fishingOilPreparation_checkBox',
                            headerClassName: 'additional-header-cell',
                            training: 'Livelihood'
                        },
                        {
                            Header: ' 5. Did you apply the lessons from fishery training in your life',
                            accessor: 'appliedLessons_dropdown',
                            headerClassName: 'additional-header-cell dropdown-column',
                            className: 'dropdown-column',
                            minWidth: 100,
                            training: 'Livelihood'
                        }
                        // { Header: 'Estimated Fish Catch', accessor: 'estimatedFishCatch' },
                        // { Header: 'Income Earned/Week', accessor: 'incomeEarned' },
                        // { Header: 'Case Stories Generated', accessor: 'caseStories' }
                    );
                } else if (trackFilter === 'Farmer') {
                    columns.push(
                        // {
                        //     Header: ' Date of Training', accessor: 'reportDate',
                        //     headerClassName: 'additional-header-cell date-column', // Add class
                        //     className: 'date-column',
                        //     minWidth: 100,
                        //     training: filter
                        // },
                        // { Header: 'Due Date', accessor: 'dueDate' },


                        {
                            Header: ' 1. Land Preparation and Sowing', accessor: 'landPreparation_checkBox',
                            headerClassName: 'additional-header-cell',
                            training: 'Livelihood'
                        },
                        {
                            Header: ' 2. Nursery bed Preparation and Transplanting', accessor: 'nurseryPreparation_checkBox',
                            headerClassName: 'additional-header-cell',
                            training: 'Livelihood'
                        },
                        {
                            Header: ' 3. Weeding and Pest Control', accessor: 'weeding_checkBox',
                            headerClassName: 'additional-header-cell',
                            training: 'Livelihood'
                        },
                        {
                            Header: ' 4. Harvesting', accessor: 'harvesting_checkBox',
                            headerClassName: 'additional-header-cell',
                            training: 'Livelihood'
                        },
                        {
                            Header: ' 5. Post Harvest Handling', accessor: 'postHarvestHandling_checkBox',
                            headerClassName: 'additional-header-cell',
                            training: 'Livelihood'
                        },
                        {
                            Header: ' 6. Storage', accessor: 'storage_checkBox',
                            headerClassName: 'additional-header-cell',
                            training: 'Livelihood'
                        },
                        {
                            Header: ' 7. Post Harvest Handling and Hygiene', accessor: 'postHarvestHygiene_checkBox',
                            headerClassName: 'additional-header-cell',
                            training: 'Livelihood'
                        },
                        {
                            Header: ' 8. Losses Marking and Record Keeping', accessor: 'lossesMarking_checkBox',
                            headerClassName: 'additional-header-cell',
                            training: 'Livelihood'
                        },

                        {
                            Header: ' 9. Did you apply the lessons from the farming trainings in your life', accessor: 'appliedLessons_dropdown',
                            headerClassName: 'additional-header-cell',
                            training: 'Livelihood'
                        },
                        {
                            Header: ' 10. Increased income', accessor: 'increasedIncome_checkBox',
                            headerClassName: 'additional-header-cell',
                            training: 'Livelihood'
                        },
                        {
                            Header: ' 11. Increased agricultural production', accessor: 'increasedProduction_checkBox',
                            headerClassName: 'additional-header-cell',
                            training: 'Livelihood'
                        },
                        {
                            Header: ' 12. Started a new livelihood activity', accessor: 'newLivelihood_checkBox',
                            headerClassName: 'additional-header-cell',
                            training: 'Livelihood'
                        },
                        {
                            Header: ' 13. Increased my skills/knowledge', accessor: 'increasedSkills_checkBox',
                            headerClassName: 'additional-header-cell',
                            training: 'Livelihood'
                        },
                        {
                            Header: ' 14. Increased my family\'s resilience to shocks', accessor: 'increasedResilience_checkBox',
                            headerClassName: 'additional-header-cell',
                            training: 'Livelihood'
                        },
                        {
                            Header: ' 15. Others (specify)', accessor: 'others_text',
                            headerClassName: 'additional-header-cell text-column', // Add class
                            className: 'text-column',
                            minWidth: 100,
                            training: 'Livelihood'
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
                    // {
                    //     Header: ' Date of Training', accessor: 'reportDate',
                    //     headerClassName: 'additional-header-cell date-column', // Add class
                    //     className: 'date-column',
                    //     minWidth: 100,
                    //     training: filter
                    // },
                    // { Header: 'Due Date', accessor: 'dueDate' },
                    {
                        Header: ' 1. Food Safety', accessor: 'foodSafety_checkBox',
                        headerClassName: 'additional-header-cell',
                        training: 'Water Sanitation & Hygiene'
                    },
                    {
                        Header: ' 2. CLTS (Community Lead Total Sanitation)', accessor: 'promotersAttendance_checkBox',
                        headerClassName: 'additional-header-cell',
                        training: 'Water Sanitation & Hygiene'
                    },
                    {
                        Header: ' 3. Personal Hygiene', accessor: 'personalHygiene_checkBox',
                        headerClassName: 'additional-header-cell',
                        training: 'Water Sanitation & Hygiene'
                    },
                    {
                        Header: ' 4. Household Hygene', accessor: 'householdHygiene_checkBox',
                        headerClassName: 'additional-header-cell',
                        training: 'Water Sanitation & Hygiene'
                    },
                    {
                        Header: ' 5. Clean and Safe Water', accessor: 'cleanSafeWater_checkBox',
                        headerClassName: 'additional-header-cell',
                        training: 'Water Sanitation & Hygiene'
                    },
                    {
                        Header: ' 6. Use of Latrine and Excreta Disposal', accessor: 'latrineDisposal_checkBox',
                        headerClassName: 'additional-header-cell',
                        training: 'Water Sanitation & Hygiene'
                    },
                );
                break;
            case 'Nutrition':
                columns.push(
                    // {
                    //     Header: ' Date of Training', accessor: 'reportDate',
                    //     headerClassName: 'additional-header-cell date-column', // Add class
                    //     className: 'date-column',
                    //     minWidth: 100,
                    //     training: filter
                    // },
                    // { Header: 'Due Date', accessor: 'dueDate' },
                    {
                        Header: ' 1. Nutrition during pregnancy and lactation', accessor: 'nutritionPregnancy_checkBox',
                        headerClassName: 'additional-header-cell',
                        training: 'Nutrition'
                    },
                    {
                        Header: ' 2. Importance of early initiation of breastfeeding', accessor: 'earlyInitiation_checkBox',
                        headerClassName: 'additional-header-cell',
                        training: 'Nutrition'
                    },
                    {
                        Header: ' 3. Breastfeeding in the first 6 months', accessor: 'breastfeedingFirst6Months_checkBox',
                        headerClassName: 'additional-header-cell',
                        training: 'Nutrition'
                    },
                    {
                        Header: ' 4. Exclusive breastfeeding during the first 6 months', accessor: 'exclusiveBreastfeeding_checkBox',
                        headerClassName: 'additional-header-cell',
                        training: 'Nutrition'
                    },
                    {
                        Header: ' 5. Dangers of mixed feeding in the first 6 monthsExclusive breastfeeding during the first 6 months', accessor: 'dangersOfMixedFeeding_checkBox',
                        headerClassName: 'additional-header-cell',
                        training: 'Nutrition'
                    },
                    {
                        Header: ' 6. Breastfeeding on demand, both day and night', accessor: 'breastFeedingOnDemand_checkBox',
                        headerClassName: 'additional-header-cell',
                        training: 'Nutrition'
                    },
                    {
                        Header: ' 7. Complementary feeding', accessor: 'complementaryFeeding_checkBox',
                        headerClassName: 'additional-header-cell',
                        training: 'Nutrition'
                    },
                    {
                        Header: ' 8. Good hygiene practices', accessor: 'goodHygiene_checkBox',
                        headerClassName: 'additional-header-cell',
                        training: 'Nutrition'
                    },
                    {
                        Header: ' 9. Growth monitoring', accessor: 'growthMonitoring_checkBox',
                        headerClassName: 'additional-header-cell',
                        training: 'Nutrition'
                    },
                    {
                        Header: ' 10. Health seeking behavior', accessor: 'healthSeekingBehavior_checkBox',
                        headerClassName: 'additional-header-cell',
                        training: 'Nutrition'
                    },

                    {
                        Header: ' 11. Kitchen gardening and fruit trees', accessor: 'kitchenGardens_checkBox',
                        headerClassName: 'additional-header-cell',
                        training: 'Nutrition'
                    },
                    {
                        Header: ' 12. Cooking Demonstration', accessor: 'cookingDemonstration_checkBox',
                        headerClassName: 'additional-header-cell',
                        training: 'Nutrition'
                    },
                    {
                        Header: ' 13. Beneficiary Category', accessor: 'Beneficiary_Category_dropDown',
                        headerClassName: 'additional-header-cell dropdown-column',
                        className: 'dropdown-column',
                        minWidth: 100,
                        training: 'Nutrition'
                    },
                    {
                        Header: ' 14. Other Male', accessor: 'Other_Male_no_input',
                        headerClassName: 'additional-header-cell text-column', // Add class
                        className: 'text-column',
                        minWidth: 100,
                        training: 'Nutrition'
                    },
                    {
                        Header: ' 15. Other Female', accessor: 'Other_Female_no_input',
                        headerClassName: 'additional-header-cell text-column', // Add class
                        className: 'text-column',
                        minWidth: 100,
                        training: 'Nutrition'
                    },
                );
                break;
            default:
                break;
        }
        return columns;
    };

    const table = useTable({
        data: props.orgUnitDetails,
        columns: columns, // Use the dynamically set columns
        globalFilter: search,
        setGlobalFilter: setSearch,
    });

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
            setMessage('Beneficiary successfully saved!');
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
        } else {
            setHasValidDate(prev => ({ ...prev, [trackInstanceId]: true }));
            setMessage('');
            setIsError(false);
        }

        //  Step 1: Parse trainingFilter string
        const selectedTrainings = trainingFilter
            .split(',')
            .map(t => t.trim())
            .filter(Boolean); // eliminate blank entries

        console.debug('[DEBUG] trainingFilter:', trainingFilter);
        console.debug('[DEBUG] selectedTrainings:', selectedTrainings);

        // const eventsMap: Record<string, string> = {};

        try {

            // Creating Muac Event

            try {
                const muacPayload = {
                    events: [{
                        trackedEntityInstance: trackInstanceId,
                        program: 'n2iAPy3PGx7',
                        programStage: PROGRAM_STAGE_MAPPING['Muac Assessment'],
                        orgUnit: props.orgUnitId,
                        eventDate: reportDate,
                        status: 'ACTIVE',
                        dataValues: []
                    }]
                };

                const muacRes = await axios.post(
                    `${process.env.REACT_APP_DHIS2_BASE_URL}/api/events`,
                    muacPayload
                );

                const muacEventId = muacRes.data.response.importSummaries[0].reference;

                // Store MUAC event ID
                setFetchedDates(prev => ({
                    ...prev,
                    [trackInstanceId]: {
                        ...prev[trackInstanceId],
                        muacEventId
                    }
                }));
            } catch (error) {
                console.error('Error creating MUAC event:', error);
            }


            // Creating Events for Training Filters

            const createdEvents = await Promise.all(
                selectedTrainings.map(async training => {
                    const stage = PROGRAM_STAGE_MAPPING[training];

                    if (!stage) {
                        console.warn(`No programStage mapped for training: "${training}"`);
                        return null;
                    }

                    const payload = {
                        events: [{
                            trackedEntityInstance: trackInstanceId,
                            program: 'n2iAPy3PGx7',
                            programStage: stage,
                            orgUnit: props.orgUnitId,
                            eventDate: reportDate,
                            status: 'ACTIVE',
                            dataValues: []
                        }]
                    };

                    const res = await axios.post(
                        `${process.env.REACT_APP_DHIS2_BASE_URL}/api/events`,
                        payload
                    );

                    return {
                        training,
                        eventId: res.data.response.importSummaries[0].reference
                    };
                })
            );

            // Step 2: Build event mapping
            const eventsMap = createdEvents
                .filter((entry): entry is { training: string, eventId: string } => !!entry)
                .reduce((acc, curr) => {
                    acc[curr.training] = curr.eventId;
                    return acc;
                }, {} as Record<string, string>);

            console.debug('[DEBUG] eventsMap:', eventsMap);

            // Step 3: Save both date and new event map
            setFetchedDates(prev => ({
                ...prev,
                [trackInstanceId]: {
                    ...prev[trackInstanceId],
                    reportDate,
                    events: eventsMap
                }
            }));

            setHasValidDate(prev => ({ ...prev, [trackInstanceId]: true }));
            setMessage('Date of Training Successfully Saved');
        } catch (error) {
            console.error('Error creating training events:', error);
            setHasValidDate(prev => ({ ...prev, [trackInstanceId]: false }));
            setMessage('Failed to save training date');
            setIsError(true);
        }
    };

    // PUT remaining data elements 
    const sendDataValueUpdate = async (
        trackInstanceId: string,
        dataElementName: string,
        value: string | boolean,
        training: string
    ) => {

        // Determine program stage based on data element
        const isMuacColumn = ['Oedema', 'Muac', 'Muac Classification'].includes(dataElementName);
        const programStage = isMuacColumn
            ? PROGRAM_STAGE_MAPPING['Muac Assessment']
            : PROGRAM_STAGE_MAPPING[training];

        const orgUnit = props.orgUnitId;
        const program = 'n2iAPy3PGx7';
        // const programStage = PROGRAM_STAGE_MAPPING[training];

        if (!programStage || !dataElementName) return;

        const reportDate = fetchedDates[trackInstanceId]?.reportDate;
        // Check if we already have an event ID for this program stage
        let eventId = fetchedDates[trackInstanceId]?.events?.[training];

        // Use MUAC event ID if available
        if (isMuacColumn && fetchedDates[trackInstanceId]?.muacEventId) {
            eventId = fetchedDates[trackInstanceId].muacEventId;
        }

        // If eventId is missing, try to fetch exisitng event from API
        if (!eventId && reportDate) {
            try {
                const res = await axios.get(`${process.env.REACT_APP_DHIS2_BASE_URL}/api/events`, {
                    params: {
                        trackedEntityInstance: trackInstanceId,
                        program,
                        fields: 'event,eventDate,programStage',
                    }
                });

                // Find event matching the report date
                const matchedEvent = res.data.events.find(
                    (ev: any) =>
                        ev.eventDate?.startsWith(reportDate) && ev.programStage === programStage
                );

                // if (matchedEvent) {
                //     eventId = matchedEvent.event;
                //     // Store it for future
                //     // setFetchedDates(prev => ({
                //     //     ...prev,
                //     //     [trackInstanceId]: {
                //     //         ...prev[trackInstanceId],
                //     //         events: {
                //     //             ...(prev[trackInstanceId]?.events || {}),
                //     //             [training]: eventId
                //     //         }
                //     //     }
                //     // }));
                // } else {
                //     console.warn(`No matching event found for TEI ${trackInstanceId}, training: ${training}`);
                //     return;
                // }

                if (matchedEvent) {
                    eventId = matchedEvent.event;
                    // Store it for future use
                    if (isMuacColumn) {
                        setFetchedDates(prev => ({
                            ...prev,
                            [trackInstanceId]: {
                                ...prev[trackInstanceId],
                                muacEventId: eventId
                            }
                        }));
                    } else {
                        setFetchedDates(prev => ({
                            ...prev,
                            [trackInstanceId]: {
                                ...prev[trackInstanceId],
                                events: {
                                    ...(prev[trackInstanceId]?.events || {}),
                                    [training]: eventId
                                }
                            }
                        }));
                    }
                }
            } catch (err) {
                console.error('Failed to fetch existing events:', err);
                return;
            }
        }

        // If still no event ID, we need to create one
        // if (!eventId) return;
        if (!eventId) {
            try {
                const payload = {
                    events: [{
                        trackedEntityInstance: trackInstanceId,
                        program: 'n2iAPy3PGx7',
                        programStage,
                        orgUnit: props.orgUnitId,
                        eventDate: reportDate,
                        status: 'ACTIVE',
                        dataValues: []
                    }]
                };

                const res = await axios.post(
                    `${process.env.REACT_APP_DHIS2_BASE_URL}/api/events`,
                    payload
                );

                eventId = res.data.response.importSummaries[0].reference;

                // Store the new event ID
                if (isMuacColumn) {
                    setFetchedDates(prev => ({
                        ...prev,
                        [trackInstanceId]: {
                            ...prev[trackInstanceId],
                            muacEventId: eventId
                        }
                    }));
                } else {
                    setFetchedDates(prev => ({
                        ...prev,
                        [trackInstanceId]: {
                            ...prev[trackInstanceId],
                            events: {
                                ...(prev[trackInstanceId]?.events || {}),
                                [training]: eventId
                            }
                        }
                    }));
                }
            } catch (error) {
                console.error('Error creating event:', error);
                return;
            }
        }

        // Now send the data value update
        const dataElementId =
            dataElementIDsByFilter[training]?.[trackFilter]?.[dataElementName] ||
            dataElementIDsByFilter[training]?.[dataElementName];

        if (!dataElementId) {
            console.warn(`Missing dataElementId for ${dataElementName} under training: ${training}`);
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
            console.log(`PUT: ${dataElementName} = ${value}`);
            setMessage(`Data Element - ${dataElementId} successfully updated.`);
        } catch (error) {
            console.error('Failed to send data value update:', error);
            setMessage(`Data Element - ${dataElementId} update failed.`);
        }
    };

    //  handling present / absent indirect beneficiaries
    const handleIndirectPresentChange = async (
        indirectId: string,
        isPresent: boolean
    ) => {
        // Optimistically update the checkbox
        setIndirectPresent(prev => ({
            ...prev,
            [indirectId]: isPresent,
        }));

        // Grab parent's training event info
        const parentId = selectedBeneficiary?.trackInstanceId!;
        const parentData = fetchedDates[parentId];
        if (!parentData) return;

        if (isPresent) {
            try {
                // Create MUAC event first
                const muacPayload = {
                    events: [{
                        trackedEntityInstance: indirectId,
                        program: 'n2iAPy3PGx7',
                        programStage: PROGRAM_STAGE_MAPPING['Muac Assessment'],
                        orgUnit: props.orgUnitId,
                        notes: [],
                        dataValues: [],
                        status: 'ACTIVE',
                        eventDate: parentData.reportDate,
                    }]
                };

                const muacRes = await axios.post(
                    `${process.env.REACT_APP_DHIS2_BASE_URL}/api/events`,
                    muacPayload
                );
                const muacEventId = muacRes.data.response.importSummaries[0].reference;

                // Then create training event if needed
                const payload = {
                    events: [{
                        trackedEntityInstance: indirectId,
                        program: 'n2iAPy3PGx7',
                        programStage: PROGRAM_STAGE_MAPPING[trainingFilter],
                        orgUnit: props.orgUnitId,
                        notes: [],
                        dataValues: [],
                        status: 'ACTIVE',
                        eventDate: parentData.reportDate,
                    }]
                };
                const resp = await axios.post(
                    `${process.env.REACT_APP_DHIS2_BASE_URL}/api/events`,
                    payload
                );
                const newEventId = resp.data.response.importSummaries[0].reference;

                // Update fetchedDates with both events
                setFetchedDates(prev => ({
                    ...prev,
                    [indirectId]: {
                        ...parentData,
                        eventId: newEventId,
                        muacEventId: muacEventId,
                        dataValues: {
                            ...parentData.dataValues,
                            // Clear non-MUAC values since they should come from parent
                            ...Object.fromEntries(
                                Object.entries(parentData.dataValues)
                                    .filter(([key]) =>
                                        key === 'Oedema' ||
                                        key === 'Muac' ||
                                        key === 'Muac Classification'
                                    )
                            )
                        }
                    }
                }));

                setHasValidDate(prev => ({
                    ...prev,
                    [indirectId]: true
                }));

            } catch (err) {
                console.error('Error creating indirect events:', err);
                setIndirectPresent(prev => ({ ...prev, [indirectId]: false }));
            }
        } else {
            // Delete both events if they exist
            const existingEventId = fetchedDates[indirectId]?.eventId;
            const existingMuacEventId = fetchedDates[indirectId]?.muacEventId;

            try {
                if (existingEventId) {
                    await axios.delete(
                        `${process.env.REACT_APP_DHIS2_BASE_URL}/api/events/${existingEventId}`
                    );
                }
                if (existingMuacEventId) {
                    await axios.delete(
                        `${process.env.REACT_APP_DHIS2_BASE_URL}/api/events/${existingMuacEventId}`
                    );
                }
            } catch (e) {
                console.warn('Failed to delete indirect events:', e);
            }

            // Clear out the indirect's fetchedDates
            setFetchedDates(prev => ({
                ...prev,
                [indirectId]: { reportDate: '', dueDate: '', eventId: '', muacEventId: '', dataValues: {} }
            }));
            setHasValidDate(prev => ({ ...prev, [indirectId]: false }));
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

        const colMeta = additionalColumns.find(col => dataValueMapping[col.accessor] === dataElementName);
        const training = colMeta?.training || selectedTrainings[0];

        // Send immediately for checkboxes
        if (typeof value === 'boolean') {
            sendDataValueUpdate(trackInstanceId, dataElementName, value, colMeta.training);
        }

        // In handleDataValueChange
        console.log('Dispatching update with:', {
            dataElementName,
            training: colMeta?.training,
            hasEventId: !!fetchedDates[trackInstanceId]?.events?.[colMeta.training]
        });

        console.log('Events created:', fetchedDates[trackInstanceId]?.events)
    };

    // In your component's data fetching logic:
    const loadAllAdditionalData = async () => {
        const newFetchedDates: Record<string, FetchedData> = {};

        // Process in batches to avoid overwhelming the API
        const batchSize = 10;
        for (let i = 0; i < filteredData.length; i += batchSize) {
            const batch = filteredData.slice(i, i + batchSize);

            await Promise.all(batch.map(async (activity) => {
                try {
                    const additionalData = await fetchAdditionalData(
                        activity.trackInstanceId,
                        trainingFilter,
                        trackFilter
                    );

                    newFetchedDates[activity.trackInstanceId] = additionalData;

                    // Also check if we have MUAC classification to update the row color
                    if (additionalData.dataValues['Muac Classification']) {
                        const muacClass = additionalData.dataValues['Muac Classification'];
                        // You might want to update the row style based on this
                    }
                } catch (error) {
                    console.error(`Failed to fetch data for ${activity.trackInstanceId}:`, error);
                    newFetchedDates[activity.trackInstanceId] = {
                        reportDate: '',
                        dueDate: '',
                        eventId: '',
                        muacEventId: '',
                        dataValues: {}
                    };
                }
            }));
        }

        setFetchedDates(newFetchedDates);
    };
    // Call this whenever filteredData or trainingFilter changes
    useEffect(() => {
        if (filteredData.length > 0 && trainingFilter) {
            loadAllAdditionalData();
        }
    }, [filteredData, trainingFilter, trackFilter]);


    const fetchAdditionalData = async (trackInstanceId: string, trainingFilter: string, trackFilter: string): Promise<FetchedData> => {
        const programStageMap = {
            'Livelihood': 'H0vCgsI1d4M',
            'Nutrition': 'RXTq2YFOH5c',
            'Water Sanitation & Hygiene': 'bTVReRuHapT',
            'Muac Assessment': 'HEukVrLC2dT'
        };

        const stagesToFetch = [];

        // Always fetch MUAC stage
        stagesToFetch.push('Muac Assessment');

        // Fetch the training stage if specified
        if (trainingFilter && programStageMap[trainingFilter]) {
            stagesToFetch.push(trainingFilter);
        }

        let reportDate = '';
        let dueDate = '';
        let eventId = '';
        const dataValues: { [key: string]: string } = {};
        let muacEventId = '';

        try {
            // Fetch all relevant events at once
            const response = await axios.get(
                `${process.env.REACT_APP_DHIS2_BASE_URL}/api/trackedEntityInstances/${trackInstanceId}.json`,
                {
                    params: {
                        program: 'n2iAPy3PGx7',
                        fields: 'enrollments[events[event,eventDate,dueDate,programStage,dataValues[dataElement,value]]'
                    }
                }
            );

            const events = response.data.enrollments?.[0]?.events || [];

            // Process each event
            events.forEach((event: any) => {
                // Check if this is the training event
                if (event.programStage === programStageMap[trainingFilter]) {
                    reportDate = event.eventDate;
                    dueDate = event.dueDate;
                    eventId = event.event;

                    // Process training data values
                    event.dataValues?.forEach((dv: any) => {
                        Object.entries(dataValueMapping).forEach(([accessorKey, label]) => {
                            const expectedId = dataElementMapping[trainingFilter]?.[trackFilter]?.[label] ||
                                dataElementMapping[trainingFilter]?.[label];
                            if (expectedId === dv.dataElement) {
                                dataValues[label] = dv.value;
                            }
                        });
                    });
                }

                // Check if this is the MUAC event
                if (event.programStage === programStageMap['Muac Assessment']) {
                    muacEventId = event.event;

                    // Process MUAC data values
                    event.dataValues?.forEach((dv: any) => {
                        Object.entries(muacDataElementMapping).forEach(([label, deId]) => {
                            if (deId === dv.dataElement) {
                                dataValues[label] = dv.value;
                            }
                        });
                    });
                }
            });

            // For indirect beneficiaries, inherit non-MUAC data from direct beneficiary
            const isIndirect = props.orgUnitDetails.some(b =>
                b.trackInstanceId === trackInstanceId &&
                b.directPatientID &&
                b.directPatientID !== ''
            );

            if (isIndirect) {
                const directBeneficiary = props.orgUnitDetails.find(b =>
                    b.patientID === props.orgUnitDetails.find(b => b.trackInstanceId === trackInstanceId)?.directPatientID
                );

                if (directBeneficiary) {
                    const directData = fetchedDates[directBeneficiary.trackInstanceId];
                    if (directData) {
                        // Only inherit non-MUAC data
                        Object.entries(directData.dataValues || {}).forEach(([key, value]) => {
                            if (!['Oedema', 'Muac', 'Muac Classification'].includes(key)) {
                                dataValues[key] = String(value);
                            }
                        });
                    }
                }
            }


            return {
                reportDate,
                dueDate,
                eventId,
                muacEventId,
                dataValues,
            };
        } catch (error) {
            console.error('Error fetching additional data:', error);
            return { reportDate: '', dueDate: '', eventId: '', muacEventId: '', dataValues: {} };
        }


    };

    const handleFilterChange = async (training) => {
        let newSelected;


        if (training === 'Livelihood') {
            newSelected = ['Livelihood'];
        } else {
            // If Livelihood is already selected, start fresh
            if (selectedTrainings.includes('Livelihood')) {
                newSelected = [training];
            } else {
                // Toggle selection for Water Sanitation & Hygiene or Nutrition
                newSelected = selectedTrainings.includes(training)
                    ? selectedTrainings.filter(t => t !== training)
                    : [...selectedTrainings, training];
            }
        }
        setSelectedTrainings(newSelected);

        setTrainingFilter(newSelected.join(','));

        // Set program stage for compatibility (optional, can be removed if not needed)
        setSelectedProgramStage(newSelected.length === 1 ? newSelected[0] : '');

        // Update columns for all selected trainings
        let allCols = [];
        newSelected.forEach(filter => {
            allCols = [...allCols, ...getAdditionalColumns(filter)];
        });

        // Add unified date column
        if (newSelected.length > 0) {
            allCols.unshift({
                Header: 'Date of Training',
                accessor: 'reportDate',
                headerClassName: 'additional-header-cell date-column',
                className: 'date-column',
                minWidth: 100,
                training: 'Date'
            });
        }

        // Add Action column only once if any trainings are selected
        if (newSelected.length > 0) {
            allCols.push({
                Header: "Add / Edit Event",
                accessor: 'addEditEvent',
                headerClassName: 'additional-header-cell actions-header',
                className: 'actions-cell',
                minWidth: 140,
                width: 140,
                training: 'Action'
            });
        }

        setAdditionalColumns(allCols);

        // Fetch additional data for all rows for each selected training
        const allFetchedDates = {};
        for (const filter of newSelected) {
            const updatedFetchedDates = await Promise.all(
                filteredData.map(async (activity) => {
                    const additionalData = await fetchAdditionalData(activity.trackInstanceId, filter, trackFilter);
                    return {
                        trackInstanceId: activity.trackInstanceId,
                        reportDate: additionalData.reportDate,
                        dueDate: additionalData.dueDate,
                        eventId: additionalData.eventId,
                        dataValues: additionalData.dataValues || {}
                    };
                })
            );
            updatedFetchedDates.forEach(({ trackInstanceId, reportDate, dueDate, eventId, dataValues }) => {
                // Merge data for each trackInstanceId
                allFetchedDates[trackInstanceId] = {
                    ...(allFetchedDates[trackInstanceId] || {}),
                    reportDate,
                    dueDate,
                    eventId,
                    dataValues: {
                        ...(allFetchedDates[trackInstanceId]?.dataValues || {}),
                        ...dataValues
                    }
                };
            });
        }
        setFetchedDates(allFetchedDates);
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

    const handleMuacChange = (trackInstanceId: string, muacValue: string, classification: string) => {
        setFetchedDates(prev => ({
            ...prev,
            [trackInstanceId]: {
                ...prev[trackInstanceId],
                dataValues: {
                    ...prev[trackInstanceId]?.dataValues,
                    [dataValueMapping['muac_num']]: muacValue,
                    [dataValueMapping['muacClassification']]: classification,
                }
            }
        }));

        // Immediately save to backend if we have a valid date
        if (hasValidDate[trackInstanceId]) {
            sendDataValueUpdate(
                trackInstanceId,
                dataValueMapping['muac_num'],
                muacValue,
                'Muac Assessment'
            );
            sendDataValueUpdate(
                trackInstanceId,
                dataValueMapping['muacClassification'],
                classification,
                'Muac Assessment'
            );
        }
    };

    const renderTableRows = () => {
        // No data case
        if (!filteredData || filteredData.length === 0) {
            return (
                <tr>
                    <td colSpan={columnsVis.filter(c => c.visible).length + additionalColumns.length + 1}>
                        No data available for the selected Entry, Please add new Beneficially
                    </td>
                </tr>
            );
        }

        return filteredData.map((activity, index) => {
            const fetchedData: FetchedData =
                fetchedDates[activity.trackInstanceId] || {
                    reportDate: '',
                    dueDate: '',
                    eventId: '',
                    dataValues: {}
                };

            return (
                <tr
                    key={activity.trackInstanceId || index}
                    onClick={e => {
                        e.stopPropagation();
                        handleRecordClick(activity);
                        setBeneficiarySearch(activity.patientID)
                    }}
                    className={selectedBeneficiary?.trackInstanceId === activity.trackInstanceId ? 'highlight-row' : ''}
                >
                    {/* 1 Original columns */}
                    {columnsVis
                        .filter(c => c.visible)
                        .map(c => (
                            <td key={c.accessor}>{(activity as any)[c.accessor]}</td>
                        ))}

                    {/* 2 Additional columns */}
                    {additionalColumns.filter(col => topicsVis[col.accessor]).map(col => {
                        const isAction = col.accessor === 'addEditEvent';
                        const isCheckbox = col.accessor.includes('checkBox');
                        // Determine class: actions-cell, or your custom className, or numeric-cell
                        const cellClass = isAction
                            ? 'actions-cell'
                            : col.className
                                ? col.className
                                : isCheckbox
                                    ? 'numeric-cell'
                                    : '';

                        // Apply minWidth inline if provided
                        const style: React.CSSProperties = col.minWidth
                            ? { minWidth: col.minWidth }
                            : {};

                        // Editing mode?
                        const inEdit = editableRows[activity.trackInstanceId] && !isAction;

                        return (
                            <td key={col.accessor} className={cellClass} style={style}>
                                {isAction ? (
                                    <div className="button-container">
                                        {editableRows[activity.trackInstanceId] ? (
                                            <>
                                                <button
                                                    className="save-button btn"
                                                    style={{ backgroundColor: 'green' }}
                                                    onClick={e => {
                                                        e.stopPropagation();
                                                        handleSave(
                                                            activity.trackInstanceId,
                                                            fetchedDates[activity.trackInstanceId]?.eventId
                                                        );
                                                    }}
                                                >
                                                    Save
                                                </button>
                                                <button
                                                    className="cancel-button btn"
                                                    style={{ backgroundColor: 'red' }}
                                                    onClick={e => {
                                                        e.stopPropagation();
                                                        handleCancel(activity.trackInstanceId);
                                                    }}
                                                >
                                                    Cancel
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button
                                                    className="add-button btn"
                                                    style={{ backgroundColor: 'grey' }}
                                                    onClick={e => {
                                                        e.stopPropagation();
                                                        handleAdd(activity.trackInstanceId);
                                                    }}
                                                >
                                                    Add
                                                </button>
                                                <button
                                                    className="edit-button btn"
                                                    style={{ backgroundColor: 'orange' }}
                                                    onClick={e => {
                                                        e.stopPropagation();
                                                        handleEdit(activity.trackInstanceId);
                                                    }}
                                                >
                                                    Edit
                                                </button>
                                            </>
                                        )}
                                    </div>
                                ) : inEdit ? (
                                    // In‑row inputs when editing (excluding addEditEvent)
                                    col.accessor === 'reportDate' ? (
                                        <input
                                            type="date"
                                            value={fetchedData.reportDate.split('T')[0] || ''}
                                            onChange={e =>
                                                handleDateChangeForFetchedDates(
                                                    activity.trackInstanceId,
                                                    e.target.value
                                                )
                                            }
                                            onKeyDown={e =>
                                                handleReportDateSubmit(e, activity.trackInstanceId)
                                            }
                                            onBlur={e =>
                                                handleReportDateSubmit(e, activity.trackInstanceId)
                                            }
                                        />
                                    ) : isCheckbox ? (
                                        <input
                                            type="checkbox"
                                            disabled={!hasValidDate[activity.trackInstanceId]}
                                            className="form-check-input"
                                            checked={
                                                fetchedData.dataValues[dataValueMapping[col.accessor]] ===
                                                true ||
                                                fetchedData.dataValues[dataValueMapping[col.accessor]] ===
                                                'true'
                                            }
                                            onChange={e =>
                                                handleDataValueChange(
                                                    activity.trackInstanceId,
                                                    dataValueMapping[col.accessor],
                                                    e.target.checked
                                                )
                                            }
                                        />
                                    ) : (
                                        // all other non-checkbox editors: selects / text inputs
                                        (() => {
                                            // dropdown for appliedLessons
                                            if (col.accessor === 'appliedLessons_dropdown') {
                                                return (
                                                    <select
                                                        className="form-select"
                                                        value={String(
                                                            fetchedData.dataValues[
                                                            dataValueMapping[col.accessor]
                                                            ] || ''
                                                        )}
                                                        onChange={e =>
                                                            handleDataValueChange(
                                                                activity.trackInstanceId,
                                                                dataValueMapping[col.accessor],
                                                                e.target.value
                                                            )
                                                        }
                                                        onKeyDown={e => {
                                                            if (e.key === 'Enter') {
                                                                const training = col.training || selectedTrainings[0];
                                                                sendDataValueUpdate(
                                                                    activity.trackInstanceId,
                                                                    dataValueMapping[col.accessor],
                                                                    e.currentTarget.value === 'Yes',
                                                                    training
                                                                );
                                                            }
                                                        }}
                                                    >
                                                        <option value="">Select</option>
                                                        <option value="Yes">Yes</option>
                                                        <option value="No">No</option>
                                                    </select>
                                                );
                                            }
                                            // dropdown for beneficiary category
                                            if (col.accessor === 'Beneficiary_Category_dropDown') {
                                                return (
                                                    <select
                                                        className="form-select"
                                                        value={String(
                                                            fetchedData.dataValues[
                                                            dataValueMapping[col.accessor]
                                                            ] || ''
                                                        )}
                                                        onChange={e =>
                                                            handleDataValueChange(
                                                                activity.trackInstanceId,
                                                                dataValueMapping[col.accessor],
                                                                e.target.value
                                                            )
                                                        }
                                                        onKeyDown={e => {
                                                            if (e.key === 'Enter') {
                                                                const training = col.training || selectedTrainings[0];
                                                                sendDataValueUpdate(
                                                                    activity.trackInstanceId,
                                                                    dataValueMapping[col.accessor],
                                                                    e.currentTarget.value === 'Yes',
                                                                    training
                                                                );
                                                            }
                                                        }}
                                                    >
                                                        <option value="">Select</option>
                                                        <option value="Pregnant">Pregnant</option>
                                                        <option value="Lactating">Lactating</option>
                                                        <option value="Care Giver">Care Giver</option>
                                                    </select>
                                                );
                                            }
                                            // numeric text inputs (e.g. others_text)
                                            if (col.accessor.includes('no_input')) {
                                                return (
                                                    <input
                                                        type="number"
                                                        value={Number(
                                                            fetchedData.dataValues[
                                                            dataValueMapping[col.accessor]
                                                            ] || ''
                                                        )}
                                                        onKeyDown={e => {
                                                            if (e.key === 'Enter') {
                                                                const training = col.training || selectedTrainings[0];
                                                                sendDataValueUpdate(
                                                                    activity.trackInstanceId,
                                                                    dataValueMapping[col.accessor],
                                                                    e.currentTarget.value === 'Yes',
                                                                    training
                                                                );
                                                            }
                                                        }}
                                                        onChange={e =>
                                                            handleDataValueChange(
                                                                activity.trackInstanceId,
                                                                dataValueMapping[col.accessor],
                                                                e.target.value
                                                            )
                                                        }
                                                    />
                                                );
                                            }
                                            // numeric muac input
                                            if (col.accessor === 'muac_num') {
                                                const beneficiaryStage = activity.beneficiaryStage;
                                                console.log('Data value mapping:', activity.beneficiaryStage);

                                                return (
                                                    <input
                                                        type="text"
                                                        inputMode="numeric"
                                                        pattern="[0-9]*"
                                                        className="form-input"
                                                        value={String(fetchedData.dataValues[dataValueMapping[col.accessor]] || '')}
                                                        onChange={(e) => {
                                                            // strip out anything that isn’t a digit
                                                            const onlyDigits = e.target.value.replace(/\D/g, '');
                                                            const classification = computeMuacClassification(
                                                                onlyDigits,
                                                                beneficiaryStage
                                                            );

                                                            // Update both muac_num and muacClassification in memory
                                                            handleMuacChange(
                                                                activity.trackInstanceId,
                                                                onlyDigits,
                                                                classification
                                                            );
                                                            // setMuacClass(classification);
                                                        }}
                                                        onKeyDown={(e) => {
                                                            // allow only digits, Backspace, Delete, arrows, Tab
                                                            if (
                                                                !/[0-9]/.test(e.key) &&
                                                                e.key !== 'Backspace' &&
                                                                e.key !== 'Delete' &&
                                                                e.key !== 'ArrowLeft' &&
                                                                e.key !== 'ArrowRight' &&
                                                                e.key !== 'Tab' &&
                                                                e.key !== 'Enter'
                                                            ) {
                                                                e.preventDefault();
                                                            }

                                                            if (e.key === 'Enter') {
                                                                const training = col.training || selectedTrainings[0];
                                                                sendDataValueUpdate(
                                                                    activity.trackInstanceId,
                                                                    dataValueMapping[col.accessor],
                                                                    fetchedData.dataValues[dataValueMapping[col.accessor]],
                                                                    training
                                                                );

                                                                // Save Classification
                                                                sendDataValueUpdate(
                                                                    activity.trackInstanceId,
                                                                    dataValueMapping['muacClassification'],
                                                                    fetchedData.dataValues[dataValueMapping['muacClassification']],
                                                                    training
                                                                );
                                                                console.log('Classification : ', fetchedData.dataValues[dataValueMapping['muacClassification']])
                                                            }
                                                        }}
                                                        placeholder="Enter MUAC"
                                                    />
                                                );
                                            }
                                            // fallback text input
                                            return (
                                                <input
                                                    type="text"
                                                    value={String(
                                                        fetchedData.dataValues[
                                                        dataValueMapping[col.accessor]
                                                        ] || ''
                                                    )}
                                                    onKeyDown={e => {
                                                        if (e.key === 'Enter') {
                                                            const training = col.training || selectedTrainings[0];
                                                            sendDataValueUpdate(
                                                                activity.trackInstanceId,
                                                                dataValueMapping[col.accessor],
                                                                e.currentTarget.value === 'Yes',
                                                                training
                                                            );
                                                        }
                                                    }}
                                                    onChange={e =>
                                                        handleDataValueChange(
                                                            activity.trackInstanceId,
                                                            dataValueMapping[col.accessor],
                                                            e.target.value
                                                        )
                                                    }
                                                />
                                            );
                                        })()
                                    )
                                ) : (
                                    // 3 static display when not editing
                                    col.accessor === 'reportDate' ? (
                                        fetchedData.reportDate.split('T')[0] || 'N/A'
                                    ) : col.accessor === 'dueDate' ? (
                                        fetchedData.dueDate.split('T')[0] || 'N/A'
                                    ) : col.accessor in dataValueMapping ? (
                                        // Special case for MUAC value display
                                        dataValueMapping[col.accessor] === 'Muac' ? (
                                            fetchedData.dataValues['Muac'] || '—'
                                        ) : (
                                            // Default checkmark display for other fields
                                            renderCheckCell(
                                                Boolean(fetchedData.dataValues[dataValueMapping[col.accessor]])
                                            )
                                        )
                                    ) : (
                                        (activity as any)[col.accessor] || ''
                                    )
                                )}
                            </td>
                        );
                    })}
                </tr>
            );
        });
    };

    const renderIndirectRows = () => {
        // const inheritedCols = additionalColumns.filter(c => c.accessor !== 'addEditEvent' && topicsVis[c.accessor]);
        const inheritedCols = additionalColumns.filter(c => topicsVis[c.accessor] && c.accessor !== 'addEditEvent');

        if (!indirectBeneficiaries.length) {
            return (
                <tr>
                    <td
                        colSpan={
                            columnsVis.filter(c => c.visible).length +
                            inheritedCols.length +
                            1
                        }
                        className="text-center"
                    >
                        No indirect beneficiaries found for this record
                    </td>
                </tr>
            );
        }

        // grab the parent’s fetched record so we can inherit its dates & dataValues
        const parentId = selectedBeneficiary?.trackInstanceId!;
        const parentData = fetchedDates[parentId] || {
            reportDate: '',
            dueDate: '',
            eventId: '',
            dataValues: {}
        };

        return indirectBeneficiaries.map(ben => (
            <tr key={ben.trackInstanceId}>
                {/* Present/Absent checkbox */}
                <td>
                    <input
                        type="checkbox"
                        // checked={!!indirectPresent[ben.trackInstanceId]}
                        checked={Boolean(fetchedDates[ben.trackInstanceId]?.eventId)} // derive check status from backend
                        onChange={e =>
                            handleIndirectPresentChange(
                                ben.trackInstanceId,
                                e.target.checked
                            )
                        }
                    />
                </td>

                {/* 1 Original columns */}
                {columnsVis
                    .filter(c => c.visible)
                    .map(c => (
                        <td key={c.accessor}>{(ben as any)[c.accessor]}</td>
                    ))}

                {/* 2 Additional columns (read‑only, inherited) */}

                {inheritedCols.map(col => {
                    const isAction = col.accessor === 'addEditEvent';
                    const isCheckbox = col.accessor.includes('checkBox');
                    const isMuacColumn = col.accessor === 'muac_num' || col.accessor === 'oedema_checkBox';
                    const cellClass = isAction
                        ? 'actions-cell'
                        : col.className
                            ? col.className
                            : isCheckbox
                                ? 'numeric-cell'
                                : '';
                    const style: React.CSSProperties = col.minWidth
                        ? { minWidth: col.minWidth }
                        : {};

                    // Only allow editing for MUAC columns
                    const inEdit = editableRows[ben.trackInstanceId] && isMuacColumn;

                    return (
                        <td key={col.accessor} className={cellClass} style={style}>
                            {isAction ? (
                                <div className="button-container">
                                    {editableRows[ben.trackInstanceId] ? (
                                        <>
                                            <button
                                                className="save-button btn"
                                                style={{ backgroundColor: 'green' }}
                                                onClick={e => {
                                                    e.stopPropagation();
                                                    handleSave(
                                                        ben.trackInstanceId,
                                                        fetchedDates[ben.trackInstanceId]?.eventId
                                                    );
                                                }}
                                            >
                                                Save
                                            </button>
                                            <button
                                                className="cancel-button btn"
                                                style={{ backgroundColor: 'red' }}
                                                onClick={e => {
                                                    e.stopPropagation();
                                                    handleCancel(ben.trackInstanceId);
                                                }}
                                            >
                                                Cancel
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button
                                                className="add-button btn"
                                                style={{ backgroundColor: 'grey' }}
                                                onClick={e => {
                                                    e.stopPropagation();
                                                    handleAdd(ben.trackInstanceId);
                                                }}
                                            >
                                                Add
                                            </button>
                                            <button
                                                className="edit-button btn"
                                                style={{ backgroundColor: 'orange' }}
                                                onClick={e => {
                                                    e.stopPropagation();
                                                    handleEdit(ben.trackInstanceId);
                                                }}
                                            >
                                                Edit
                                            </button>
                                        </>
                                    )}
                                </div>
                            ) : inEdit ? (
                                // Editing mode - only for MUAC columns
                                col.accessor === 'muac_num' ? (
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        className="form-input"
                                        value={String(fetchedDates[ben.trackInstanceId]?.dataValues[dataValueMapping[col.accessor]] || '')}
                                        onChange={(e) => {
                                            const onlyDigits = e.target.value.replace(/\D/g, '');
                                            const classification = computeMuacClassification(
                                                onlyDigits,
                                                ben.beneficiaryStage
                                            );
                                            handleMuacChange(
                                                ben.trackInstanceId,
                                                onlyDigits,
                                                classification
                                            );
                                        }}
                                        onKeyDown={(e) => {
                                            if (
                                                !/[0-9]/.test(e.key) &&
                                                e.key !== 'Backspace' &&
                                                e.key !== 'Delete' &&
                                                e.key !== 'ArrowLeft' &&
                                                e.key !== 'ArrowRight' &&
                                                e.key !== 'Tab' &&
                                                e.key !== 'Enter'
                                            ) {
                                                e.preventDefault();
                                            }

                                            if (e.key === 'Enter') {
                                                const training = col.training || selectedTrainings[0];
                                                sendDataValueUpdate(
                                                    ben.trackInstanceId,
                                                    dataValueMapping[col.accessor],
                                                    fetchedDates[ben.trackInstanceId]?.dataValues[dataValueMapping[col.accessor]],
                                                    training
                                                );
                                                sendDataValueUpdate(
                                                    ben.trackInstanceId,
                                                    dataValueMapping['muacClassification'],
                                                    fetchedDates[ben.trackInstanceId]?.dataValues[dataValueMapping['muacClassification']],
                                                    training
                                                );
                                            }
                                        }}
                                        placeholder="Enter MUAC"
                                    />
                                ) : col.accessor === 'oedema_checkBox' ? (
                                    <input
                                        type="checkbox"
                                        checked={
                                            fetchedDates[ben.trackInstanceId]?.dataValues[dataValueMapping[col.accessor]] === true ||
                                            fetchedDates[ben.trackInstanceId]?.dataValues[dataValueMapping[col.accessor]] === 'true'
                                        }
                                        onChange={e =>
                                            handleDataValueChange(
                                                ben.trackInstanceId,
                                                dataValueMapping[col.accessor],
                                                e.target.checked
                                            )
                                        }
                                    />
                                ) : null
                            ) :
                                // Static display when NOT editing
                                (

                                    (() => {
                                        if (col.accessor === 'reportDate') {
                                            return parentData.reportDate?.split('T')[0] || '—';
                                        } else if (col.accessor === 'dueDate') {
                                            return parentData.dueDate?.split('T')[0] || '—';
                                        } else if (col.accessor in dataValueMapping) {
                                            if (col.accessor === 'muac_num') {
                                                return (
                                                    <input
                                                        type="text"
                                                        inputMode="numeric"
                                                        pattern="[0-9]*"
                                                        className="form-input"
                                                        value={String(fetchedDates[ben.trackInstanceId]?.dataValues[dataValueMapping[col.accessor]] || '')}
                                                        onChange={(e) => {
                                                            const onlyDigits = e.target.value.replace(/\D/g, '');
                                                            const classification = computeMuacClassification(
                                                                onlyDigits,
                                                                ben.beneficiaryStage
                                                            );
                                                            handleMuacChange(
                                                                ben.trackInstanceId,
                                                                onlyDigits,
                                                                classification
                                                            );
                                                        }}
                                                        onKeyDown={(e) => {
                                                            if (
                                                                !/[0-9]/.test(e.key) &&
                                                                e.key !== 'Backspace' &&
                                                                e.key !== 'Delete' &&
                                                                e.key !== 'ArrowLeft' &&
                                                                e.key !== 'ArrowRight' &&
                                                                e.key !== 'Tab' &&
                                                                e.key !== 'Enter'
                                                            ) {
                                                                e.preventDefault();
                                                            }

                                                            if (e.key === 'Enter') {
                                                                const training = col.training || selectedTrainings[0];
                                                                sendDataValueUpdate(
                                                                    ben.trackInstanceId,
                                                                    dataValueMapping[col.accessor],
                                                                    fetchedDates[ben.trackInstanceId]?.dataValues[dataValueMapping[col.accessor]],
                                                                    training
                                                                );
                                                                sendDataValueUpdate(
                                                                    ben.trackInstanceId,
                                                                    dataValueMapping['muacClassification'],
                                                                    fetchedDates[ben.trackInstanceId]?.dataValues[dataValueMapping['muacClassification']],
                                                                    training
                                                                );
                                                            }
                                                        }}
                                                        placeholder="Enter MUAC"
                                                    />
                                                );
                                            } else if (col.accessor === 'oedema_checkBox') {
                                                return (
                                                    <input
                                                        type="checkbox"
                                                        checked={
                                                            fetchedDates[ben.trackInstanceId]?.dataValues[dataValueMapping[col.accessor]] === true ||
                                                            fetchedDates[ben.trackInstanceId]?.dataValues[dataValueMapping[col.accessor]] === 'true'
                                                        }
                                                        onChange={e =>
                                                            handleDataValueChange(
                                                                ben.trackInstanceId,
                                                                dataValueMapping[col.accessor],
                                                                e.target.checked
                                                            )
                                                        }
                                                    />
                                                );
                                            } else {
                                                // For other fields, just show a checkmark ✔️ or blank
                                                const raw = fetchedDates[ben.trackInstanceId]?.dataValues[dataValueMapping[col.accessor]];
                                                return renderCheckCell(raw === true || raw === 'true');
                                            }
                                        }
                                        return '—';
                                    })()

                                )

                            }
                        </td>
                    );
                })}

            </tr>
        ));
    };

    const handleColumnToggle = (topic) => {
        setTopicsVis(prev => ({
            ...prev,
            [topic]: !prev[topic],  // Toggle visibility
        }));
    };

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
        setSelectedRecordOnly(true);

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

            {/* First div block - Search, New Beneficiary, Track and Program Stage filters */}
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
                            // checked={trainingFilter === 'Livelihood'}
                            checked={selectedTrainings.length === 1 && selectedTrainings[0] === 'Livelihood'}
                            onChange={() => handleFilterChange('Livelihood')}
                        />
                        Livelihood
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <input
                            type="checkbox"
                            value="Water Sanitation & Hygiene"
                            // checked={trainingFilter === 'Water Sanitation & Hygiene'}
                            checked={selectedTrainings.includes('Water Sanitation & Hygiene')}
                            onChange={() => handleFilterChange('Water Sanitation & Hygiene')}
                        />
                        Water Sanitation & Hygiene
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <input
                            type="checkbox"
                            value="Nutrition"
                            // checked={trainingFilter === 'Nutrition'}
                            checked={selectedTrainings.includes('Nutrition')}
                            onChange={() => handleFilterChange('Nutrition')}
                        />
                        Nutrition
                    </label>
                </div>

                {/* Column Selector */}
                {/* <div ref={dropdownRef} style={{ position: 'relative' }} className="relative column-filter-dropdown">
                    <button
                        className="btn btn-secondary"
                        onClick={() => setShowColumns(v => !v)}
                        style={{ zIndex: 1000 }}
                    >
                        Columns ▼
                    </button>
                    {showColumns && (
                        <div
                            className="absolute mt-1 p-2 bg-white border rounded shadow-lg z-10"
                            style={{ minWidth: '180px', zIndex: 999 }}
                        >
                            {columnsVis.map(col => (
                                <label
                                    key={col.accessor}
                                    className="flex items-start py-1"

                                >
                                    <input
                                        type="checkbox"
                                        checked={col.visible}
                                        onChange={() =>
                                            setColumnsVis(cols =>
                                                cols.map(c =>
                                                    c.accessor === col.accessor
                                                        ? { ...c, visible: !c.visible }
                                                        : c
                                                )
                                            )
                                        }
                                    />
                                    <span
                                    >{col.Header}</span>
                                </label>
                            ))}
                        </div>
                    )}
                </div> */}

                {/* Topics Selector */}
                <div className="relative column-filter-dropdown" ref={dropdownRef} style={{ position: 'relative' }}>
                    <button
                        className="btn btn-secondary"
                        onClick={() => setShowTopics(!showTopics)}
                        style={{ zIndex: 1000 }}
                    >
                        Topics ▼
                    </button>
                    {showTopics && (
                        <div className="filter-menu absolute mt-1 p-2 bg-white border rounded shadow-lg z-10"
                            style={{ minWidth: '220px', zIndex: 999 }}>

                            {/* 1. Always show Shared columns (Date of Training) */}
                            {additionalColumns.some(col => col.training === 'shared') && (
                                <div>
                                    <div className="font-bold mt-2 mb-1 text-sm first:mt-0">
                                        <b>Shared</b>
                                    </div>
                                    {additionalColumns
                                        .filter(col => col.training === 'shared')
                                        .map(col => (
                                            <label key={col.accessor} className="flex items-start py-1 pl-2">
                                                <input
                                                    type="checkbox"
                                                    checked={topicsVis[col.accessor] ?? true}
                                                    onChange={() => handleColumnToggle(col.accessor)}
                                                />
                                                {col.Header}
                                            </label>
                                        ))}
                                </div>
                            )}

                            {/* 2. Always show MUAC Assessment section if any training is selected */}
                            {selectedTrainings.length > 0 && (
                                <div>
                                    <div className="font-bold mt-2 mb-1 text-sm">
                                        <b>Muac Assessment</b>
                                    </div>
                                    {additionalColumns
                                        .filter(col => col.training === 'Muac Assessment')
                                        .map(col => (
                                            <label
                                                key={col.accessor}
                                                className="flex items-start py-1 pl-2"
                                                style={{ marginRight: '10px' }}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={topicsVis[col.accessor] ?? true}
                                                    onChange={() => handleColumnToggle(col.accessor)}
                                                />
                                                {col.Header}
                                            </label>
                                        ))}
                                </div>
                            )}

                            {/* 3. Show other training sections */}
                            {Array.from(new Set(additionalColumns
                                .filter(col => !['shared', 'Muac Assessment', 'Action'].includes(col.training))
                                .map(c => c.training)))
                                .filter(training => training)
                                .map(training => (
                                    <div key={training}>
                                        <div className="font-bold mt-2 mb-1 text-sm">
                                            <b>{training}</b>
                                        </div>
                                        {additionalColumns
                                            .filter(col => col.training === training)
                                            .map(col => (
                                                <label key={col.accessor} className="flex items-start py-1 pl-2">
                                                    <input
                                                        type="checkbox"
                                                        checked={topicsVis[col.accessor] ?? true}
                                                        onChange={() => handleColumnToggle(col.accessor)}
                                                    />
                                                    {col.Header}
                                                </label>
                                            ))}
                                    </div>
                                ))}

                            {/* 4. Action column at the bottom */}
                            <div className="mt-3 pt-2 border-t">
                                <div className="font-bold mb-1 text-sm">
                                    <b>Actions</b>
                                </div>
                                {additionalColumns
                                    .filter(col => col.training === 'Action')
                                    .map(col => (
                                        <label key={col.accessor} className="flex items-start py-1 pl-2">
                                            <input
                                                type="checkbox"
                                                checked={topicsVis[col.accessor] ?? true}
                                                onChange={() => handleColumnToggle(col.accessor)}
                                            />
                                            {col.Header}
                                        </label>
                                    ))}
                            </div>
                        </div>
                    )}
                </div>

                {/*  Revert to all table rows */}
                {
                    selectedRecordOnly && (
                        <button
                            onClick={() => setSelectedRecordOnly(false)}
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
                            Show All Records
                        </button>
                    )
                }

            </div>

            {/* Second div block - Add Beneficiary */}
            <div style={{
                padding: '10px',
                display: 'flex',
                alignItems: 'center',
                gap: '15px',
                marginTop: '-5px'
            }}>


                {/* {selectedProgramStage && (
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
                )} */}

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
                            <thead>
                                <tr>
                                    {columnsVis
                                        .filter(c => c.visible)
                                        .map(c => (
                                            <th key={c.accessor}>{c.Header}</th>
                                        ))
                                    }
                                    {/* then your numbered additional‑columns… */}
                                    {additionalColumns
                                        .filter(col => topicsVis[col.accessor])
                                        .map((col) => {
                                            let label = '';
                                            const fullIndex = additionalColumns.findIndex(c => c.accessor === col.accessor);

                                            if (col.accessor === 'reportDate') {
                                                label = 'Date of Training';
                                            } else if (col.accessor === 'addEditEvent') {
                                                label = `Action`;
                                            } else if (col.accessor === 'oedema_checkBox') {
                                                label = 'Oedema';
                                            } else if (col.accessor === 'muac_num') {
                                                label = 'Muac';
                                            } else {
                                                // Extract the number from the Header (e.g. "1. Fishing Methods" -> "1")
                                                const match = col.Header.match(/^\s*(\d+)\./);
                                                const number = match ? match[1] : '';
                                                // count how many visible non-date, non-action columns come before this one
                                                const trainingPrefix =
                                                    col.training === 'Nutrition' ? 'NUT' :
                                                        col.training === 'Water Sanitation & Hygiene' ? 'WSH' :
                                                            col.training === 'Livelihood' ? 'LIV' :
                                                                'Muac';

                                                
                                                label = trainingPrefix ? `${trainingPrefix}-${number}` : col.Header;
                                            }
                                            return (
                                                <th
                                                    key={col.accessor}
                                                    className={`${col.headerClassName} numeric-header`}
                                                    title={col.Header}
                                                >
                                                    {label}
                                                </th>
                                            );
                                        })}

                                </tr>
                            </thead>

                            <tbody>
                                {renderTableRows()}
                                {/* New row form as part of the table */}
                                {isAddingNewRow && (
                                    <tr>
                                        {/* <td className="min-w-[120px]">
                                            <input
                                                type="text"
                                                className="table-input"
                                                name="id"
                                                value={newRowData.id}
                                                // onChange={handleNewRowInputChange}
                                                onChange={(e) => setNewRowData({ ...newRowData, id: e.target.value })}
                                                placeholder="Row No."
                                            />
                                        </td> */}
                                        {/* <td>NEW</td> */}

                                        <td className="min-w-[120px]">
                                            <input
                                                type="date"
                                                name="recordDate"
                                                value={newRowData.recordDate}
                                                // onChange={handleNewRowInputChange}
                                                onChange={(e) => setNewRowData({ ...newRowData, recordDate: e.target.value })}
                                                className="w-full p-2 mb-2"
                                            />
                                        </td>
                                        <td className="min-w-[120px]">
                                            <select
                                                className="table-select w-full p-2 mb-2"
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
                                        <td className="min-w-[120px]">
                                            <select
                                                className="table-select w-full p-2 mb-2"
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
                                        <td className="min-w-[120px]">
                                            <input
                                                type="text"
                                                className="table-input w-full p-2 mb-2"
                                                name="patientID"
                                                value={newRowData.patientID}
                                                // onChange={handleNewRowInputChange}
                                                onChange={(e) => setNewRowData({ ...newRowData, patientID: e.target.value })}
                                                placeholder="Patient ID"
                                                readOnly
                                            />
                                        </td>
                                        <td className="min-w-[120px]">
                                            <input
                                                type="text"
                                                className="table-input w-full p-2 mb-2"
                                                name="first_middleName"
                                                value={newRowData.first_middleName}
                                                // onChange={handleNewRowInputChange}
                                                onChange={(e) => setNewRowData({ ...newRowData, first_middleName: e.target.value })}
                                                placeholder="First Name and Middle Name"
                                            />
                                        </td>
                                        <td className="min-w-[120px]">
                                            <input
                                                type="text"
                                                className="table-input w-full p-2 mb-2"
                                                name="surname"
                                                value={newRowData.surname}
                                                // onChange={handleNewRowInputChange}
                                                onChange={(e) => setNewRowData({ ...newRowData, surname: e.target.value })}
                                                placeholder="Surname"
                                            />
                                        </td>
                                        <td className="min-w-[120px]" style={{ minWidth: '120px' }}>
                                            <select
                                                className="table-select w-full p-2 mb-2"
                                                name="sex"
                                                value={newRowData.sex}
                                                onChange={(e) => setNewRowData({ ...newRowData, sex: e.target.value })}
                                            >
                                                <option value="">Select Gender</option>
                                                <option value="Male">Male</option>
                                                <option value="Female">Female</option>
                                            </select>
                                        </td>
                                        <td className="min-w-[120px]" style={{ minWidth: '120px' }}>
                                            <input
                                                type="text"
                                                inputMode="numeric"
                                                pattern="[0-9]*"
                                                name="age"
                                                value={newRowData.age}
                                                // onChange={handleNewRowInputChange}
                                                onChange={e => {
                                                    // strip out anything that isn’t a digit
                                                    const onlyDigits = e.target.value.replace(/\D/g, '')
                                                    setNewRowData({ ...newRowData, age: onlyDigits })
                                                }}
                                                onKeyDown={e => {
                                                    // allow only digits, Backspace, Delete, arrows, Tab
                                                    if (
                                                        !/[0-9]/.test(e.key) &&
                                                        e.key !== 'Backspace' &&
                                                        e.key !== 'Delete' &&
                                                        e.key !== 'ArrowLeft' &&
                                                        e.key !== 'ArrowRight' &&
                                                        e.key !== 'Tab'
                                                    ) {
                                                        e.preventDefault()
                                                    }
                                                }}
                                                // style={{ width: '100%' /* keep full‐width even if table cols shrink */ }}
                                                placeholder="Age"
                                                className="w-full p-2 mb-2"
                                            />
                                        </td>
                                        <td className="min-w-[120px]">
                                            <input
                                                type="date"
                                                name="dob"
                                                value={newRowData.dob}
                                                // onChange={handleNewRowInputChange}
                                                onChange={(e) => setNewRowData({ ...newRowData, dob: e.target.value })}
                                                className="w-full p-2 mb-2"
                                            />
                                        </td>
                                        <td className="min-w-[120px]">
                                            <input
                                                type="text"
                                                className="table-input w-full p-2 mb-2"
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
                                        <td className="min-w-[120px]">
                                            <input
                                                type="text"
                                                className="table-input w-full p-2 mb-2"
                                                name="muacClassification"
                                                value={newRowData.muacClassification}

                                                placeholder="Muac Classification"
                                                readOnly
                                            />
                                        </td>
                                        <td className="min-w-[120px]">
                                            <input
                                                type="text"
                                                className="table-input w-full p-2 mb-2"
                                                name="ben_facility_RegNo"
                                                value={newRowData.ben_facility_RegNo}
                                                // onChange={handleNewRowInputChange}
                                                onChange={(e) => setNewRowData({ ...newRowData, ben_facility_RegNo: e.target.value })}
                                                placeholder="Beneficiary Facility Registration Number"
                                            />
                                        </td>
                                        <td className="min-w-[120px]">
                                            <input
                                                type="text"
                                                className="table-input w-full p-2 mb-2"
                                                name="directPatientID"
                                                value={newRowData.directPatientID}
                                                // onChange={handleNewRowInputChange}
                                                onChange={(e) => setNewRowData({ ...newRowData, directPatientID: e.target.value })}
                                                placeholder="Direct Patient ID"
                                            />
                                        </td>
                                        <td className="min-w-[120px]">
                                            <input
                                                type="text"
                                                className="table-input w-full p-2 mb-2"
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
                                                className="submit-button"
                                            >Save</button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setIsAddingNewRow(false)
                                                }}
                                                style={{ marginLeft: '5px' }}
                                                className="cancel-button"
                                            >
                                                Cancel
                                            </button>
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
                                    {/* 3 New Present / Absent header */}
                                    <th>Present / Absent</th>

                                    {/* 1 Original columns – exactly the same visibile set you chose in part 1 */}
                                    {columnsVis
                                        .filter(c => c.visible)
                                        .map(c => (
                                            <th key={c.accessor}>{c.Header}</th>
                                        ))
                                    }
                                    {/* 2 Numbered additional columns */}

                                    {additionalColumns
                                        .filter(col => topicsVis[col.accessor] && col.accessor !== 'addEditEvent')
                                        .map((col) => {
                                            // if (col.accessor === 'addEditEvent') {
                                            //     return (
                                            //         <th
                                            //             key="addEditEvent"
                                            //             className="additional-header-cell actions-header"
                                            //             style={{
                                            //                 backgroundColor: '#f0f0f0',
                                            //                 textAlign: 'center',
                                            //                 minWidth: '140px'
                                            //             }}
                                            //             title="Action"
                                            //         >
                                            //             Action
                                            //         </th>
                                            //     );
                                            // }

                                            let label = '';
                                            if (col.accessor === 'reportDate') {
                                                label = 'Date of Training';
                                            } else if (col.accessor === 'oedema_checkBox') {
                                                label = 'Oedema';
                                            } else if (col.accessor === 'muac_num') {
                                                label = 'Muac';
                                            } else {

                                                // Extract the number from the Header (e.g. "1. Fishing Methods" -> "1")
                                                const match = col.Header.match(/^\s*(\d+)\./);
                                                const number = match ? match[1] : '';
                                                // Get the training prefix
                                                const trainingPrefix =
                                                    col.training === 'Nutrition' ? 'NUT' :
                                                        col.training === 'Water Sanitation & Hygiene' ? 'WSH' :
                                                            col.training === 'Livelihood' ? 'LIV' : '';

                                                
                                                label = trainingPrefix ? `${trainingPrefix}-${number}` : col.Header;
                                            }

                                            return (
                                                <th
                                                    key={col.accessor}
                                                    className={`${col.headerClassName} numeric-header`}
                                                    title={col.Header}
                                                >
                                                    {label}
                                                </th>
                                            );
                                        })
                                    }
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
                                        <td className="min-w-[120px]">
                                            <input
                                                type="date"
                                                value={newIndirectData.recordDate}
                                                onChange={(e) => setNewIndirectData({ ...newIndirectData, recordDate: e.target.value })}

                                                className="w-full p-2 mb-2"
                                            />
                                        </td>
                                        <td className="min-w-[120px]">
                                            <select
                                                className="table-select w-full p-2 mb-2"
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
                                        <td className="min-w-[120px]">
                                            <input
                                                className="table-select w-full p-2 mb-2"
                                                name="beneficiaryType"
                                                value='Indirect Beneficiary'
                                                readOnly
                                            />
                                        </td>
                                        <td className="min-w-[120px]">
                                            <input
                                                type="text"
                                                className="table-input w-full p-2 mb-2"
                                                value={newIndirectData.patientID}
                                                onChange={(e) => setNewIndirectData({ ...newIndirectData, patientID: e.target.value })}
                                                readOnly
                                            />
                                        </td>
                                        <td className="min-w-[120px]">
                                            <input
                                                type="text"
                                                value={newIndirectData.first_middleName}
                                                onChange={(e) => setNewIndirectData({ ...newIndirectData, first_middleName: e.target.value })}
                                                className="w-full p-2 mb-2"
                                                placeholder="First Name and Middle Name"
                                            />
                                        </td>
                                        <td className="min-w-[120px]">
                                            <input
                                                type="text"
                                                className="table-input w-full p-2 mb-2"
                                                value={newIndirectData.surname}
                                                onChange={(e) => setNewIndirectData({ ...newIndirectData, surname: e.target.value })}
                                                placeholder="Surname"
                                            />
                                        </td>
                                        <td className="min-w-[120px]" style={{ minWidth: '120px' }}>
                                            <select
                                                className="table-select w-full p-2 mb-2"
                                                value={newIndirectData.sex}
                                                onChange={(e) => setNewIndirectData({ ...newIndirectData, sex: e.target.value })}
                                            >
                                                <option value="">Select Gender</option>
                                                <option value="Male">Male</option>
                                                <option value="Female">Female</option>
                                            </select>
                                        </td>
                                        <td className="min-w-[120px]" style={{ minWidth: '120px' }}>
                                            <input
                                                type="text"
                                                inputMode="numeric"
                                                pattern="[0-9]*"
                                                name="age"
                                                value={newIndirectData.age}
                                                // onChange={handleNewRowInputChange}
                                                onChange={e => {
                                                    // strip out anything that isn’t a digit
                                                    const onlyDigits = e.target.value.replace(/\D/g, '')
                                                    setNewIndirectData({ ...newIndirectData, age: onlyDigits })
                                                }}
                                                onKeyDown={e => {
                                                    // allow only digits, Backspace, Delete, arrows, Tab
                                                    if (
                                                        !/[0-9]/.test(e.key) &&
                                                        e.key !== 'Backspace' &&
                                                        e.key !== 'Delete' &&
                                                        e.key !== 'ArrowLeft' &&
                                                        e.key !== 'ArrowRight' &&
                                                        e.key !== 'Tab'
                                                    ) {
                                                        e.preventDefault()
                                                    }
                                                }}
                                                style={{ width: '100%' /* keep full‐width even if table cols shrink */ }}
                                                placeholder="Age"
                                                className="w-full p-2 mb-2"
                                            />
                                        </td>
                                        <td className="min-w-[120px]">
                                            <input
                                                type="date"
                                                name="dob"
                                                value={newIndirectData.dob}
                                                // onChange={handleNewRowInputChange}
                                                onChange={(e) => setNewIndirectData({ ...newIndirectData, dob: e.target.value })}
                                                className="w-full p-2 mb-2"
                                            />
                                        </td>
                                        <td className="min-w-[120px]">
                                            <input
                                                type="text"
                                                className="table-input w-full p-2 mb-2"
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
                                        <td className="min-w-[120px]">
                                            <input
                                                type="text"
                                                className="table-input w-full p-2 mb-2"
                                                name="muacClassification"
                                                value={newIndirectData.muacClassification}

                                                placeholder="Muac Classification"
                                                readOnly
                                            />
                                        </td>
                                        <td className="min-w-[120px]">
                                            <input
                                                type="text"
                                                className="table-input w-full p-2 mb-2"
                                                name="ben_facility_RegNo"
                                                value={newIndirectData.ben_facility_RegNo}
                                                // onChange={handleNewRowInputChange}
                                                onChange={(e) => setNewIndirectData({ ...newIndirectData, ben_facility_RegNo: e.target.value })}
                                                placeholder="Beneficiary Facility Registration Number"
                                            />
                                        </td>
                                        <td className="min-w-[120px]">
                                            <input
                                                type="text"
                                                className="table-input w-full p-2 mb-2"
                                                name="directPatientID"
                                                value={newIndirectData.directPatientID}
                                                // onChange={handleNewRowInputChange}
                                                // onChange={(e) => setNewIndirectData({ ...newIndirectData, directPatientID: e.target.value })}
                                                placeholder="Direct Patient ID"
                                                readOnly
                                            />
                                        </td>
                                        <td className="min-w-[120px]">
                                            <input
                                                type="text"
                                                className="table-input w-full p-2 mb-2"
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
                                                className="submit-button"
                                            >
                                                Save
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setIsAddingIndirect(false)
                                                }}
                                                style={{ marginLeft: '5px' }}
                                                className="cancel-button"
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

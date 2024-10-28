import React, {useEffect} from 'react';
import {useState} from 'react';
import {Link} from 'react-router-dom';
import {Table, TablePagination} from '../common/table';
import {Header} from '../header';
import {useTable} from '../../hooks/use-table';
import {Session} from '../../types/org-unit-about';
import {sessionsColumns} from '../../table/sessions';
import {useOrgUnitDetails} from "../../hooks/use-org-unit-details";
import {useOrgUnitAbout} from "../../hooks/use-org-unit-about";


type Props = {
    data: Session[];
    orgUnitId: string;
    detailsId: string;
};

export function SessionsTable(props: Props) {
    const credentials = btoa(`Skununka:Nomisr123$$$$}`);
    const [search, setSearch] = useState('');

    // for setting sessions dropdown
    const {data} = useOrgUnitDetails(props.orgUnitId);
    const [session, setSession] = useState('');
    const [searchCode, setSearchCode] = useState('');
    const [formVisible, setFormVisible] = useState(false);
    const codes = props.data.map((item) => item.code);
    const [saving, setSaving] = useState(false);
    const [trigger, setTrigger] = useState(0);
    const [formData, setFormData] = useState({
        // code: codes.length > 0 ? codes[0] : '',
        code: '',
        session: '',
        sessionDate: ''
    }); // Add initial form data
    // console.log("about data", props.data);
    const [message, setMessage] = useState(null); // State for success or error message
    const [isError, setIsError] = useState(false);
    const table = useTable({
        data: props.data,
        columns: sessionsColumns(credentials, setMessage, setIsError),
        globalFilter: search,
        setGlobalFilter: setSearch,
    });
    const [loading, setLoading] = useState(true);


    const {data:beneficiaryData, isLoading, refetch} = useOrgUnitAbout(props.detailsId);
    // console.log("benef", beneficiaryData?.groupActivities);


    const filteredData = beneficiaryData?.groupActivities.filter(item =>
        item.code.toLowerCase().includes(searchCode.toLowerCase())
    );

    useEffect(() => {
        // Set loading to false when data is available or an error occurs
        if (!isLoading) {

            setLoading(false);
        }
    }, [isLoading]);

    useEffect(() => {
        const matchedElement = data?.find(item => item.id === Number(props.detailsId)); // Convert detailsId to number
        if (matchedElement && typeof matchedElement === 'string') { // Ensure subGroup is a string
            setSession(matchedElement);
        }
    }, [data, props.detailsId]);

    useEffect(() => {
        if (session) {
            // setDropdownOptions(getSessionOptions());
            setFormData((prevData) => ({...prevData, session}));
        }
    }, [session]);

//set code
    useEffect(() => {
        if (filteredData?.length > 0) {
            setFormData((prevData) => ({
                ...prevData,
                code: filteredData[0].code // Example: Set to the first item's code
            }));
        }
    }, [session,trigger]);

    // Options for the "Sub Group" dropdown based on the "Group Type"
    const getSessionOptions = () => {
        switch (session) {
            case 'Group VSLA methodology sessions':
                return [
                    {value: '1.Group formation and General Assembly', label: '1.Group formation and General Assembly'},
                    {value: ' 2.VSLA concepts. ', label: ' 2.VSLA concepts.'},
                    {
                        value: '3.Leadership and Elections of the Management committee ',
                        label: '3.Leadership and Elections of the Management committee'
                    },
                    {
                        value: ' 4.Development of Internal rules and regulations.',
                        label: ' 4.Development of Internal rules and regulations.'
                    },
                    {
                        value: '5.Introduction to written record keeping.',
                        label: '5.Introduction to written record keeping.'
                    },
                    {value: '6.Meeting procedures/ meeting steps.', label: '6.Meeting procedures/ meeting steps.'},
                    {value: '7.Conflict resolution', label: '7.Conflict resolution'},
                    {value: '8.Share-out & Action audit', label: '8.Share-out & Action audit'}
                ];
            case 'VSLA monitoring & Support supervision':
                return [
                    {value: '1.Intensive phase', label: '1.Intensive phase'},
                    {value: '2.Development Phase', label: '2.Development Phase'},
                    {value: '3.Maturity Phase ', label: '3.Maturity Phase '}
                ];
            case 'VSLA saving and borrowing':
                return [
                    {value: '1.Saving', label: '1.Saving'},
                    {value: '2.Borrowing', label: '2.Borrowing'},
                    {value: '3.VSLA fund', label: '3.VSLA fund'}
                ];
            case 'VSLA TOT/ Refresher':
                return [
                    {value: '1.TOT on VSLA methodology ', label: '1.TOT on VSLA methodology '},
                    {value: '2.Financial Literacy and Bank Linkage ', label: '2.Financial Literacy and Bank Linkage '},
                    {
                        value: '3.Selection Planning and Management of IGAs ',
                        label: '3.Selection Planning and Management of IGAs '
                    },
                ];
            case 'Financial Literacy':
                return [
                    {
                        value: '1.Module1: Personal Financial Management',
                        label: '1. Module1: Personal Financial Management'
                    },
                    {value: '2.Module2: Saving', label: '2.Module2: Saving'},
                    {value: '3.Module3: Loan Management', label: '3.Module3: Loan Management'},
                    {value: '4.Module4: Investment', label: '4.Module4: Investment'},
                    {value: '5.Module 5: Planning for Old age', label: '5.Module 5: Planning for Old age'},
                    {value: '6.Module 6: Financial Service providers', label: '6.Module 6: Financial Service providers'}
                ];
            case 'Bank Linkages':
                return [
                    {
                        value: '1.Rating of Mature groups for Bank linkage',
                        label: '1.Rating of Mature groups for Bank linkage'
                    },
                    {value: '2.Sensitization on linkage banking', label: '2.Sensitization on linkage banking'},
                    {value: '3.Account opening process ', label: '3.Account opening process'},
                    {
                        value: '4.Monitoring the performance of Linked groups ',
                        label: '4.Monitoring the performance of Linked groups'
                    },

                ];
            case 'SPM Training':
                return [
                    {value: '1.IGA selection process', label: '1.IGA selection process'},
                    {value: '2.Market assessment', label: '2.Market assessment'},
                    {value: '3.Knowledge and skills', label: '3.Knowledge and skills'},
                    {
                        value: '4.Estimation of start-up and working costs',
                        label: '4.Estimation of start-up and working costs'
                    },
                    {value: '5.Estimating sales and Income', label: '5.Estimating sales and Income'},
                    {value: '6.Weekly expenses and Weekly income', label: '6.Weekly expenses and Weekly income'},
                    {value: '7.Actual IGA Selection', label: '7.Actual IGA Selection'},
                    {value: '8.IGA planning', label: '8.IGA planning'},
                    {value: '9.IGA management', label: '9.IGA management'}
                ];
            case 'SINOVUYO':
                return [
                    {
                        value: '1.Introducing the program and defining goals.',
                        label: '1.Introducing the program and defining goals.'
                    },
                    {
                        value: '2.Building a positive relationship thru',
                        label: '2.Building a positive relationship thru'
                    },
                    {value: '3.Praising each other.', label: '3.Praising each other.'},
                    {value: '4.Talking about emotions', label: '4.Talking about emotions'},
                    {value: '5.Managing anger & solving problems:', label: '5.Managing anger & solving problems:'},
                    {
                        value: '6.Problem solving-putting out the fire spending time together',
                        label: '6.Problem solving-putting out the fire spending time together'
                    },
                    {
                        value: '7.Motivation to save and making a budget',
                        label: '7.Motivation to save and making a budget'
                    },
                    {
                        value: '8.Dealing with problems without Conflict-I',
                        label: '8.Dealing with problems without Conflict-I'
                    },
                    {
                        value: '9.Dealing with problems without conflict-II',
                        label: ' 9.Dealing with problems without conflict-II'
                    },
                    {
                        value: '10.Establishing family rules and routines',
                        label: '10.Establishing family rules and routines'
                    },
                    {
                        value: '11.Understanding the ways to save and the risk to borrow ',
                        label: '11.Understanding the ways to save and the risk to borrow '
                    },
                    {value: '12.Keeping safe in the community', label: '12.Keeping safe in the community'},
                    {value: '13.tResponding to crisis', label: '13.Responding to crisis'},
                    {value: '14.Widening the circle of support', label: '14.tWidening the circle of support'}
                ];
            case 'Early Childhood Development Sessions ':
                return [
                    {
                        value: '1.introduction to Early childhood development',
                        label: '1.introduction to Early childhood development'
                    },
                    {value: '2.Physical development', label: '2.Physical development'},
                    {value: '3.cognitive development', label: '3.cognitive development'},
                    {value: '4.Language development', label: '4.Language development'},
                    {value: '5.social and Emotional Development', label: '5.social and Emotional Development'},
                    {value: '6.Baby cues', label: '6.Baby cues'},
                    {value: '7.Baby Massage', label: '7.Baby Massage'},
                    {
                        value: '8.Basic health, Hygiene, Safety and Nutrition',
                        label: '8.Basic health, Hygiene, Safety and Nutrition'
                    },
                    {value: '9.HIV Basic and HIV in children', label: '9.HIV Basic and HIV in children'},
                    {
                        value: '10.Disclosure, Adherence and HIV risks in children.',
                        label: '10.Disclosure, Adherence and HIV risks in children.'
                    },
                    {value: '11.Loss, Grief and Bereavement', label: '11.Loss, Grief and Bereavement'},
                    {
                        value: '12.Care planning, Referrals and Linkages to care.',
                        label: '12.Care planning, Referrals and Linkages to care.'
                    }
                ];
            case 'AFLATEEN':
                return [
                    {value: '1.Personal Understanding & Exploration', label: '1.Personal Understanding & Exploration'},
                    {value: '2.Rights & Responsibilities', label: '2.Rights & Responsibilities'},
                    {value: '3.Saving & Spending', label: '3.Saving & Spending'},
                    {value: '4.Planning & Budgeting', label: '4.Planning & Budgeting'},
                    {value: '5.Social & Financial Enterprise', label: '5.Social & Financial Enterprise'}
                ];
            case 'No means No sessions (Boys)': //full  name?
                return [
                    {value: '1.Welcome to the NMN Program', label: '1.Welcome to the NMN Program'},
                    {value: '2.The steps on your journey', label: '2.The steps on your journey'},
                    {value: '3.Step outside the box', label: '3.Step outside the box'},
                    {value: '4.Your sources of strength', label: '4.Your sources of strength'},
                    {value: '5.Scenes of strength', label: '5.Scenes of strength'},
                    {value: '6.Empowered survivors’ perspective', label: '6.Empowered survivors’ perspective'},
                    {value: '7.Your moment of truth', label: '7.Your moment of truth'},
                    {value: '8.It takes courage Intervention', label: '8.It takes courage Intervention'},
                    {value: '9.Bystander intervention', label: '9.Bystander intervention'},
                    {value: '10.Graduation.', label: '10.Graduation.'}
                ];
            case 'No means No sessions (Girls)':
                return [
                    {
                        value: '1.Empowerment Self-defence Basics & Assault Continuum.',
                        label: '1.Empowerment Self-defence Basics & Assault Continuum.'
                    },
                    {
                        value: '2.Awareness, Target, test & Attack, weapons and Close targets',
                        label: '2.Awareness, Target, test & Attack, weapons and Close targets'
                    },
                    {
                        value: '3.Boundaries, Assertiveness, Name the behaviour, Make a scene, Mawori Warrior, Close target, What\'s free what\'s open',
                        label: '3.Boundaries, Assertiveness, Name the behaviour, Make a scene, Mawori Warrior, Close target, What\'s free what\'s open'
                    },
                    {value: '4.Negotiations, Descalation and Strike', label: '4.Negotiations, Descalation and Strike'}
                ];
            case 'Work Readiness Assessment':
                return [
                    {value: 'Work Readiness Assessment', label: 'Work Readiness Assessment'}
                ];
            default:
                return [
                    {value: '', label: 'No match for Subgroup'}
                ];
        }
    };

    // console.log("sss", getSessionOptions());

    function onAdd() {
        setFormVisible(true);
    }

    const [selectedDate, setSelectedDate] = useState('');
    const handleDateChange = (event) => {
        const date = new Date(event.target.value);
        const formattedDate = date.toISOString().split('T')[0]; // Format to YYYY-MM-DD
        setSelectedDate(formattedDate);
    };

    function handleInputChange(event) {
        const {name, value} = event.target;
        setFormData((prevData) => ({...prevData, [name]: value}));
    }

    // Function to fetch a new ID from the endpoint
    const fetchNewId = async () => {
        try {
            const response = await fetch(
                `${process.env.REACT_APP_BASE_URL}/api/system/id?`,
                // `/api/system/id?`, //with proxy
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

    async function handleFormSubmit(event: React.FormEvent) {
        event.preventDefault();
        // console.log("formData", formData)
        setSaving(true);

        const newId = await fetchNewId();
        if (!newId) {
            console.error('Failed to generate a new event ID');
            setSaving(false);
            setMessage('Failed to generate a new event ID.');
            return;
        }
        // console.log("id", newId)

        const enteredValues = {
            trackedEntityInstance: props.detailsId,
            orgUnit: props.orgUnitId,
            program: "IXxHJADVCkb",
            programStage: "VzkQBBglj3O",
            eventDate: new Date().toISOString(),
            event: newId,
            status: "COMPLETED",

            dataValues: [
                {dataElement: 'ypDUCAS6juy', value: formData.code}, //direct
                {dataElement: 'n20LkH4ZBF8', value: formData.session}, //Individual Code (Beneficiary ID) code
                {dataElement: 'RECl06RNilT', value: selectedDate}, //name
            ]
        }

        try {
            const response = await fetch(
                `${process.env.REACT_APP_BASE_URL}/api/events?`,
                // `/api/events?`,
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
            // setFormVisible(false);
            await refetch();
            setFormData({code: "", session: "", sessionDate: ""}); // Reset form data
            setSelectedDate('');
            setMessage('Data successfully saved!');
            setIsError(false);
            setTrigger(prevTrigger => prevTrigger + 1);
        } catch (error) {
            console.error('Error posting data:', error);
            setMessage('Error saving data. Please try again.');
            setIsError(true);
        }
        setSaving(false);
    }



    //pagination
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 10; // You can make this dynamic if needed
    const sessions = beneficiaryData?.sessions || [];

    // Calculate the total number of pages
    const totalPages = Math.ceil(sessions.length / rowsPerPage);

    // Get the data to display on the current page
    const paginatedData = sessions.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);
    const renderTableRows = () => {

        const sessionData = beneficiaryData?.sessions;
        // console.log("data", sessionData);

        if (!sessionData || sessionData.length === 0) {
            return (
                <tr>
                    <td colSpan={13}>No data available for Session, Please add new Session Data</td>
                </tr>
            );
        }

        return paginatedData.map((session, index) => {
        // return sessionData.map((session, index) => {

            return (
                <tr key={session.id || index}>
                    <td>{session.code}</td>
                    <td>{session.age}</td>
                    <td>{session.sex}</td>
                    <td>{session.sessions[0]}</td>
                    <td>{session.sessions[1]}</td>
                    <td>{session.sessions[2]}</td>
                    <td>{session.sessions[3]}</td>
                    <td>{session.sessions[4]}</td>
                    <td>{session.sessions[5]}</td>
                    <td>{session.sessions[6]}</td>
                    <td>{session.sessions[7]}</td>
                    <td>{session.sessions[8]}</td>
                    <td>{session.sessions[9]}</td>
                </tr>
            );
        });
    };

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    return (
        <main className="space-y-4">
            <Header
                onAdd={onAdd}
                onSearch={setSearch}
                search={search}
                back={
                    <Link to={`/${props.orgUnitId}/${props.detailsId}/about`}>
                        <button className="py-1 px-4 bg-black text-white rounded-md text-sm">
                            Back
                        </button>
                    </Link>
                }
            />
            {saving && <div className="mt-4">
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

            {formVisible && (
                <div className="form-container">
                    <form onSubmit={handleFormSubmit} className="form">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Search Code</label>
                            <input
                                type="text"
                                value={searchCode}
                                onChange={(e) => setSearchCode(e.target.value)}
                                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                                placeholder="Search Code..."
                            />
                        </div>
                        {/* Code Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Code</label>
                            <select
                                name="code"
                                value={formData.code}
                                onChange={handleInputChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                                required
                            >
                                {filteredData?.length === 0 ? (
                                    <option value="">No beneficiaries found</option>
                                ) : (
                                    filteredData?.map((item, index) => (
                                        <option key={item.code} value={item.code}>
                                            {`${item.code} - ${item.name}`}
                                        </option>
                                    ))
                                )}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Session</label>
                            <select
                                name="session"
                                value={formData.session}
                                onChange={handleInputChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                                required
                            >
                                <option value="">Select a session</option>
                                {getSessionOptions().map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Session Date</label>
                            <input
                                type="date"
                                name="sessionDate"
                                value={selectedDate}
                                onChange={handleDateChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                                required
                            />
                        </div>

                        <div className="button-container">
                            <button type="submit" className="submit-button">
                                Save & Continue
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setFormVisible(false);
                                    setFormData({
                                        code: "", session: "", sessionDate: "",
                                    });
                                    setSelectedDate('');
                                }}
                                className="cancel-button"
                            >
                                Close
                            </button>
                        </div>
                    </form>
                </div>
            )}



            {loading ? (
                <div className="mt-4">
                    <div className="loader-container">
                        <div className="spinner"></div>
                        <p>Loading data, please wait...</p>
                    </div>
                </div>
            ) : (
                <>
                    {!formVisible && <>
                        <div className="table-responsive">
                            <table className="table table-striped table-bordered table-hover table-dark-header">
                                <thead className="text-nowrap">
                                <tr>
                                    <th>Code</th>
                                    <th>Age</th>
                                    <th>Sex</th>
                                    <th>Session 1 Name</th>
                                    <th>Session 1 Date</th>
                                    <th>Session 2 Name</th>
                                    <th>Session 2 Date</th>
                                    <th>Session 3 Name</th>
                                    <th>Session 3 Date</th>
                                    <th>Session 4 Name</th>
                                    <th>Session 4 Date</th>
                                    <th>Session 5 Name</th>
                                    <th>Session 5 Date</th>
                                </tr>
                                </thead>
                                <tbody>{renderTableRows()}</tbody>
                            </table>
                        </div>

                         {/*Pagination Controls*/}
                        <div className="pagination-controls mt-3">
                            <button
                                className="btn btn-primary me-2"
                                onClick={handlePreviousPage}
                                disabled={currentPage === 1}
                            >
                                Previous
                            </button>
                            <span>Page {currentPage} of {totalPages}</span>
                            <button
                                className="btn btn-primary ms-2"
                                onClick={handleNextPage}
                                disabled={currentPage === totalPages}
                            >
                                Next
                            </button>
                        </div>
                    </>}
                    {/*/!* Show table only if form is not visible *!/*/}
                    {/*{!formVisible && <Table table={table} />}*/}
                    {/*{!formVisible && <TablePagination table={table} />}*/}
                </>
            )}

        </main>
    );
}


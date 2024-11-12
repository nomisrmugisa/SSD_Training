import React from 'react';
import {useState} from 'react';
import {Link} from 'react-router-dom';
import {Table, TablePagination} from '../common/table';
import {Header} from '../header';
import {useTable} from '../../hooks/use-table';
import {Session} from '../../types/org-unit-about';
import {sessionsColumns} from '../../table/sessions';


type Props = {
    data: Session[];
    orgUnitId: string;
    detailsId: string;
};

export function SessionsTable(props: Props) {
    const credentials = btoa(`Skununka:Nomisr123$$$$}`);
    const [search, setSearch] = useState('');
    console.log("sessionsTable", props.data);


    const [searchCode, setSearchCode] = useState('');
    const [formVisible, setFormVisible] = useState(false);
    const codes = props.data.map((item) => item.code);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        code: codes.length > 0 ? codes[0] : '',
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

    const filteredData = props.data.filter(item =>
        item.code.toLowerCase().includes(searchCode.toLowerCase())
    );

    // Filtered codes based on search input
    const filteredCodes = codes.filter(code =>
        code.toLowerCase().includes(searchCode.toLowerCase())
    );

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

    async function handleFormSubmit(event: React.FormEvent) {
        event.preventDefault();
        // console.log("formData", formData)
        setLoading(true);

        const newId = await fetchNewId();
        if (!newId) {
            console.error('Failed to generate a new event ID');
            setLoading(false);
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
                `${process.env.REACT_APP_DHIS2_BASE_URL}/api/events?`,
                // `/api/events?`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Basic ${credentials}`,
                    },
                    body: JSON.stringify(enteredValues),
                });

            if (!response.ok) {
                throw new Error('Failed to post data');
            }

            // Hide the form after submission
            // setFormVisible(false);
            setFormData({code: "", session: "", sessionDate: ""}); // Reset form data
            setSelectedDate('');
            setMessage('Data successfully saved!');
            setIsError(false);
        } catch (error) {
            console.error('Error posting data:', error);
            setMessage('Error saving data. Please try again.');
            setIsError(true);
        }
        setLoading(false);
    }

    const handleDownloadCSV = () => {

    }

    return (
        <main className="space-y-4">
            <br></br>
            <Header
                onAdd={onAdd}
                // onSearch={setSearch}
                // search={search}
                back={
                    <Link to={`/${props.orgUnitId}/${props.detailsId}/about`}>
                        <button className="py-1 px-4 bg-black text-white rounded-md text-sm">
                            Back
                        </button>
                    </Link>
                }
                onDownloadCSV={handleDownloadCSV}
            />
            <br></br>
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
                                {filteredData.length === 0 ? (
                                    <option value="">No matching codes found</option>
                                ) : (
                                    filteredData.map((item, index) => (
                                        <option key={index} value={item.code}>
                                            {`${item.code} - ${item.name}`}
                                        </option>
                                    ))
                                )}

                                {/*{props.data.length === 0 ? (*/}
                                {/*    <option value="">Add a beneficiary</option>*/}
                                {/*) : (*/}
                                {/*    props.data.map((item, index) => (*/}
                                {/*        <option key={index} value={item.code}>*/}
                                {/*            {`${item.code} - ${item.name}`}*/}
                                {/*        </option>*/}
                                {/*    ))*/}
                                {/*)}*/}

                                {/*{codes.length === 0 ? (*/}
                                {/*    <option value="">Add a beneficiary</option>*/}
                                {/*) : (*/}
                                {/*    filteredCodes.map((code, index) => (*/}
                                {/*        <option key={index} value={code}>*/}
                                {/*            {code}*/}
                                {/*        </option>*/}
                                {/*    ))*/}
                                {/*)}*/}
                            </select>
                        </div>
                        {/*<div>*/}
                        {/*    <label className="block text-sm font-medium text-gray-700"> Code</label>*/}
                        {/*    <select name="code" value={formData.code} onChange={handleInputChange}>*/}
                        {/*        {codes.map((code, index) => (*/}
                        {/*            <option key={index} value={code}>*/}
                        {/*                {code}*/}
                        {/*            </option>*/}
                        {/*        ))}*/}
                        {/*    </select>*/}
                        {/*</div>*/}


                        <div>
                            <label className="block text-sm font-medium text-gray-700">Session</label>
                            <select
                                name="session"
                                value={formData.session}
                                onChange={handleInputChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                                required
                            >
                                <option value="">Select an option</option>
                                <option value="Introducing the program and defining goals">Introducing the program and
                                    defining goals
                                </option>
                                <option value="Building a positive relationship thru">Building a positive relationship
                                    thru
                                </option>
                                <option value="Talking about emotions">Talking about emotions</option>
                                <option value="Managing anger & solving problems">Managing anger & solving problems
                                </option>
                                <option value="Problem solving-putting out the fire spending time together">Problem
                                    solving-putting out the fire spending time together
                                </option>
                                <option value="Problem solving-putting out the fire spending time">Problem
                                    solving-putting out the fire spending time
                                </option>
                                <option value="Motivation to save and making a budget">Motivation to save and making a
                                    budget
                                </option>
                                <option value="Dealing with problems without Conflict-I">Dealing with problems without
                                    Conflict-I
                                </option>
                                <option value="Dealing with problems without conflict-II">Dealing with problems without
                                    conflict-II
                                </option>
                                <option value=" Establishing family rules and routines"> Establishing family rules and
                                    routines
                                </option>
                                <option value="Understanding the ways to save and the risk to borrow">Understanding the
                                    ways to save and the risk to borrow
                                </option>
                                <option value="Keeping safe in the community">Keeping safe in the community</option>
                                <option value="Responding to crisis">Responding to crisis</option>
                                <option value="Widening the circle of support">Widening the circle of support</option>
                                <option value="VSLA concepts">VSLA concepts</option>
                                <option value="Leadership and Elections of the Management committee">Leadership and
                                    Elections of the Management committee
                                </option>
                                <option value="Leadership and Elections of the Management committee">Leadership and
                                    Elections of the Management committee
                                </option>
                                <option value="Introduction to written record keeping">Introduction to written record
                                    keeping
                                </option>
                                <option value="Meeting procedures/ meeting steps">Meeting procedures/ meeting steps
                                </option>
                                <option value="Conflict resolution">Conflict resolution</option>
                                <option value="Share-out & Action audit">Share-out & Action audit</option>
                                <option value="TOT on VSLA methodology">TOT on VSLA methodology</option>
                                <option value="Financial Literacy and Bank Linkage">Financial Literacy and Bank
                                    Linkage
                                </option>
                                <option value="Selection Planning and Management of IGAs">Selection Planning and
                                    Management of IGAs
                                </option>
                                <option value="Module1: Saving">Module1: Saving</option>
                                <option value="Module2: Debt">Module2: Debt</option>
                                <option value="Module3: Budgeting">Module3: Budgeting</option>
                                <option value="Rating of Mature groups for Bank linkage">Rating of Mature groups for
                                    Bank linkage
                                </option>
                                <option value="Sensitization on linkage banking">Sensitization on linkage banking
                                </option>
                                <option value="Account opening process">Account opening process</option>
                                <option value="Monitoring the performance of Linked groups">Monitoring the performance
                                    of Linked groups
                                </option>
                                <option value="IGA selection process">IGA selection process</option>
                                <option value="Market assessment">Market assessment</option>
                                <option value="Knowledge and skills">Knowledge and skills</option>
                                <option value="Estimation of start-up and working costs"> Estimation of start-up and
                                    working costs
                                </option>
                                <option value="Estimating sales and Income">Estimating sales and Income</option>
                                <option value="Weekly expenses and Weekly income">Weekly expenses and Weekly income
                                </option>
                                <option value="Actual IGA Selection">Actual IGA Selection</option>
                                <option value="IGA planning">IGA planning</option>
                                <option value="IGA management">IGA management</option>
                                <option value="Pupil to pupil Relationships">Pupil to pupil Relationships</option>
                                <option value="Teacher to pupil Relationships">Teacher to pupil Relationships</option>
                                <option value="Resisting negative peer pressure">Resisting negative peer pressure
                                </option>
                                <option value="HIV/AIDS, STI, Truth and Myths">HIV/AIDS, STI, Truth and Myths</option>
                                <option value="HIV Transmission">HIV Transmission</option>
                                <option value="Stigma and Discrimination">Stigma and Discrimination</option>
                                <option value="Gender and HIV">Gender and HIV</option>
                                <option value="Teenage Pregnancy">Teenage Pregnancy</option>
                                <option value="The 4Cs and meaning of consents">The 4Cs and meaning of consents</option>
                                <option value="Power and Consent">Power and Consent</option>
                                <option
                                    value="HIV & School Related Gender Based Violence (SRGBV) risk and protection">HIV &
                                    School Related Gender Based Violence (SRGBV) risk and protection
                                </option>
                                <option value="HIV & School Related GBV risk and protection">HIV & School Related GBV
                                    risk and protection
                                </option>
                                <option value="Positive bystander response to violence"> Positive bystander response to
                                    violence
                                </option>
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
            {!formVisible && <Table 
                                table={table}
                                
                            />
            }
            {!formVisible && <TablePagination table={table}/>}
        </main>
    );
}


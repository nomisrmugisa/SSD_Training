// deleteRecord.ts
export const handleDelete = async (id: string, credentials: string, setMessage: any, setIsError: any) => {
    const isConfirmed = window.confirm("Are you sure you want to delete this record?");
    if (!isConfirmed) return;

    try {
        const response = await fetch(
            `${process.env.REACT_APP_BASE_URL}/api/trackedEntityInstances/${id}`,
            {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Basic ${credentials}`,
                },
            }
        );

        if (response.ok) {
            // Filter out the deleted row
            // setOrgUnitDetails((prevDetails) => prevDetails.filter((item) => item.id !== id));
            console.log("deleted",response, id);
            setMessage('Record successfully deleted!');
            window.alert("Record has been deleted!");
            setIsError(false);
        } else {
            console.error('Failed to delete entity.');
            setMessage('Failed to delete the record.');
            setIsError(true);
        }



        // Optionally refresh the table data after deletion by triggering a state update
    } catch (error) {
        console.error('Error deleting record:', error);
        setMessage('Error deleting record. Please try again.');
        setIsError(true);
    }
};

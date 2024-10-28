import {
  GetOrgUnitDetailsResponse,
  OrgUnitDetails,
} from '../types/org-unit-details';
import axiosInstance from './base-api';


export async function getOrgUnitDetails(id: string): Promise<OrgUnitDetails[]> {
  const response = await axiosInstance.get<GetOrgUnitDetailsResponse>(
      `${process.env.REACT_APP_BASE_URL}/api/trackedEntityInstances/query.json?ou=${id}&ouMode=ALL&order=created:desc&program=ruZAggu6Wbc&pageSize=50&page=1&totalPages=false`
      // `/api/trackedEntityInstances/query.json?ou=${id}&ouMode=ALL&order=created:desc&program=IXxHJADVCkb&pageSize=50&page=1&totalPages=false`
  );
  const rows = response.data.rows;
  // console.log("orgunit res", response);
  // console.log("id res", id);
  return rows.map((row) => ({
    id: Number(row[0]), // Convert id to a number
    // dateOfActivity: row[16],
    venue: row[17],
    recordDate: row[18], // Assuming the correct index
    track: row[19],      // Assuming the correct index
    topicTrainedOn: row[20], // Assuming the correct index
    beneficiaryName: row[21], // Assuming the correct index
    nonBeneficiaryName: row[22], // Assuming the correct index
    
    sex: row[23],                // Assuming the correct index
    age: Number(row[24]),        // Convert age to a number
    // Add any other missing properties with their correct indices
    // subGroup: row[25]
  }));
}

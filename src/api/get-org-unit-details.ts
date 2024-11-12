
// import {
//   GetOrgUnitDetailsResponse,
//   OrgUnitDetails,
// } from '../types/org-unit-details';
// import axiosInstance from './base-api';

// export async function getOrgUnitDetails(id: string): Promise<OrgUnitDetails[]> {
//   const response = await axiosInstance.get<GetOrgUnitDetailsResponse>(
//     `${process.env.REACT_APP_DHIS2_BASE_URL}/api/trackedEntityInstances/query.json?ou=${id}&ouMode=SELECTED&&order=created:desc&program=kmfLZO8ckxY&paging=false`
//     // `/api/trackedEntityInstances/query.json?ou=${id}&ouMode=SELECTED&&order=created:desc&program=kmfLZO8ckxY&pageSize=50&page=1&totalPages=false`  //wth proxy
//   );
//   const rows = response.data.rows;

//   return rows.map((row) => ({
//     id: id,
//     recordDate: row[1],
//     track: row[18],
//     topicTrainedOn: row[11],
//     beneficiaryName: row[12] + '' + row[13],
//     nonBeneficiaryName: row[4],
//     sex: row[16],
//     age: row[14],
//     action: row[7],
//     venue: row[17],
//   }));
// }


import {
  GetOrgUnitDetailsResponse,
  OrgUnitDetails,
} from '../types/org-unit-details';
import axiosInstance from './base-api';

export async function getOrgUnitDetails(
  id: string,
  trainingFilter?: string,
  placeFilter?: string,
  dateFilter?: string,
  trackFilter?: string
): Promise<OrgUnitDetails[]> {
  // Construct the base URL
  let url = `${process.env.REACT_APP_DHIS2_BASE_URL}/api/trackedEntityInstances/query.json?ou=${id}&ouMode=SELECTED&order=created:desc&program=kmfLZO8ckxY&paging=false`;

  // Append filters to the URL if they are provided
  if (trainingFilter) {
    url += `&m35qF41KIdK=${trainingFilter}`;
  }
  // if (placeFilter) {
  //   url += `&venue=${placeFilter}`;
  // }
  if (dateFilter) {
    url += `&created=${dateFilter}`;
  }
  if (trackFilter) {
    url += `&FwEpAEagGeK=${trackFilter}`;
  }

  const response = await axiosInstance.get<GetOrgUnitDetailsResponse>(url);
  const rows = response.data.rows;

  return rows.map((row) => ({
    id: id,
    recordDate: row[1],
    track: row[18],
    topicTrainedOn: row[11],
    beneficiaryName: row[12] + '' + row[13],
    nonBeneficiaryName: row[4],
    sex: row[16],
    age: row[14],
    action: row[7],
    venue: row[17],
  }));
}
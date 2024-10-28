export interface OrgUnitDetails {
  // subGroup: any;
  // dateOfActivity: any;
  id: number;
  recordDate: string;
  track: string;
  topicTrainedOn: string;
  beneficiaryName: string;
  nonBeneficiaryName: string;
  sex: string;
  age: number;
  venue: string;
  // Add any additional fields if necessary
}

export interface GetOrgUnitDetailsResponse {
  rows: string[];
}

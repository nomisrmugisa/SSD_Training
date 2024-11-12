export interface OrgUnitDetails {

  id: string;
  recordDate: string;
  track: string;
  topicTrainedOn: string;
  beneficiaryName: string;
  nonBeneficiaryName: string;
  sex: string;
  age: string;
  venue: string;
  action: string;
}

export interface GetOrgUnitDetailsResponse {
  rows: string[];
}

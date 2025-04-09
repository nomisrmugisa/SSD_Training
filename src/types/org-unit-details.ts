export interface OrgUnitDetails {

  id: string;
  trackInstanceId: string;
  recordDate: string;
  track: string;
  topicTrainedOn: string;
  beneficiaryName: string;
  nonBeneficiaryName: string;
  sex: string;
  age: string;
  venue: string;
  action: string;
  orgUnit: string;
  inactive: string;
  surname: string;
  dob: string;
  first_middleName: string;
  patientID: string;
  beneficiaryStage: string;
}

export interface GetOrgUnitDetailsResponse {
  rows: string[];
}

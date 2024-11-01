export interface getOrgUnitAboutResponse {
  enrollments: { events: IEvent[] }[];
}

export interface IEvent {
  event: string;
  dataValues: DataValue[];
}

export interface DataValue {
  dataElement: string;
  value: string;
}

export interface GroupActivities {
  id: string,
  code: string;
  name: string;
  directIndirect: string;
  sex: string;
  age: string;
}

export interface Session {
  id: string,
  code: string;
  sessions: string[];
  age: string;
  sex: string;
  name: string;

}

// Assuming this is where OrgUnitDetails is defined
export interface OrgUnitDetails {
    id: number;
    subGroup?: string; // Add subGroup if it should exist
    // ... other properties ...
}

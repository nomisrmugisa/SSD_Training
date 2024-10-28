import { Redirect, useParams } from 'react-router-dom';
import { OrgUnitSearch } from './org-unit-search';
import { OrgUnitTable } from './org-unit-table';
import { useOrgUnitDetails } from '../../hooks/use-org-unit-details';
import React from 'react';
import './table-styles.css'; 

// Define the expected parameters as a type
type Params = {
  orgUnitId: string;
};

export function OrgUnitDetails() {
  // Use the defined type with useParams
  const { orgUnitId } = useParams<Params>();

  if (!orgUnitId) {
    return <Redirect to="/" />;
  }

  return (
      <section className="space-y-4">
        <OrgUnitSearch />
        <Table orgUnitId={orgUnitId} />
      </section>
  );
}

function Table(props: { orgUnitId: string }) {
  const { data } = useOrgUnitDetails(props.orgUnitId);

  // Check if data is defined and is an array
  const formattedData = data ? data.map(item => ({
    id: item.id,
    recordDate: item.recordDate, // Adjust field names as necessary
    track: item.track,
    topicTrainedOn: item.topicTrainedOn,
    beneficiaryName: item.beneficiaryName,
    nonBeneficiaryName: item.nonBeneficiaryName,
    sex: item.sex,
    age: item.age,
    venue: item.venue,
  })) : [];

  // orgUnitDetails={formattedData}
  return <OrgUnitTable  orgUnitId={props.orgUnitId} />;
}

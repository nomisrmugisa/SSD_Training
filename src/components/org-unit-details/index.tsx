import { Redirect, useParams } from 'react-router-dom';
import { OrgUnitSearch } from './org-unit-search';
import { OrgUnitTable } from './org-unit-table';
import { useOrgUnitDetails } from '../../hooks/use-org-unit-details';
import React from 'react';

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

  if (data === undefined) return null;

  return <OrgUnitTable orgUnitDetails={data} orgUnitId={props.orgUnitId} />;
}

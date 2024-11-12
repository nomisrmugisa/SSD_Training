import { Redirect, useParams } from 'react-router-dom';
import { useOrgUnitAbout } from '../../hooks/use-org-unit-about';
import { SessionsTable } from '../org-unit-about/sessions-table';
import React from 'react';

// Define a type for the route parameters
type Params = {
  orgUnitId: string;
  detailsId: string;
};

export function SessionsPage() {
  // Use the type with useParams
  const { orgUnitId, detailsId } = useParams<Params>();

  if (!orgUnitId || !detailsId) {
    return <Redirect to="/" />;
  }

  return <Component orgUnitId={orgUnitId} detailsId={detailsId} />;
}

function Component(props: { orgUnitId: string; detailsId: string }) {
  const { data } = useOrgUnitAbout(props.detailsId);

  return (
      <SessionsTable
          data={data?.sessions || []}
          orgUnitId={props.orgUnitId}
          detailsId={props.detailsId}
      />
  );
}

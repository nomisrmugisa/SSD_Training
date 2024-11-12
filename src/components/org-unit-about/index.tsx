import { Redirect, useParams } from 'react-router-dom';
import { useOrgUnitAbout } from '../../hooks/use-org-unit-about';
import { GroupActivitiesTable } from './group-activities-table';
import React from 'react';

// Define the expected parameters as a type
type Params = {
  orgUnitId: string;
  detailsId: string;
};

export function OrgUnitAbout() {
  // Use the defined type with useParams
  const { orgUnitId, detailsId } = useParams<Params>();

  if (!orgUnitId || !detailsId) {
    return <Redirect to="/" />;
  }

  return <Component orgUnitId={orgUnitId} detailsId={detailsId} />;
}

function Component(props: { orgUnitId: string; detailsId: string }) {
  const { data } = useOrgUnitAbout(props.detailsId);

  return (
      <GroupActivitiesTable
          data={data?.groupActivities || []}
          orgUnitId={props.orgUnitId}
          detailsId={props.detailsId}
      />
  );
}

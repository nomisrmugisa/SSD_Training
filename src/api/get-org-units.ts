import { IOrgUnit } from '../types/org-unit';
import axiosInstance from './base-api';

export async function getOrgUnits(search: string) {
  const response = await axiosInstance.get<{ organisationUnits: IOrgUnit[] }>(
    `${process.env.REACT_APP_DHIS2_BASE_URL}/api/organisationUnits.json?filter=displayName:ilike:${search}`
        // `/api/organisationUnits.json?filter=displayName:ilike:${search}` //use wth proxy
  );
  return response.data.organisationUnits;
}

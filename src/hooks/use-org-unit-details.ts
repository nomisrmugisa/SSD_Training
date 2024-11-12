// import { useQuery } from '@tanstack/react-query';
import { useQuery } from 'react-query';

import { getOrgUnitDetails } from '../api/get-org-unit-details';

export function useOrgUnitDetails(id: string) {
  return useQuery({
    queryKey: ['org-unit-details', id],
    queryFn: () => getOrgUnitDetails(id),
  });
}

// import { useQuery } from '@tanstack/react-query';
import { useQuery } from 'react-query';

import { getOrgUnits } from '../api/get-org-units';

export function useOrgUnits(search: string) {
  return useQuery({
    queryKey: ['org-units', search],
    queryFn: () => getOrgUnits(search),
    enabled: false,
  });
}

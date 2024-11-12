// import { useQuery } from '@tanstack/react-query';
import { useQuery } from 'react-query';

import { getOrgUnitAbout } from '../api/get-org-unit-about';

export function useOrgUnitAbout(id: string) {
  return useQuery({
    queryKey: ['org-unit-about', id],
    queryFn: () => getOrgUnitAbout(id),
  });
}

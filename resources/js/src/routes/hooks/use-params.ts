import { useMemo } from 'react';
import { usePage } from '@inertiajs/react';

// ----------------------------------------------------------------------

export function useParams() {
  const props = usePage().props;

  return useMemo(() => props, [props]);
}

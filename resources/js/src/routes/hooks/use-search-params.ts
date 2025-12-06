import { useMemo } from 'react';
import { usePage } from '@inertiajs/react';

// ----------------------------------------------------------------------

export function useSearchParams() {
  const url = usePage().url;

  return useMemo(() => {
    const query = url.split('?')[1] || '';
    return new URLSearchParams(query);
  }, [url]);
}

import {useMemo} from 'react';
import {usePage} from '@inertiajs/react';

// ----------------------------------------------------------------------

export function usePathname() {
  const url = usePage().url;

  return useMemo(() => {
    return url.split('?')[0];
  }, [url]);
}

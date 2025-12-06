import { PropsWithChildren } from 'react';
import { useAuthz } from '@/lib/authz';

export function Can({ permission, anyOf, children }: PropsWithChildren<{ permission?: string; anyOf?: string[] }>) {
  const { can, canAny } = useAuthz();
  const ok = permission ? can(permission) : anyOf ? canAny(anyOf) : false;
  return ok ? <>{children}</> : null;
}

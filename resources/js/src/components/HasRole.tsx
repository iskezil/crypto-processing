import { PropsWithChildren } from 'react';
import { useAuthz } from '@/lib/authz';

export function HasRole({ role, anyOf, children }: PropsWithChildren<{ role?: string; anyOf?: string[] }>) {
  const { hasRole, hasAnyRole } = useAuthz();
  const ok = role ? hasRole(role) : anyOf ? hasAnyRole(anyOf) : false;
  return ok ? <>{children}</> : null;
}

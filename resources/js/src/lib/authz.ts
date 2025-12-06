import { usePage } from '@inertiajs/react';
import type { PageProps } from '@inertiajs/core';

export function useAuthz() {
  const { props } = usePage<PageProps>();
  const roles = props.auth?.user?.roles ?? [];
  const permissions = props.auth?.user?.permissions ?? [];

  const hasRole = (role: string) => roles.includes(role);
  const hasAnyRole = (list: string[]) => list.some((r) => hasRole(r));
  const can = (permission: string) => permissions.includes(permission);
  const canAny = (list: string[]) => list.some((p) => can(p));

  return { roles, permissions, hasRole, hasAnyRole, can, canAny };
}

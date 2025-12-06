import type { InertiaLinkProps } from '@inertiajs/react';

import { Link } from '@inertiajs/react';
import React from "react";

// ----------------------------------------------------------------------

interface RouterLinkProps extends Omit<InertiaLinkProps, 'to'> {
  href: string;
  ref?: React.RefObject<HTMLAnchorElement | null>;
}

export function RouterLink({ href, ref, ...other }: RouterLinkProps) {
  return <Link ref={ref} href={href} {...other} />;
}

import { useMemo } from 'react';

import { useLang } from 'src/hooks/useLang';
import { route } from 'src/routes/route';

import ProjectShow, { type ProjectShowProps } from '../../show';

export default function AdminProjectShow(props: ProjectShowProps) {
  const { __ } = useLang();

  const breadcrumbs = useMemo(() => {
    const statusTitles: Record<string, string> = {
      pending: __('navigation.management.projects_moderation'),
      rejected: __('navigation.management.projects_rejected'),
      approved: __('navigation.management.projects_active'),
    };

    const listRoutes: Record<string, string> = {
      pending: 'projects_moderation.index',
      rejected: 'projects_rejected.index',
      approved: 'projects_active.index',
    };

    const status = props.project.status;

    return [
      { name: __('pages/projects.breadcrumbs.dashboard'), href: route('dashboard', undefined, false) },
      { name: statusTitles[status] || statusTitles.pending, href: route(listRoutes[status] || listRoutes.pending, undefined, false) },
      { name: props.project.name },
    ];
  }, [__, props.project.name, props.project.status]);

  return <ProjectShow {...props} breadcrumbs={breadcrumbs} />;
}

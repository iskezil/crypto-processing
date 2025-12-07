import type { NavSectionProps } from 'src/components/nav-section';

import { useMemo } from 'react';

import { route } from 'src/routes/route';

import { CONFIG } from 'src/global-config';

import { Label } from 'src/components/label';
import { SvgColor } from 'src/components/svg-color';
import { useLang } from 'src/hooks/useLang';
import { useAuthz } from 'src/lib/authz';
import { usePage } from '@inertiajs/react';
import type { PageProps } from '@inertiajs/core';

// ----------------------------------------------------------------------

const icon = (name: string) => (
  <SvgColor src={`${CONFIG.assetsDir}/assets/icons/navbar/${name}.svg`} />
);

const ICONS = {
  job: icon('ic-job'),
  blog: icon('ic-blog'),
  chat: icon('ic-chat'),
  mail: icon('ic-mail'),
  user: icon('ic-user'),
  file: icon('ic-file'),
  lock: icon('ic-lock'),
  tour: icon('ic-tour'),
  order: icon('ic-order'),
  label: icon('ic-label'),
  blank: icon('ic-blank'),
  kanban: icon('ic-kanban'),
  folder: icon('ic-folder'),
  course: icon('ic-course'),
  params: icon('ic-params'),
  banking: icon('ic-banking'),
  booking: icon('ic-booking'),
  invoice: icon('ic-invoice'),
  product: icon('ic-product'),
  calendar: icon('ic-calendar'),
  disabled: icon('ic-disabled'),
  external: icon('ic-external'),
  subpaths: icon('ic-subpaths'),
  menuItem: icon('ic-menu-item'),
  ecommerce: icon('ic-ecommerce'),
  analytics: icon('ic-analytics'),
  dashboard: icon('ic-dashboard'),
};

// ----------------------------------------------------------------------

type ProjectsModerationStats = { pending?: number; approved?: number; rejected?: number } | null;

export function useNavData(): NavSectionProps['data'] {
  const { __ } = useLang();
  const { can, canAny } = useAuthz();
  const { props } = usePage<PageProps & { projectsMenu: any[]; projectsModerationStats: ProjectsModerationStats }>();

  const projectsMenu = (props.projectsMenu || []).map((project) => ({
    title: project.name,
    path: route('projects.show', project.ulid, false),
    status: project.status,
  }));

  const projectStatusColor: Record<string, 'warning' | 'info' | 'error'> = {
    pending: 'warning',
    approved: 'info',
    rejected: 'error',
  };

  const moderationStats = props.projectsModerationStats || {};

  return useMemo(() => {
    const data: NavSectionProps['data'] = [
      {
        subheader: __('navigation.overview.subheader'),
        items: [
          {
            title: __('navigation.overview.one'),
            path: route('dashboard', undefined, false),
            icon: ICONS.dashboard,
            info: <Label>v{CONFIG.appVersion}</Label>,
          },
          {
            title: __('navigation.overview.projects'),
            path: route('projects.index', undefined, false),
            icon: ICONS.banking,
            anyOf: ['PROJECTS_VIEW', 'PROJECTS_CREATE'],
            children: [
              ...projectsMenu.map((project) => ({
                title: project.title,
                path: project.path,
                info: (
                  <Label color={projectStatusColor[project.status] ?? 'info'}>
                    {__(`pages/projects.status.${project.status}`)}
                  </Label>
                ),
              })),
              {
                title: __('navigation.overview.create_project'),
                path: route('projects.create', undefined, false),
                permission: 'PROJECTS_CREATE',
                icon: ICONS.menuItem,
              },
            ],
          },
          {
            title: __('navigation.overview.payments'),
            path: route('payments.index', undefined, false),
            icon: ICONS.invoice,
            permission: 'PAYMENTS_VIEW',
            deepMatch: true,
          },
        ],
      },
      {
        subheader: __('navigation.management.subheader'),
        items: [
          {
            title: __('navigation.management.users'),
            path: route('users.index'),
            icon: ICONS.user,
            permission: 'USERS_VIEW',
            deepMatch: true,
          },
          {
            title: __('navigation.management.rights'),
            path: route('roles.index'),
            icon: ICONS.lock,
            anyOf: ['ROLES_VIEW', 'PERMISSIONS_VIEW'],
            children: [
              {
                title: __('navigation.management.roles'),
                path: route('roles.index'),
                permission: 'ROLES_VIEW',
              },
              {
                title: __('navigation.management.permissions'),
                path: route('permissions.index'),
                permission: 'PERMISSIONS_VIEW',
              },
            ],
          },
          {
            title: __('navigation.management.payments'),
            path: route('payments.admin', undefined, false),
            icon: ICONS.invoice,
            permission: 'PAYMENTS_ADMIN_VIEW',
            deepMatch: true,
          },
          {
            title: __('navigation.management.projects'),
            path: route('projects_moderation.index', undefined, false),
            icon: ICONS.kanban,
            anyOf: ['PROJECTS_MODERATION_VIEW', 'PROJECTS_REJECTED_VIEW', 'PROJECTS_ACTIVE_VIEW'],
            children: [
              {
                title: __('navigation.management.projects_moderation'),
                path: route('projects_moderation.index', undefined, false),
                permission: 'PROJECTS_MODERATION_VIEW',
                deepMatch: true,
                info: (
                  <Label color="warning">
                    { moderationStats.pending ?? 0}
                  </Label>
                ),
              },
              {
                title: __('navigation.management.projects_rejected'),
                path: route('projects_rejected.index', undefined, false),
                permission: 'PROJECTS_REJECTED_VIEW',
                deepMatch: true,
                info: (
                  <Label color="error">
                    { moderationStats.rejected ?? 0}
                  </Label>
                ),
              },
              {
                title: __('navigation.management.projects_active'),
                path: route('projects_active.index', undefined, false),
                permission: 'PROJECTS_ACTIVE_VIEW',
                deepMatch: true,
                info: (
                  <Label color="success">
                    { moderationStats.approved ?? 0}
                  </Label>
                ),
              },
            ],
          },
        ],
      },
    ];

    const filterItems = (items: any[]): any[] =>
      items
        .filter((item) => {
          if (item.permission && !can(item.permission)) return false;
          if (item.anyOf && !canAny(item.anyOf)) return false;
          if (item.children) {
            item.children = filterItems(item.children);
            if (item.children.length === 0) return false;
          }
          return true;
        });

    return data
      .map((group) => ({ ...group, items: filterItems(group.items) }))
      .filter((group) => group.items.length > 0);
  }, [__, can, canAny, projectsMenu]);
}

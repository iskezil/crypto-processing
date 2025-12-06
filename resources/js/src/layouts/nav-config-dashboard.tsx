import type { NavSectionProps } from 'src/components/nav-section';

import { useMemo } from 'react';

import { paths } from 'src/routes/paths';
import { route } from 'src/routes/route';

import { CONFIG } from 'src/global-config';

import { Label } from 'src/components/label';
import { SvgColor } from 'src/components/svg-color';
import { useLang } from 'src/hooks/useLang';
import { useAuthz } from 'src/lib/authz';

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

export function useNavData(): NavSectionProps['data'] {
  const { __ } = useLang();
  const { can, canAny } = useAuthz();

  return useMemo(() => {
    const data: NavSectionProps['data'] = [
      {
        subheader: __('navigation.overview.subheader'),
        items: [
          {
            title: __('navigation.overview.one'),
            path: paths.dashboard.root,
            icon: ICONS.dashboard,
            info: <Label>v{CONFIG.appVersion}</Label>,
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
  }, [__, can, canAny]);
}

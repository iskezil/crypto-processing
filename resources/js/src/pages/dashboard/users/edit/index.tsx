import { CONFIG } from 'src/global-config';
import { DashboardContent, DashboardLayout } from 'src/layouts/dashboard';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { useLang } from 'src/hooks/useLang';
import { paths } from 'src/routes/paths';
import { route } from 'src/routes/route';
import { Can } from 'src/components/Can';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import { Iconify } from '@/components/iconify';
import { RouterLink } from 'src/routes/components';
import { removeLastSlash } from 'minimal-shared/utils';
import { usePathname } from 'src/routes/hooks';
import { router } from '@inertiajs/react';
import { EditUserForm } from '@/pages/dashboard/users/edit/components/edit-user-form';
import { EditPasswordUserForm } from '@/pages/dashboard/users/edit/components/edit-password-user-form';

type Role = { id: number; name: string };

type User = {
  id: number;
  name: string;
  email: string;
  avatar: string | null;
  roles: number[];
  status: 'active' | 'pending' | 'banned';
  email_verified_at: string | null;
};

interface Props {
  user: User;
  roles: Role[];
}

const metadata = { title: `Edit User | Dashboard - ${CONFIG.appName}` };

export default function Edit({ user, roles }: Props) {
  const { __ } = useLang();
  const pathname = usePathname();

  const navItems = [
    {
      label: __('pages/users.edit_tabs.general'),
      icon: <Iconify width={24} icon="solar:user-id-bold" />,
      href: route('users.edit', user.id),
    },
    {
      label: __('pages/users.edit_tabs.security'),
      icon: <Iconify width={24} icon="ic:round-vpn-key" />,
      href: route('users.edit.password', user.id),
    },
  ];

  const currentPath = removeLastSlash(pathname);

  return (
    <>
      <title>{metadata.title}</title>
      <DashboardLayout>
        <Can permission="USERS_EDIT">
          <DashboardContent maxWidth="xl">
            <CustomBreadcrumbs
              heading={__('pages/users.edit_user')}
              links={[
                { name: __('pages/users.breadcrumbs.dashboard'), href: paths.dashboard.root },
                { name: __('pages/users.breadcrumbs.users'), href: route('users.index') },
                { name: __('pages/users.breadcrumbs.edit') },
              ]}
              sx={{ mb: { xs: 3, md: 5 } }}
            />
            <Tabs value={currentPath} onChange={(_, value) => router.visit(value)} sx={{ mb: { xs: 3, md: 5 } }}>
              {navItems.map((tab) => (
                <Tab
                  component={RouterLink}
                  key={tab.href}
                  label={tab.label}
                  icon={tab.icon}
                  value={tab.href}
                  href={tab.href}
                />
              ))}
            </Tabs>
            {currentPath.endsWith('change-password') ? (
              <EditPasswordUserForm currentUser={user} />
            ) : (
              <EditUserForm currentUser={user} roles={roles} />
            )}
          </DashboardContent>
        </Can>
      </DashboardLayout>
    </>
  );
}

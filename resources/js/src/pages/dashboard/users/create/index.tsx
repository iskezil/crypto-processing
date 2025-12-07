import { CONFIG } from 'src/global-config';
import { DashboardContent, DashboardLayout } from 'src/layouts/dashboard';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { useLang } from 'src/hooks/useLang';
import { route } from 'src/routes/route';
import { Can } from 'src/components/Can';
import { CreateUserForm } from 'src/pages/dashboard/users/create/components/create-user-form';

// ----------------------------------------------------------------------

type Role = { id: number; name: string };

interface Props {
  roles: Role[];
}

const metadata = { title: `Create User | Dashboard - ${CONFIG.appName}` };

export default function Create({ roles }: Props) {
  const { __ } = useLang();

  return (
    <>
      <title>{metadata.title}</title>
      <DashboardLayout>
        <Can permission="USERS_CREATE">
          <DashboardContent maxWidth="xl">
            <CustomBreadcrumbs
              heading={__('pages/users.create_user')}
              links={[
                { name: __('pages/users.breadcrumbs.dashboard'), href: route('dashboard', undefined, false) },
                { name: __('pages/users.breadcrumbs.users'), href: route('users.index', undefined, false) },
                { name: __('pages/users.breadcrumbs.create') },
              ]}
              sx={{ mb: { xs: 3, md: 5 } }}
            />
            <CreateUserForm roles={roles} />
          </DashboardContent>
        </Can>
      </DashboardLayout>
    </>
  );
}

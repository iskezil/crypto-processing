import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';

import { CONFIG } from 'src/global-config';
import { DashboardContent, DashboardLayout } from 'src/layouts/dashboard';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { useLang } from 'src/hooks/useLang';
import { route } from 'src/routes/route';

// ----------------------------------------------------------------------

type Project = {
  id: number;
  ulid: string;
  name: string;
  status: 'pending' | 'approved' | 'rejected';
  platform: string;
  user?: { email: string };
  created_at: string;
};

type ModerationStatus = 'pending' | 'approved' | 'rejected';

const metadata = { title: `Projects moderation | Dashboard - ${CONFIG.appName}` };

export default function ModerationList({ projects, status }: { projects: Project[]; status: ModerationStatus }) {
  const { __ } = useLang();

  const titles: Record<ModerationStatus, string> = {
    pending: __('navigation.management.projects_moderation'),
    rejected: __('navigation.management.projects_rejected'),
    approved: __('navigation.management.projects_active'),
  };

  const labelColor: Record<ModerationStatus, 'warning' | 'error' | 'success'> = {
    pending: 'warning',
    rejected: 'error',
    approved: 'success',
  };

  return (
    <>
      <title>{metadata.title}</title>
      <DashboardLayout>
        <DashboardContent maxWidth="xl">
          <CustomBreadcrumbs
            heading={titles[status]}
            links={[
              { name: __('pages/projects.breadcrumbs.dashboard'), href: route('dashboard', undefined, false) },
              { name: titles[status] },
            ]}
            sx={{ mb: { xs: 3, md: 5 } }}
          />

          <Card>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>{__('pages/projects.table.name')}</TableCell>
                    <TableCell>{__('pages/projects.table.platform')}</TableCell>
                    <TableCell>{__('pages/projects.table.status')}</TableCell>
                    <TableCell>{__('pages/projects.table.user')}</TableCell>
                    <TableCell>{__('pages/projects.table.created')}</TableCell>
                    <TableCell width={120}>{__('pages/projects.table.actions')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {projects.map((project) => (
                    <TableRow key={project.id} hover>
                      <TableCell>{project.id}</TableCell>
                      <TableCell>
                        <Button href={route('projects_admin.show', project.ulid, false)} color="inherit">
                          {project.name}
                        </Button>
                      </TableCell>
                      <TableCell>{project.platform}</TableCell>
                      <TableCell>
                        <Label color={labelColor[project.status]}>
                          {__(`pages/projects.status.${project.status}`)}
                        </Label>
                      </TableCell>
                      <TableCell>{project.user?.email}</TableCell>
                      <TableCell>{project.created_at}</TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <IconButton href={route('projects_admin.show', project.ulid, false)} color="primary" size="small">
                            <Iconify icon="solar:eye-bold" width={18} />
                          </IconButton>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}

                  {projects.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        <Stack spacing={1} alignItems="center" sx={{ py: 4 }}>
                          <Typography variant="subtitle1">
                            {__('pages/projects.empty.title')}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {__('pages/projects.empty.description')}
                          </Typography>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </DashboardContent>
      </DashboardLayout>
    </>
  );
}

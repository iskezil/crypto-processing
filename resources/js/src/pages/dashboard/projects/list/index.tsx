import { CONFIG } from 'src/global-config';
import { DashboardContent, DashboardLayout } from 'src/layouts/dashboard';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Label } from 'src/components/label';
import { useLang } from 'src/hooks/useLang';
import { paths } from 'src/routes/paths';
import { Iconify } from 'src/components/iconify';
import { Can } from 'src/components/Can';
import { route } from 'src/routes/route';

import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';

// ----------------------------------------------------------------------

type Project = {
  id: number;
  ulid: string;
  name: string;
  status: 'pending' | 'approved' | 'rejected';
  platform: string;
  created_at: string;
};

const metadata = { title: `Projects | Dashboard - ${CONFIG.appName}` };

const statusColor: Record<Project['status'], 'warning' | 'info' | 'error'> = {
  pending: 'warning',
  approved: 'info',
  rejected: 'error',
};

export default function ProjectsList({ projects }: { projects: Project[] }) {
  const { __ } = useLang();

  return (
    <>
      <title>{metadata.title}</title>
      <DashboardLayout>
        <DashboardContent maxWidth="xl">
          <CustomBreadcrumbs
            heading={__('pages/projects.breadcrumbs.list')}
            links={[
              { name: __('pages/projects.breadcrumbs.dashboard'), href: paths.dashboard.root },
              { name: __('pages/projects.breadcrumbs.list') },
            ]}
            action={
              <Can permission="PROJECTS_CREATE">
                <Button
                  variant="contained"
                  startIcon={<Iconify icon="mingcute:add-line" />}
                  href={route('projects.create')}
                >
                  {__('pages/projects.actions.create')}
                </Button>
              </Can>
            }
            sx={{ mb: { xs: 3, md: 5 } }}
          />

          <Card>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>{__('pages/projects.table.name')}</TableCell>
                    <TableCell>{__('pages/projects.table.platform')}</TableCell>
                    <TableCell>{__('pages/projects.table.status')}</TableCell>
                    <TableCell>{__('pages/projects.table.created')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {projects.map((project) => (
                    <TableRow key={project.id} hover>
                      <TableCell>
                        <Link href={`/projects/${project.ulid}`} color="inherit" underline="hover">
                          {project.name}
                        </Link>
                      </TableCell>
                      <TableCell>{project.platform}</TableCell>
                      <TableCell>
                        <Label color={statusColor[project.status]}>{__(`pages/projects.status.${project.status}`)}</Label>
                      </TableCell>
                      <TableCell>{project.created_at}</TableCell>
                    </TableRow>
                  ))}

                  {projects.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
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

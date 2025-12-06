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
import { Label } from 'src/components/label';

import { CONFIG } from 'src/global-config';
import { DashboardContent, DashboardLayout } from 'src/layouts/dashboard';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { useLang } from 'src/hooks/useLang';
import { paths } from 'src/routes/paths';

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

const metadata = { title: `Projects moderation | Dashboard - ${CONFIG.appName}` };

export default function ModerationList({ projects }: { projects: Project[] }) {
  const { __ } = useLang();

  return (
    <>
      <title>{metadata.title}</title>
      <DashboardLayout>
        <DashboardContent maxWidth="xl">
          <CustomBreadcrumbs
            heading={__('navigation.management.projects_moderation')}
            links={[
              { name: __('pages/projects.breadcrumbs.dashboard'), href: paths.dashboard.root },
              { name: __('navigation.management.projects_moderation') },
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
                  </TableRow>
                </TableHead>
                <TableBody>
                  {projects.map((project) => (
                    <TableRow key={project.id} hover>
                      <TableCell>{project.id}</TableCell>
                      <TableCell>
                        <Button href={`/projects/${project.ulid}`} color="inherit">
                          {project.name}
                        </Button>
                      </TableCell>
                      <TableCell>{project.platform}</TableCell>
                      <TableCell>
                        <Label color="warning">{__(`pages/projects.status.${project.status}`)}</Label>
                      </TableCell>
                      <TableCell>{project.user?.email}</TableCell>
                      <TableCell>{project.created_at}</TableCell>
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

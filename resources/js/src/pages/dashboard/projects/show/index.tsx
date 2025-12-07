import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import Divider from '@mui/material/Divider';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';

import { CONFIG } from 'src/global-config';
import { DashboardContent, DashboardLayout } from 'src/layouts/dashboard';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { useLang } from 'src/hooks/useLang';
import { route } from 'src/routes/route';
import { useState } from 'react';

// ----------------------------------------------------------------------

type ModerationLog = {
  id: number;
  status: string;
  comment: string | null;
  moderator?: { id: number; name: string; email: string } | null;
  created_at: string;
};

type Project = {
  id: number;
  ulid: string;
  name: string;
  status: 'pending' | 'approved' | 'rejected';
  activity_type?: string;
  description?: string | null;
  platform?: string;
  project_url?: string | null;
  success_url?: string | null;
  fail_url?: string | null;
  notify_url?: string | null;
  logo?: string | null;
  test_mode: boolean;
  moderation_logs?: ModerationLog[];
};

const metadata = { title: `Project | Dashboard - ${CONFIG.appName}` };

export default function ProjectShow({ project }: { project: Project }) {
  const { __ } = useLang();
  const [currentTab, setCurrentTab] = useState('settings');

  const latestModeration = project.moderation_logs?.[project.moderation_logs.length - 1];

  return (
    <>
      <title>{metadata.title}</title>
      <DashboardLayout>
        <DashboardContent maxWidth="xl">
          <CustomBreadcrumbs
            heading={project.name}
            links={[
              { name: __('pages/projects.breadcrumbs.dashboard'), href: route('dashboard', undefined, false) },
              { name: __('pages/projects.breadcrumbs.list'), href: route('projects.index', undefined, false) },
              { name: project.name },
            ]}
            sx={{ mb: { xs: 3, md: 5 } }}
          />

          <Card sx={{ p: 3, mb: 3 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" justifyContent="space-between">
              <Stack spacing={1} alignItems={{ xs: 'center', sm: 'flex-start' }}>
                <Typography variant="h5">{project.name}</Typography>
                <Chip
                  color={project.status === 'approved' ? 'success' : project.status === 'pending' ? 'warning' : 'error'}
                  label={__(`pages/projects.status.${project.status}`)}
                />
              </Stack>
              <Button variant="outlined" href={route('pos.show', project.ulid)}>
                {__('pages/projects.tabs.payment_page')}
              </Button>
            </Stack>

            {project.status === 'pending' && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                {__('pages/projects.alerts.pending')}
              </Alert>
            )}

            {project.status === 'rejected' && latestModeration?.comment && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {__('pages/projects.alerts.rejected', { reason: latestModeration.comment })}
              </Alert>
            )}
          </Card>

          <Card>
            <Tabs
              value={currentTab}
              onChange={(_, value) => setCurrentTab(value)}
              variant="scrollable"
              allowScrollButtonsMobile
            >
              <Tab value="settings" label={__('pages/projects.tabs.settings')} />
              <Tab value="integration" label={__('pages/projects.tabs.integration')} />
              <Tab value="currencies" label={__('pages/projects.tabs.currencies')} />
              <Tab value="fees" label={__('pages/projects.tabs.fees')} />
            </Tabs>
            <Divider />
            <Box sx={{ p: 3 }}>
              {currentTab === 'settings' && (
                <Stack spacing={2}>
                  <Typography variant="subtitle2" color="text.secondary">
                    {__('pages/projects.form.activity_type')}: {project.activity_type}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {project.description || __('pages/projects.empty.description')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {__('pages/projects.form.platform')}: {project.platform}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {__('pages/projects.form.project_url_website')}: {project.project_url}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {__('pages/projects.form.success_url')}: {project.success_url || '—'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {__('pages/projects.form.fail_url')}: {project.fail_url || '—'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {__('pages/projects.form.notify_url')}: {project.notify_url || '—'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {__('pages/projects.form.test_mode')}: {project.test_mode ? __('pages/projects.status.enabled') : __('pages/projects.status.disabled')}
                  </Typography>
                </Stack>
              )}

              {currentTab === 'integration' && (
                <Stack spacing={2}>
                  <Typography variant="body2" color="text.secondary">
                    {__('pages/projects.integration.shop_id')}: {project.ulid}
                  </Typography>
                  <Alert severity="info">{__('pages/projects.integration.apikey_placeholder')}</Alert>
                </Stack>
              )}

              {currentTab === 'currencies' && (
                <Alert severity="info">{__('pages/projects.integration.tokens_placeholder')}</Alert>
              )}

              {currentTab === 'fees' && (
                <Alert severity="info">{__('pages/projects.integration.fees_placeholder')}</Alert>
              )}
            </Box>
          </Card>
        </DashboardContent>
      </DashboardLayout>
    </>
  );
}

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Tab from '@mui/material/Tab';
import Paper from '@mui/material/Paper';

import { CONFIG } from 'src/global-config';
import { DashboardContent, DashboardLayout } from 'src/layouts/dashboard';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { CustomTabs } from 'src/components/custom-tabs';
import { useLang } from 'src/hooks/useLang';
import { route } from 'src/routes/route';
import { useState, type ReactNode } from 'react';
import { TokenNetworkAvatar } from 'src/pages/dashboard/projects/components';

// ----------------------------------------------------------------------

type ModerationLog = {
  id: number;
  status: string;
  comment: string | null;
  moderator?: { id: number; name: string; email: string } | null;
  created_at: string;
};

type TokenNetwork = {
  id: number;
  full_code: string;
  token?: { name?: string; code?: string; icon_path?: string; icon_url?: string };
  network?: { name?: string; code?: string; icon_path?: string; icon_url?: string; network?: string };
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
  token_networks?: TokenNetwork[];
};

const metadata = { title: `Project | Dashboard - ${CONFIG.appName}` };

const platformLabels: Record<string, string> = {
  website: 'pages/projects.platforms.website',
  telegram_bot: 'pages/projects.platforms.telegram_bot',
  vk_bot: 'pages/projects.platforms.vk_bot',
  other: 'pages/projects.platforms.other',
};

type InfoRowProps = {
  title: string;
  description: string;
  children: ReactNode;
};

function InfoRow({ title, description, children }: InfoRowProps) {
  return (
    <Grid container spacing={2.5} alignItems="flex-start">
      <Grid size={{ xs: 12, md: 6 }}>
        <Stack spacing={0.75}>
          <Typography variant="subtitle1">{title}</Typography>
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        </Stack>
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>{children}</Grid>
    </Grid>
  );
}

export default function ProjectShow({ project }: { project: Project }) {
  const { __ } = useLang();
  const [currentTab, setCurrentTab] = useState('details');

  const tabs = [
    { value: 'details', label: __('pages/projects.steps.details') },
    { value: 'links', label: __('pages/projects.steps.links') },
    { value: 'currencies', label: __('pages/projects.steps.currencies') },
    { value: 'integration', label: __('pages/projects.tabs.integration') },
    { value: 'fees', label: __('pages/projects.tabs.fees') },
  ];

  const tokenNetworks = project.token_networks ?? [];

  const projectPlatformLabel = project.platform
    ? __(platformLabels[project.platform] || project.platform)
    : __('pages/projects.form.platform');

  const projectUrlTitle = __(platformLabels[project.platform || 'website'] || 'pages/projects.form.project_url_website');

  const testModeDescription = __('pages/projects.helpers.test_mode') || __('pages/projects.form.test_mode');

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
            <CustomTabs
              value={currentTab}
              onChange={(_, value) => setCurrentTab(value)}
              variant="scrollable"
              allowScrollButtonsMobile
              slotProps={{
                list: { sx: { gap: 1, px: 2, pt: 2 } },
                tab: { sx: { borderRadius: 1, minHeight: 44, fontWeight: 600 } },
                indicatorContent: { sx: { boxShadow: 'none' } },
              }}
            >
              {tabs.map((tab) => (
                <Tab key={tab.value} value={tab.value} label={tab.label} />
              ))}
            </CustomTabs>
            <Divider />
            <Box sx={{ p: { xs: 2, md: 3 } }}>
              {currentTab === 'details' && (
                <Stack spacing={3}>
                  <InfoRow
                    title="Название проекта"
                    description="Название проекта будет указываться на странице оплаты, в чеках об оплате у ваших покупателей, а также в вашем личном кабинете."
                  >
                    <Typography variant="body1">{project.name}</Typography>
                  </InfoRow>

                  <InfoRow
                    title="Вид деятельности"
                    description="Наиболее подходящее обозначение вашей деятельности (интернет-магазин / онлайн-школа / сервис или платформа / цифровые товары / Telegram-бот и прочее)."
                  >
                    <Typography variant="body1">{project.activity_type || '—'}</Typography>
                  </InfoRow>

                  <InfoRow
                    title="Описание проекта"
                    description="Расскажите кратко и понятно о вашем проекте: укажите продукт или услугу, целевую аудиторию и формат продажи."
                  >
                    <Typography variant="body2" color="text.secondary">
                      {project.description || __('pages/projects.empty.description')}
                    </Typography>
                  </InfoRow>
                </Stack>
              )}

              {currentTab === 'links' && (
                <Stack spacing={3}>
                  <InfoRow title="Платформа проекта" description="Выбирите платформу проекта.">
                    <Typography variant="body1">{projectPlatformLabel}</Typography>
                  </InfoRow>

                  <InfoRow
                    title={projectUrlTitle}
                    description="Ссылка на сайт, на котором вы хотите принимать платежи. Для корректности интеграции, пожалуйста, указывайте верные данные."
                  >
                    <Typography variant="body1" color="text.secondary">
                      {project.project_url || '—'}
                    </Typography>
                  </InfoRow>

                  <InfoRow
                    title="Успешный URL:"
                    description="Cсылка на страницу, на которую пользователь будет попадать после успешной оплаты."
                  >
                    <Typography variant="body1" color="text.secondary">
                      {project.success_url || '—'}
                    </Typography>
                  </InfoRow>

                  <InfoRow
                    title="Неудачный URL:"
                    description="Cсылка на страницу, на которую пользователь будет попадать после в случае неуспешной оплаты."
                  >
                    <Typography variant="body1" color="text.secondary">
                      {project.fail_url || '—'}
                    </Typography>
                  </InfoRow>

                  <InfoRow
                    title="URL для уведомлений"
                    description="Cсылка на страницу в вашей системе, на который будут приходить уведомления о событиях. Уведомления используются при взаимодействии по API — они позволяют автоматически отслеживать и передавать вашему сайту (или сервису) статусы операций. Если вы хотите принимать платежи с помощью HTML-виджета, данное поле заполнять не нужно."
                  >
                    <Typography variant="body1" color="text.secondary">
                      {project.notify_url || '—'}
                    </Typography>
                  </InfoRow>
                </Stack>
              )}

              {currentTab === 'currencies' && (
                <Stack spacing={3}>
                  {tokenNetworks.length ? (
                    <Grid container spacing={2}>
                      {tokenNetworks.map((tokenNetwork) => {
                        const networkLabel =
                          tokenNetwork.network?.network ||
                          tokenNetwork.network?.name ||
                          tokenNetwork.network?.code ||
                          tokenNetwork.full_code;

                        return (
                          <Grid key={tokenNetwork.id} size={{ xs: 12, sm: 6, md: 4 }}>
                            <Paper
                              variant="outlined"
                              sx={{
                                p: 2,
                                gap: 1.5,
                                display: 'flex',
                                alignItems: 'center',
                                height: '100%',
                              }}
                            >
                              <TokenNetworkAvatar
                                tokenIcon={tokenNetwork.token?.icon_url}
                                networkIcon={tokenNetwork.network?.icon_url}
                                name={tokenNetwork.token?.name || tokenNetwork.network?.name}
                              />
                              <Stack spacing={0.5} sx={{ flexGrow: 1 }}>
                                <Typography variant="subtitle2">
                                  {tokenNetwork.token?.name || tokenNetwork.network?.name || tokenNetwork.full_code}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {networkLabel}
                                </Typography>
                              </Stack>
                            </Paper>
                          </Grid>
                        );
                      })}
                    </Grid>
                  ) : (
                    <Alert severity="info">{__('pages/projects.integration.tokens_placeholder')}</Alert>
                  )}

                  <InfoRow title={__('pages/projects.form.test_mode')} description={testModeDescription}>
                    <Chip
                      label={project.test_mode ? __('pages/projects.status.enabled') : __('pages/projects.status.disabled')}
                      color={project.test_mode ? 'success' : 'default'}
                      variant={project.test_mode ? 'filled' : 'outlined'}
                    />
                  </InfoRow>
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

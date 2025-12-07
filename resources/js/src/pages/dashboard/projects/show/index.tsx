import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from '@inertiajs/react';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Tab from '@mui/material/Tab';
import { tabClasses } from '@mui/material/Tab';
import type { Theme } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';

import Timeline from '@mui/lab/Timeline';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineDot from '@mui/lab/TimelineDot';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';

import { CONFIG } from 'src/global-config';
import { DashboardContent, DashboardLayout } from 'src/layouts/dashboard';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { CustomTabs } from 'src/components/custom-tabs';
import { Iconify } from 'src/components/iconify';
import { useLang } from 'src/hooks/useLang';
import { route } from 'src/routes/route';
import { Form } from 'src/components/hook-form';
import { toast } from 'src/components/snackbar';
import { useAuthz } from 'src/lib/authz';
import { CurrenciesStep } from '../create/components/CurrenciesStep';
import { DetailsStep } from '../create/components/DetailsStep';
import { LinksStep } from '../create/components/LinksStep';
import { projectSchema, type ProjectFormValues } from '../create/schema';
import { varAlpha } from 'minimal-shared/utils';

// ----------------------------------------------------------------------

type ModerationLog = {
  id: number;
  status: string;
  comment: string | null;
  moderator?: { id: number; name: string; email: string } | null;
  created_at: string;
};

type ProjectApiKey = {
  id: number;
  api_key: string;
  secret: string;
  status: 'moderation' | 'active' | 'rejected' | 'revoked';
  revoked_at?: string | null;
  created_at: string;
};

type TokenNetwork = {
  id: number;
  full_code: string;
  stable_coin?: boolean;
  token?: { name?: string; code?: string; icon_path?: string; icon_url?: string };
  network?: { name?: string; code?: string; icon_path?: string; icon_url?: string; network?: string };
};

type BreadcrumbLink = { name: string; href?: string };

type Project = {
  id: number;
  ulid: string;
  name: string;
  status: 'pending' | 'approved' | 'rejected';
  activity_type?: string;
  description?: string | null;
  platform?: ProjectFormValues['platform'];
  project_url?: string | null;
  success_url?: string | null;
  fail_url?: string | null;
  notify_url?: string | null;
  logo?: string | null;
  moderation_logs?: ModerationLog[];
  token_networks?: TokenNetwork[];
  api_keys?: ProjectApiKey[];
  service_fee?: number | null;
};

const metadata = { title: `Project | Dashboard - ${CONFIG.appName}` };

const platformLabels: Record<ProjectFormValues['platform'], string> = {
  website: 'pages/projects.platforms.website',
  telegram_bot: 'pages/projects.platforms.telegram_bot',
  vk_bot: 'pages/projects.platforms.vk_bot',
  other: 'pages/projects.platforms.other',
};

export type ProjectShowProps = {
  project: Project;
  tokenNetworks: TokenNetwork[];
  viewMode?: 'user' | 'admin';
  breadcrumbs?: BreadcrumbLink[];
};

export default function ProjectShow({ project, tokenNetworks, breadcrumbs, viewMode = 'user' }: ProjectShowProps) {
  const { __ } = useLang();
  const { can } = useAuthz();
  const [currentTab, setCurrentTab] = useState('details');
  const [moderationComment, setModerationComment] = useState('');
  const [isPaymentLinkCopied, setIsPaymentLinkCopied] = useState(false);
  const [isApiKeyCopied, setIsApiKeyCopied] = useState(false);
  const [isSecretCopied, setIsSecretCopied] = useState(false);

  const isAdminView = viewMode === 'admin';
  const apiKeys = project.api_keys ?? [];
  const activeApiKey = apiKeys.find((key) => key.status !== 'revoked') ?? apiKeys[0];
  const revokedKeys = apiKeys.filter((key) => key.status === 'revoked');
  const rejectionLog = [...(project.moderation_logs ?? [])]
    .reverse()
    .find((log) => log.status === 'rejected' && log.comment);
  const integrationAvailable = project.status === 'approved';
  const showModerationHistory = isAdminView;
  const apiKeyStatusLabels: Record<ProjectApiKey['status'], string> = {
    moderation: __('pages/projects.api_keys.status.moderation'),
    active: __('pages/projects.api_keys.status.active'),
    rejected: __('pages/projects.api_keys.status.rejected'),
    revoked: __('pages/projects.api_keys.status.revoked'),
  };

  const apiKeyStatusColors: Record<ProjectApiKey['status'], 'warning' | 'success' | 'error' | 'info'> = {
    moderation: 'warning',
    active: 'success',
    rejected: 'error',
    revoked: 'info',
  };

  const moderationStatusColors: Record<string, 'warning' | 'success' | 'error'> = {
    pending: 'warning',
    approved: 'success',
    rejected: 'error',
  };

  const tabSx = (theme: Theme) => ({
    borderRadius: 1,
    minHeight: 44,
    px: 1.5,
    fontWeight: 600,
    fontSize: 14,
    textTransform: 'none',

    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',

    color: theme.vars.palette.text.secondary,
    backgroundColor: 'transparent',
    transition: theme.transitions.create(['background-color', 'color'], {
      duration: theme.transitions.duration.shorter,
    }),
    '&:hover': {
      backgroundColor: theme.vars.palette.action.hover,
    },
    [`&.${tabClasses.selected}`]: {
      color: theme.vars.palette.primary.main,
      backgroundColor: varAlpha(theme.vars.palette.primary.mainChannel, 0.08),
      '&:hover': {
        backgroundColor: varAlpha(theme.vars.palette.primary.mainChannel, 0.16),
      },
    },
  });

  const tabs = useMemo(() => {
    const items = [
      { value: 'details', label: __('pages/projects.steps.details') },
      { value: 'links', label: __('pages/projects.steps.links') },
      { value: 'currencies', label: __('pages/projects.steps.currencies') },
      { value: 'integration', label: __('pages/projects.tabs.integration'), disabled: !integrationAvailable },
      { value: 'fees', label: __('pages/projects.tabs.fees'), disabled: !integrationAvailable },
    ];

    if (showModerationHistory) {
      items.push({ value: 'history', label: __('pages/projects.tabs.history') });
    }

    return items;
  }, [__, integrationAvailable, showModerationHistory]);

  const Schema = useMemo(() => projectSchema(__), [__]);

  const methods = useForm<ProjectFormValues>({
    resolver: zodResolver(Schema),
    defaultValues: {
      name: project.name || '',
      activity_type: project.activity_type || '',
      description: project.description || '',
      platform: project.platform || 'website',
      project_url: project.project_url || '',
      success_url: project.success_url || '',
      fail_url: project.fail_url || '',
      notify_url: project.notify_url || '',
      logo: project.logo || null,
      token_network_ids: (project.token_networks || []).map((item) => item.id),
      accept: true,
    },
  });

  const {
    handleSubmit,
    watch,
    setError,
    trigger,
    formState: { isSubmitting },
  } = methods;

  const platform = watch('platform');
  const projectUrlLabel = __(platformLabels[platform]);
  const latestModeration = project.moderation_logs?.[project.moderation_logs.length - 1];
  const paymentPageLink = route('pos.show', project.ulid, false);

  const breadcrumbLinks: BreadcrumbLink[] =
    breadcrumbs ?? [
      { name: __('pages/projects.breadcrumbs.dashboard'), href: route('dashboard', undefined, false) },
      { name: __('pages/projects.breadcrumbs.list'), href: route('projects.index', undefined, false) },
      { name: project.name },
    ];

  const copyValue = async (
    value: string,
    onCopied: (state: boolean) => void,
    successMessage: string
  ) => {
    onCopied(false);
    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(value);
        onCopied(true);
        toast.success(successMessage);
        setTimeout(() => onCopied(false), 1500);
        return;
      } catch (error) {
        // fallback method below
      }
    }

    const textarea = document.createElement('textarea');
    textarea.value = value;
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();

    try {
      document.execCommand('copy');
      onCopied(true);
      toast.success(successMessage);
      setTimeout(() => onCopied(false), 1500);
    } finally {
      document.body.removeChild(textarea);
    }
  };

  const handleCopyPaymentLink = async () =>
    copyValue(paymentPageLink, setIsPaymentLinkCopied, __('pages/projects.notifications.payment_link_copied'));

  const handleCopyApiKey = async () => {
    if (!activeApiKey) return;
    copyValue(activeApiKey.api_key, setIsApiKeyCopied, __('pages/projects.notifications.api_key_copied'));
  };

  const handleCopyApiSecret = async () => {
    if (!activeApiKey) return;
    copyValue(activeApiKey.secret, setIsSecretCopied, __('pages/projects.notifications.api_secret_copied'));
  };

  const handleRegenerateApiKeys = () => {
    router.post(
      route('projects.api_keys.regenerate', project.ulid),
      {},
      {
        preserveScroll: true,
        onSuccess: () => toast.success(__('pages/projects.notifications.api_keys_regenerated')),
        onError: () => toast.error(__('pages/projects.notifications.status_change_failed')),
      }
    );
  };

  const onSubmit = handleSubmit((data) => {
    const logo = data.logo instanceof File ? data.logo.name : data.logo || '';

    const payload = {
      ...data,
      logo,
      token_network_ids: data.token_network_ids.map((id) => Number(id)),
    };

    router.patch(route('projects.update', project.ulid), payload, {
      onSuccess: () => {
        toast.success(__('pages/projects.notifications.sent_to_moderation'));
      },
      onError: (errors) => {
        Object.entries(errors).forEach(([field, message]) => {
          setError(field as keyof ProjectFormValues, { type: 'server', message: message as string });
        });
      },
    });
  });

  const handleTabChange = async (_: unknown, value: string) => {
    const nextTab = tabs.find((tab) => tab.value === value);
    if (nextTab?.disabled) return;

    const tabFields: Record<string, Array<keyof ProjectFormValues>> = {
      details: ['name', 'activity_type', 'description'],
      links: ['platform', 'project_url', 'success_url', 'fail_url', 'notify_url', 'logo'],
      currencies: ['token_network_ids', 'accept'],
    };

    const fields = tabFields[currentTab];
    if (fields) {
      const valid = await trigger(fields as unknown as string[]);
      if (!valid) {
        return;
      }
    }

    setCurrentTab(value);
  };

  const handleModeration = (action: 'approve' | 'reject' | 'to_pending') => {
    router.post(
      route('projects.moderate', project.ulid),
      {
        action,
        comment: moderationComment || null,
      },
      {
        onSuccess: () => {
          setModerationComment('');
          toast.success(__('pages/projects.notifications.status_changed'));
        },
        onError: () => {
          toast.error(__('pages/projects.notifications.status_change_failed'));
        },
      }
    );
  };

  const canModerate =
    isAdminView &&
    (can('PROJECTS_MODERATION_EDIT') || can('PROJECTS_REJECTED_EDIT') || can('PROJECTS_ACTIVE_EDIT'));

  return (
    <>
      <title>{metadata.title}</title>
      <DashboardLayout>
        <DashboardContent maxWidth={false}>
          <CustomBreadcrumbs
            heading={project.name}
            links={breadcrumbLinks}
            sx={{ mb: { xs: 3, md: 5 } }}
          />
          {canModerate && (
          <Card sx={{ p: 3, mb: 3 }}>
              <Stack spacing={2} sx={{ mt: 3 }}>
                <TextField
                  label={__('pages/projects.form.moderation_comment')}
                  multiline
                  minRows={2}
                  value={moderationComment}
                  onChange={(event) => setModerationComment(event.target.value)}
                />

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                  {project.status === 'pending' && (
                    <>
                      <Button
                        variant="contained"
                        color="success"
                        onClick={() => handleModeration('approve')}
                        sx={{ flexGrow: 1 }}
                      >
                        {__('pages/projects.actions.approve')}
                      </Button>
                      <Button
                        variant="contained"
                        color="error"
                        onClick={() => handleModeration('reject')}
                        sx={{ flexGrow: 1 }}
                      >
                        {__('pages/projects.actions.reject')}
                      </Button>
                    </>
                  )}

                  {project.status === 'rejected' && (
                    <>
                      <Button
                        variant="outlined"
                        color="warning"
                        onClick={() => handleModeration('to_pending')}
                        sx={{ flexGrow: 1 }}
                      >
                        {__('pages/projects.actions.back_to_moderation')}
                      </Button>
                      <Button
                        variant="contained"
                        color="success"
                        onClick={() => handleModeration('approve')}
                        sx={{ flexGrow: 1 }}
                      >
                        {__('pages/projects.actions.approve')}
                      </Button>
                    </>
                  )}

                  {project.status === 'approved' && (
                    <>
                      <Button
                        variant="outlined"
                        color="warning"
                        onClick={() => handleModeration('to_pending')}
                        sx={{ flexGrow: 1 }}
                      >
                        {__('pages/projects.actions.back_to_moderation')}
                      </Button>
                      <Button
                        variant="contained"
                        color="error"
                        onClick={() => handleModeration('reject')}
                        sx={{ flexGrow: 1 }}
                      >
                        {__('pages/projects.actions.reject')}
                      </Button>
                    </>
                  )}
                </Stack>
              </Stack>
          </Card>
          )}
          {!isAdminView && project.status === 'pending' && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              {__('pages/projects.alerts.pending')}
            </Alert>
          )}

          {!isAdminView && project.status === 'rejected' && rejectionLog?.comment && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {__('pages/projects.alerts.rejected', { reason: rejectionLog.comment })}
            </Alert>
          )}

          <Card sx={{ mb: 2 }}>
            <CustomTabs
                value={currentTab}
                onChange={handleTabChange}
                variant="scrollable"
                allowScrollButtonsMobile
                slotProps={{
                  indicator: { sx: { display: 'none' } },
                  indicatorContent: { sx: { display: 'none' } },
                }}
            >
              {tabs.map((tab) => (
                  <Tab
                    key={tab.value}
                    value={tab.value}
                    label={tab.label}
                    disabled={tab.disabled}
                    sx={tabSx}
                  />
              ))}
            </CustomTabs>




          </Card>
          <Card>
            <Divider />
            <Box sx={{ p: { xs: 2, md: 3 } }}>
              <Form methods={methods} onSubmit={onSubmit}>
                <Stack spacing={3}>
                  {currentTab === 'details' && (
                    <DetailsStep
                      title={__('pages/projects.steps.details')}
                      namePlaceholder={__('pages/projects.form.name')}
                      activityPlaceholder={__('pages/projects.form.activity_type')}
                      paymentLink={paymentPageLink}
                      onCopyPaymentLink={handleCopyPaymentLink}
                      paymentLinkCopied={isPaymentLinkCopied}
                    />
                  )}

                  {currentTab === 'links' && (
                    <LinksStep
                      title={__('pages/projects.steps.links')}
                      platformLabels={{
                        website: __('pages/projects.platforms.website'),
                        telegram_bot: __('pages/projects.platforms.telegram_bot'),
                        vk_bot: __('pages/projects.platforms.vk_bot'),
                        other: __('pages/projects.platforms.other'),
                      }}
                      projectUrlLabel={projectUrlLabel}
                      projectUrlPlaceholder="https://"
                      logoTitle={__('pages/projects.helpers.logo_title')}
                      logoDescription={__('pages/projects.helpers.logo_description')}
                    />
                  )}

                  {currentTab === 'currencies' && (
                    <CurrenciesStep
                      title={__('pages/projects.steps.currencies')}
                      tokenNetworks={tokenNetworks}
                      control={methods.control}
                      acceptLabel={__('pages/projects.form.accept_terms')}
                    />
                  )}

                  {currentTab === 'integration' && (
                    <Stack spacing={3}>
                      <Typography variant="body2" color="text.secondary">
                        {__('pages/projects.integration.shop_id')}: {project.ulid}
                      </Typography>

                      {!integrationAvailable ? (
                        <Alert severity="info">{__('pages/projects.integration.apikey_placeholder')}</Alert>
                      ) : (
                        <Stack spacing={2}>
                          {activeApiKey ? (
                            <>
                              <Stack
                                direction={{ xs: 'column', sm: 'row' }}
                                spacing={1}
                                alignItems={{ sm: 'center' }}
                              >
                                <Chip
                                  color={apiKeyStatusColors[activeApiKey.status]}
                                  label={apiKeyStatusLabels[activeApiKey.status]}
                                />
                                <Typography variant="caption" color="text.secondary">
                                  {__('pages/projects.integration.generated_at', { date: activeApiKey.created_at })}
                                </Typography>
                              </Stack>

                              <TextField
                                label={__('pages/projects.integration.api_key')}
                                value={activeApiKey.api_key}
                                InputProps={{
                                  readOnly: true,
                                  endAdornment: (
                                    <InputAdornment position="end">
                                      <Button
                                        size="small"
                                        color={isApiKeyCopied ? 'success' : 'primary'}
                                        startIcon={<Iconify icon="solar:copy-bold" width={18} />}
                                        onClick={handleCopyApiKey}
                                      >
                                        {isApiKeyCopied
                                          ? __('pages/projects.integration.copied')
                                          : __('pages/projects.integration.copy')}
                                      </Button>
                                    </InputAdornment>
                                  ),
                                }}
                              />

                              <TextField
                                label={__('pages/projects.integration.api_secret')}
                                value={activeApiKey.secret}
                                InputProps={{
                                  readOnly: true,
                                  endAdornment: (
                                    <InputAdornment position="end">
                                      <Button
                                        size="small"
                                        color={isSecretCopied ? 'success' : 'primary'}
                                        startIcon={<Iconify icon="solar:copy-bold" width={18} />}
                                        onClick={handleCopyApiSecret}
                                      >
                                        {isSecretCopied
                                          ? __('pages/projects.integration.copied')
                                          : __('pages/projects.integration.copy')}
                                      </Button>
                                    </InputAdornment>
                                  ),
                                }}
                              />

                              <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="flex-end">
                                <Button
                                  variant="outlined"
                                  startIcon={<Iconify icon="solar:refresh-bold" width={18} />}
                                  onClick={handleRegenerateApiKeys}
                                >
                                  {__('pages/projects.actions.regenerate_keys')}
                                </Button>
                              </Stack>

                              {revokedKeys.length > 0 && (
                                <Stack spacing={1}>
                                  <Typography variant="subtitle2">
                                    {__('pages/projects.integration.revoked_keys')}
                                  </Typography>
                                  {revokedKeys.map((key) => (
                                    <Alert key={key.id} severity="info">
                                      {__('pages/projects.integration.revoked_key_item', {
                                        date: key.revoked_at ?? key.created_at,
                                      })}
                                    </Alert>
                                  ))}
                                </Stack>
                              )}
                            </>
                          ) : (
                            <Alert severity="warning">{__('pages/projects.integration.api_key_missing')}</Alert>
                          )}
                        </Stack>
                      )}
                    </Stack>
                  )}

                  {currentTab === 'fees' && (
                    <>
                      {!integrationAvailable ? (
                        <Alert severity="info">{__('pages/projects.integration.fees_placeholder')}</Alert>
                      ) : (
                        <Stack spacing={1}>
                          <Typography variant="subtitle2">
                            {__('pages/projects.integration.fees_title')}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {project.service_fee != null
                              ? __('pages/projects.integration.fees_value', { value: project.service_fee })
                              : __('pages/projects.integration.fees_not_set')}
                          </Typography>
                        </Stack>
                      )}
                    </>
                  )}

                  {currentTab === 'history' && showModerationHistory && (
                    <Stack spacing={2}>
                      {(project.moderation_logs ?? []).length === 0 && (
                        <Alert severity="info">{__('pages/projects.integration.history_empty')}</Alert>
                      )}

                      {(project.moderation_logs ?? []).length > 0 && (
                        <Timeline sx={{ p: 0 }}>
                          {(project.moderation_logs ?? []).map((log, index) => {
                            const color = moderationStatusColors[log.status] || 'warning';
                            return (
                              <TimelineItem key={log.id}>
                                <TimelineSeparator>
                                  <TimelineDot color={color} />
                                  {index < (project.moderation_logs?.length ?? 0) - 1 && <TimelineConnector />}
                                </TimelineSeparator>
                                <TimelineContent>
                                  <Stack spacing={0.5}>
                                    <Typography variant="subtitle2">
                                      {__(`pages/projects.status.${log.status}`)}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      {log.created_at}
                                    </Typography>
                                    {log.moderator && (
                                      <Typography variant="body2">
                                        {__('pages/projects.integration.moderator', { name: log.moderator.name })}
                                      </Typography>
                                    )}
                                    {log.comment && (
                                      <Typography variant="body2" color="text.secondary">
                                        {log.comment}
                                      </Typography>
                                    )}
                                  </Stack>
                                </TimelineContent>
                              </TimelineItem>
                            );
                          })}
                        </Timeline>
                      )}
                    </Stack>
                  )}

                  {currentTab !== 'integration' && currentTab !== 'fees' && currentTab !== 'history' && (
                    <Stack direction="row" spacing={2} justifyContent="flex-end">
                      <Button type="submit" variant="contained" disabled={isSubmitting}>
                        {__('pages/projects.actions.save')}
                      </Button>
                    </Stack>
                  )}
                </Stack>
              </Form>
            </Box>
          </Card>
        </DashboardContent>
      </DashboardLayout>
    </>
  );
}

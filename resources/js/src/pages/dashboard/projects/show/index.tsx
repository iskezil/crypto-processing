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
import TextField from '@mui/material/TextField';

import { CONFIG } from 'src/global-config';
import { DashboardContent, DashboardLayout } from 'src/layouts/dashboard';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { CustomTabs } from 'src/components/custom-tabs';
import { useLang } from 'src/hooks/useLang';
import { route } from 'src/routes/route';
import { Form } from 'src/components/hook-form';
import { toast } from 'src/components/snackbar';
import { useAuthz } from 'src/lib/authz';
import { CurrenciesStep } from '../create/components/CurrenciesStep';
import { DetailsStep } from '../create/components/DetailsStep';
import { LinksStep } from '../create/components/LinksStep';
import { projectSchema, type ProjectFormValues } from '../create/schema';

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
  breadcrumbs?: BreadcrumbLink[];
};

export default function ProjectShow({ project, tokenNetworks, breadcrumbs }: ProjectShowProps) {
  const { __ } = useLang();
  const { can } = useAuthz();
  const [currentTab, setCurrentTab] = useState('details');
  const [moderationComment, setModerationComment] = useState('');
  const [isPaymentLinkCopied, setIsPaymentLinkCopied] = useState(false);

  const tabs = [
    { value: 'details', label: __('pages/projects.steps.details') },
    { value: 'links', label: __('pages/projects.steps.links') },
    { value: 'currencies', label: __('pages/projects.steps.currencies') },
    { value: 'integration', label: __('pages/projects.tabs.integration') },
    { value: 'fees', label: __('pages/projects.tabs.fees') },
  ];

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

  const handleCopyPaymentLink = async () => {
    setIsPaymentLinkCopied(false);
    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(paymentPageLink);
        setIsPaymentLinkCopied(true);
        toast.success(__('pages/projects.notifications.payment_link_copied'));
        setTimeout(() => setIsPaymentLinkCopied(false), 1500);
        return;
      } catch (error) {
        // fallback method below
      }
    }

    const textarea = document.createElement('textarea');
    textarea.value = paymentPageLink;
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();

    try {
      document.execCommand('copy');
      setIsPaymentLinkCopied(true);
      toast.success(__('pages/projects.notifications.payment_link_copied'));
      setTimeout(() => setIsPaymentLinkCopied(false), 1500);
    } finally {
      document.body.removeChild(textarea);
    }
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
    can('PROJECTS_MODERATION_EDIT') || can('PROJECTS_REJECTED_EDIT') || can('PROJECTS_ACTIVE_EDIT');

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

          <Card sx={{ p: 3, mb: 3 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" justifyContent="space-between">
              <Stack spacing={1} alignItems={{ xs: 'center', sm: 'flex-start' }}>
                <Typography variant="h5">{project.name}</Typography>
                <Chip
                  color={project.status === 'approved' ? 'success' : project.status === 'pending' ? 'warning' : 'error'}
                  label={__(`pages/projects.status.${project.status}`)}
                />
              </Stack>
              <Button variant="outlined" href={paymentPageLink}>
                {__('pages/projects.tabs.payment_page')}
              </Button>
            </Stack>
            {canModerate && (
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
                </Stack>
              </Stack>
            )}
          </Card>

          {project.status === 'pending' && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              {__('pages/projects.alerts.pending')}
            </Alert>
          )}

          {project.status === 'rejected' && latestModeration?.comment && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {__('pages/projects.alerts.rejected', { reason: latestModeration.comment })}
            </Alert>
          )}

          <Card sx={{ mb: 2 }}>
            <CustomTabs
              value={currentTab}
              onChange={handleTabChange}
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

                  {currentTab !== 'integration' && currentTab !== 'fees' && (
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

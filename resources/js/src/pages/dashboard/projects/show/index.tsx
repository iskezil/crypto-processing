import { useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from '@inertiajs/react';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';

import { CONFIG } from 'src/global-config';
import { DashboardContent, DashboardLayout } from 'src/layouts/dashboard';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Iconify } from 'src/components/iconify';
import { useLang } from 'src/hooks/useLang';
import { route } from 'src/routes/route';
import { Form } from 'src/components/hook-form';
import { toast } from 'src/components/snackbar';
import { useAuthz } from 'src/lib/authz';
import axiosInstance from 'src/lib/axios';
import { CurrenciesStep, DetailsStep, LinksStep } from '../components/form';
import { projectSchema, type ProjectFormValues } from '../create/schema';
import { type BreadcrumbLink, type Project, type ProjectApiKey, type TokenNetwork } from '../types';
import { IntegrationSection } from './components/IntegrationSection';
import { ProjectTabs, type ProjectTab } from './components/ProjectTabs';
import { HistorySection } from './components/HistorySection';
import { FeesSection } from './components/FeesSection';
import { ModerationActions } from './components/ModerationActions';
import { buildCallbackUrls, isValidHttpUrl, normalizeUrl } from '../utils';

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
  const [isShopIdCopied, setIsShopIdCopied] = useState(false);
  const [isSecretCopied, setIsSecretCopied] = useState(false);
  const [isSecretModalOpen, setIsSecretModalOpen] = useState(false);
  const [generatedSecret, setGeneratedSecret] = useState('');
  const [isGeneratingSecret, setIsGeneratingSecret] = useState(false);

  const isAdminView = viewMode === 'admin';
  const [apiKeys, setApiKeys] = useState<ProjectApiKey[]>(project.api_keys ?? []);
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

  useEffect(() => {
    setApiKeys(project.api_keys ?? []);
  }, [project.api_keys]);

  const moderationStatusColors: Record<string, 'warning' | 'success' | 'error'> = {
    pending: 'warning',
    approved: 'success',
    rejected: 'error',
  };

  const tabs: ProjectTab[] = useMemo(() => {
    const items: ProjectTab[] = [
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
      side_commission: project.side_commission || 'client',
      side_commission_cc: project.side_commission_cc || 'client',
      auto_confirm_partial_by_amount:
        project.auto_confirm_partial_by_amount != null
          ? String(project.auto_confirm_partial_by_amount)
          : '',
      auto_confirm_partial_by_percent:
        project.auto_confirm_partial_by_percent != null
          ? String(project.auto_confirm_partial_by_percent)
          : '',
    },
  });

  const {
    handleSubmit,
    watch,
    setError,
    trigger,
    setValue,
    getValues,
    formState: { isSubmitting },
  } = methods;

  const platform = watch('platform');
  const projectUrlLabel = __(platformLabels[platform]);
  const projectUrl = watch('project_url');
  const projectUrlPlaceholder = platform === 'telegram_bot' ? '@username' : 'https://';
  const paymentPageLink = route('pos.show', project.ulid, true);
  const autoFillBaseRef = useRef<string | null>(null);

  useEffect(() => {
    if (platform !== 'website') {
      autoFillBaseRef.current = null;
      return;
    }

    if (!isValidHttpUrl(projectUrl)) return;

    const normalizedUrl = normalizeUrl(projectUrl);
    const callbacks = buildCallbackUrls(normalizedUrl);
    const previousBase = autoFillBaseRef.current;
    const previousCallbacks = previousBase ? buildCallbackUrls(previousBase) : null;
    const currentValues = getValues();

    const shouldUpdate = (currentValue?: string, previousValue?: string, nextValue?: string) =>
      !currentValue || (!!previousValue && currentValue === previousValue) || currentValue === nextValue;

    if (shouldUpdate(currentValues.success_url, previousCallbacks?.success, callbacks.success)) {
      setValue('success_url', callbacks.success);
    }

    if (shouldUpdate(currentValues.fail_url, previousCallbacks?.fail, callbacks.fail)) {
      setValue('fail_url', callbacks.fail);
    }

    if (shouldUpdate(currentValues.notify_url, previousCallbacks?.notify, callbacks.notify)) {
      setValue('notify_url', callbacks.notify);
    }

    autoFillBaseRef.current = normalizedUrl;
  }, [getValues, platform, projectUrl, setValue]);

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

  const handleCopyShopId = async () =>
    copyValue(project.ulid, setIsShopIdCopied, __('pages/projects.notifications.shop_id_copied'));

  const handleCopyApiKey = async () => {
    if (!activeApiKey) return;
    copyValue(activeApiKey.plain_text_token || '', setIsApiKeyCopied, __('pages/projects.notifications.api_key_copied'));
  };

  const handleCopySecret = async (secret: string) =>
    copyValue(secret, setIsSecretCopied, __('pages/projects.notifications.api_secret_copied'));

  const handleGenerateSecret = async () => {
    if (!integrationAvailable) return;

    setIsGeneratingSecret(true);
    setIsSecretCopied(false);

    try {
      const { data } = await axiosInstance.post<{ api_keys: ProjectApiKey[]; secret: string; api_key?: string }>(
        route('projects.api_keys.secret', project.ulid)
      );

      if (data.api_keys) {
        setApiKeys(data.api_keys);
      }

      if (data.secret) {
        setGeneratedSecret(data.secret);
        setIsSecretModalOpen(true);
      }

      toast.success(__('pages/projects.notifications.secret_created'));
    } catch (error) {
      toast.error(__('pages/projects.notifications.status_change_failed'));
    } finally {
      setIsGeneratingSecret(false);
    }
  };

  const handleCloseSecretModal = () => {
    setIsSecretModalOpen(false);
    setGeneratedSecret('');
  };

  const onSubmit = handleSubmit((data) => {
    const logo = data.logo instanceof File ? data.logo.name : data.logo || '';

    const payload = {
      ...data,
      logo,
      token_network_ids: data.token_network_ids.map((id) => Number(id)),
      auto_confirm_partial_by_amount: data.auto_confirm_partial_by_amount
        ? Number(data.auto_confirm_partial_by_amount)
        : null,
      auto_confirm_partial_by_percent: data.auto_confirm_partial_by_percent
        ? Number(data.auto_confirm_partial_by_percent)
        : null,
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
      links: ['platform', 'project_url', 'logo'],
      currencies: ['token_network_ids', 'accept'],
      integration: ['success_url', 'fail_url', 'notify_url'],
      fees: [
        'side_commission',
        'side_commission_cc',
        'auto_confirm_partial_by_amount',
        'auto_confirm_partial_by_percent',
      ],
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
          <CustomBreadcrumbs heading={project.name} links={breadcrumbLinks} sx={{ mb: { xs: 3, md: 5 } }} />

          <ModerationActions
            canModerate={canModerate}
            status={project.status}
            moderationComment={moderationComment}
            onChangeComment={setModerationComment}
            onModerate={handleModeration}
            labels={{
              comment: __('pages/projects.form.moderation_comment'),
              approve: __('pages/projects.actions.approve'),
              reject: __('pages/projects.actions.reject'),
              backToModeration: __('pages/projects.actions.back_to_moderation'),
            }}
          />

          {!isAdminView && project.status === 'pending' && (
            <ModerationActions.PendingAlert>{__('pages/projects.alerts.pending')}</ModerationActions.PendingAlert>
          )}

          {!isAdminView && project.status === 'rejected' && rejectionLog?.comment && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {__('pages/projects.alerts.rejected', { reason: rejectionLog.comment })}
            </Alert>
          )}

          <Card sx={{ mb: 2 }}>
            <ProjectTabs value={currentTab} tabs={tabs} onChange={handleTabChange} />
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
                      projectUrlPlaceholder={projectUrlPlaceholder}
                      logoTitle={__('pages/projects.helpers.logo_title')}
                      logoDescription={__('pages/projects.helpers.logo_description')}
                      showCallbacks={false}
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
                    <IntegrationSection
                      __={__}
                      integrationAvailable={integrationAvailable}
                      activeApiKey={activeApiKey}
                      apiKeyStatusLabels={apiKeyStatusLabels}
                      apiKeyStatusColors={apiKeyStatusColors}
                      projectUlid={project.ulid}
                      isApiKeyCopied={isApiKeyCopied}
                      isShopIdCopied={isShopIdCopied}
                      isGeneratingSecret={isGeneratingSecret}
                      onCopyApiKey={handleCopyApiKey}
                      onCopyShopId={handleCopyShopId}
                      onGenerateSecret={handleGenerateSecret}
                    />
                  )}

                  {currentTab === 'fees' && (
                    <FeesSection __={__} integrationAvailable={integrationAvailable} serviceFee={project.service_fee} />
                  )}

                  {currentTab === 'history' && showModerationHistory && (
                    <HistorySection
                      __={__}
                      moderationLogs={project.moderation_logs ?? []}
                      revokedKeys={revokedKeys}
                      statusColors={moderationStatusColors}
                    />
                  )}

                  {currentTab !== 'history' && (
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

          <Dialog open={isSecretModalOpen} onClose={handleCloseSecretModal} maxWidth="sm" fullWidth>
            <DialogTitle>
              <Stack direction="row" spacing={1} alignItems="center">
                <Iconify icon="solar:shield-keyhole-bold-duotone" width={24} />
                <Typography variant="h6">{__('pages/projects.integration.secret_modal.title')}</Typography>
              </Stack>
            </DialogTitle>

            <DialogContent>
              <Stack spacing={2}>
                <Typography variant="body2" color="text.secondary">
                  {__('pages/projects.integration.secret_modal.description')}
                </Typography>

                <TextField
                  label={__('pages/projects.integration.api_secret')}
                  value={generatedSecret}
                  margin="dense"
                  size="small"
                  variant="filled"
                  InputProps={{
                    readOnly: true,
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          color={isSecretCopied ? 'success' : 'default'}
                          onClick={() => handleCopySecret(generatedSecret)}
                        >
                          <Iconify icon="solar:copy-bold" width={18} />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <Alert severity="warning" icon={<Iconify icon="solar:danger-triangle-bold" width={20} />}>
                  <Stack spacing={0.5}>
                    <Typography variant="subtitle2">
                      {__('pages/projects.integration.secret_modal.attention')}
                    </Typography>
                    <Typography variant="body2">
                      {__('pages/projects.integration.secret_modal.note')}
                    </Typography>
                  </Stack>
                </Alert>
              </Stack>
            </DialogContent>

            <DialogActions>
              <Button onClick={handleCloseSecretModal}>{__('pages/projects.integration.secret_modal.close')}</Button>
            </DialogActions>
          </Dialog>
        </DashboardContent>
      </DashboardLayout>
    </>
  );
}

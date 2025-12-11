import { useEffect, useMemo, useRef, useState } from 'react';
import { useForm, type FieldErrors, type Resolver } from 'react-hook-form';
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
import { HistorySection, RevokedKeysAccordion } from './components/HistorySection';
import { FeesSection } from './components/FeesSection';
import { ModerationActions } from './components/ModerationActions';
import { ServiceFeeField } from './components/ServiceFeeField';
import { buildCallbackUrls, isValidHttpUrl, normalizeUrl } from '../utils';

const metadata = { title: `Project | Dashboard - ${CONFIG.appName}` };

type PlatformValue = 'website' | 'telegram_bot' | 'vk_bot' | 'other';

const platformLabels: Record<PlatformValue, string> = {
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

  // 🔴 ДОБАВИЛ ref ДЛЯ ИНПУТА С СЕКРЕТОМ
  const secretInputRef = useRef<HTMLInputElement | null>(null);

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

  const adminStatusSlug = useMemo(() => {
    if (project.status === 'approved') return 'active';
    if (project.status === 'rejected') return 'rejected';
    return 'moderation';
  }, [project.status]);

  const canAccessModeration =
      can('PROJECTS_MODERATION_VIEW') || can('PROJECTS_REJECTED_VIEW') || can('PROJECTS_ACTIVE_VIEW');

  const managementAction =
      !isAdminView && canAccessModeration ? (
          <Button
              href={route('projects_admin.show', [adminStatusSlug, project.ulid], false)}
              variant="contained"
              color="inherit"
              startIcon={<Iconify icon="solar:settings-bold" width={20} />}
          >
            {__('pages/projects.actions.manage')}
          </Button>
      ) : null;

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

  const Schema = useMemo(() => projectSchema(__, { requireServiceFee: isAdminView }), [__, isAdminView]);
  const normalizedTokenNetworks = useMemo(
    () => tokenNetworks.map((network) => ({ ...network, stable_coin: !!network.stable_coin })),
    [tokenNetworks],
  );

  const methods = useForm<ProjectFormValues, unknown, ProjectFormValues>({
    resolver: zodResolver(Schema) as unknown as Resolver<ProjectFormValues>,
    defaultValues: {
      name: project.name || '',
      activity_type: project.activity_type || '',
      description: project.description || '',
      platform: (project.platform as PlatformValue | undefined) ?? 'website',
      project_url: project.project_url || '',
      success_url: project.success_url || '',
      fail_url: project.fail_url || '',
      notify_url: project.notify_url || '',
      logo: project.logo || null,
      token_network_ids: (project.token_networks || []).map((item) => item.id),
      accept: true,
      side_commission: project.side_commission ?? '',
      side_commission_cc: project.side_commission_cc ?? '',
      auto_confirm_partial_by_amount:
          project.auto_confirm_partial_by_amount != null
              ? String(project.auto_confirm_partial_by_amount)
              : '',
      auto_confirm_partial_by_percent:
          project.auto_confirm_partial_by_percent != null
              ? String(project.auto_confirm_partial_by_percent)
              : '',
      service_fee:
          isAdminView && project.service_fee == null
              ? String(1.5)
              : project.service_fee != null
                  ? String(project.service_fee)
                  : '',
    },
  });

  const {
    handleSubmit,
    watch,
    setError,
    setValue,
    getValues,
    formState: { isSubmitting },
  } = methods;

  const platformValue = watch('platform') as PlatformValue | '';
  const platform = platformValue || 'website';
  const projectUrlLabelKey = platformValue ? platformLabels[platform] : 'pages/projects.form.project_url';
  const projectUrlLabel = __(projectUrlLabelKey);
  const projectUrl = watch('project_url');
  const projectUrlPlaceholder = platformValue === 'telegram_bot' ? '@username' : 'https://';
  const paymentPageLink = route('pos.show', project.ulid, true);
  const autoFillBaseRef = useRef<string | null>(null);

  useEffect(() => {
    if (platformValue !== 'website') {
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
  }, [getValues, platformValue, projectUrl, setValue]);

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
    const text = value ?? '';
    onCopied(false);

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        onCopied(true);
        toast.success(successMessage);
        setTimeout(() => onCopied(false), 1500);
        return;
      }
    } catch (error) {
      console.error('[copyValue] navigator.clipboard error', error);
    }

    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();

    try {
      const successful = document.execCommand('copy');

      if (!successful) {
        throw new Error('Copy command was rejected');
      }

      onCopied(true);
      toast.success(successMessage);
      setTimeout(() => onCopied(false), 1500);
    } catch (error) {
      console.error('[copyValue] execCommand fallback error', error);
      toast.error(__('pages/projects.notifications.copy_failed'));
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

  const handleCopySecret = async () => {
    console.log('[handleCopySecret] clicked, generatedSecret =', generatedSecret);

    if (!generatedSecret) {
      toast.error(__('pages/projects.notifications.copy_failed'));
      return;
    }

    // 1) Пытаемся через современный API
    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(generatedSecret);
        setIsSecretCopied(true);
        toast.success(__('pages/projects.notifications.api_secret_copied'));
        setTimeout(() => setIsSecretCopied(false), 1500);
        return;
      } catch (error) {
        console.error('[handleCopySecret] navigator.clipboard error, fallback to execCommand', error);
      }
    }

    if (secretInputRef.current) {
      secretInputRef.current.focus();
      secretInputRef.current.select();

      try {
        const successful = document.execCommand('copy');
        console.log('[handleCopySecret] execCommand result from input =', successful);

        if (!successful) {
          throw new Error('Copy command was rejected');
        }

        setIsSecretCopied(true);
        toast.success(__('pages/projects.notifications.api_secret_copied'));
        setTimeout(() => setIsSecretCopied(false), 1500);
        return;
      } catch (error) {
        console.error('[handleCopySecret] execCommand error from input', error);
      }
    }

    toast.error(__('pages/projects.notifications.copy_failed'));
  };

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

  const fieldTabMap: Partial<Record<keyof ProjectFormValues, ProjectTab['value']>> = {
    name: 'details',
    activity_type: 'details',
    description: 'details',
    platform: 'links',
    project_url: 'links',
    logo: 'links',
    success_url: integrationAvailable ? 'integration' : 'links',
    fail_url: integrationAvailable ? 'integration' : 'links',
    notify_url: integrationAvailable ? 'integration' : 'links',
    token_network_ids: 'currencies',
    accept: 'currencies',
    side_commission: 'fees',
    side_commission_cc: 'fees',
    auto_confirm_partial_by_amount: 'fees',
    auto_confirm_partial_by_percent: 'fees',
    service_fee: 'fees',
  };

  const handleValidationErrors = (errors: FieldErrors<ProjectFormValues>) => {
    const [firstErrorField] = Object.keys(errors) as (keyof ProjectFormValues | undefined)[];
    const normalizedField = firstErrorField?.toString().split('.')[0] as keyof ProjectFormValues | undefined;

    if (!normalizedField) return;

    const targetTab = fieldTabMap[normalizedField];
    if (!targetTab) return;

    const tabInfo = tabs.find((tab) => tab.value === targetTab);
    if (!tabInfo) return;

    setCurrentTab(tabInfo.value);
    toast.error(__('pages/projects.notifications.validation_failed', { tab: tabInfo.label }));
  };

  const onSubmit = handleSubmit((data) => {
    const selectedTokenNetworkIds = data.token_network_ids.map((id: number | string) => Number(id));

    const logoChanged = data.logo instanceof File ? true : (data.logo || '') !== (project.logo || '');
    const formServiceFee = data.service_fee !== '' ? Number(data.service_fee) : null;

    const hasNonTokenChanges =
        logoChanged ||
        data.name !== project.name ||
        data.activity_type !== (project.activity_type || '') ||
        data.description !== (project.description || '') ||
        data.platform !== (project.platform || '') ||
        data.project_url !== (project.project_url || '') ||
        data.success_url !== (project.success_url || '') ||
        data.fail_url !== (project.fail_url || '') ||
        data.notify_url !== (project.notify_url || '') ||
        data.side_commission !== (project.side_commission || '') ||
        data.side_commission_cc !== (project.side_commission_cc || '') ||
        data.auto_confirm_partial_by_amount !==
        (project.auto_confirm_partial_by_amount != null
            ? String(project.auto_confirm_partial_by_amount)
            : '') ||
        data.auto_confirm_partial_by_percent !==
        (project.auto_confirm_partial_by_percent != null
            ? String(project.auto_confirm_partial_by_percent)
            : '') ||
        (isAdminView && formServiceFee !== (project.service_fee != null ? Number(project.service_fee) : null));

    const shouldSendToModeration = !isAdminView && project.status === 'approved' && hasNonTokenChanges;

    const payload = {
      ...data,
      token_network_ids: selectedTokenNetworkIds,
      auto_confirm_partial_by_amount: data.auto_confirm_partial_by_amount
          ? Number(data.auto_confirm_partial_by_amount)
          : null,
      auto_confirm_partial_by_percent: data.auto_confirm_partial_by_percent
          ? Number(data.auto_confirm_partial_by_percent)
          : null,
      service_fee: formServiceFee,
      context: isAdminView ? 'admin' : 'user',
    };

    router.patch(route('projects.update', project.ulid), payload, {
      forceFormData: true,
      preserveScroll: true,
      onSuccess: () => {
        if (shouldSendToModeration) {
          toast.success(__('pages/projects.notifications.sent_to_moderation'));
          return;
        }

        toast.success(__('pages/projects.notifications.saved'));
      },
      onError: (errors) => {
        handleValidationErrors(errors as FieldErrors<ProjectFormValues>);
        Object.entries(errors).forEach(([field, message]) => {
          setError(field as keyof ProjectFormValues, { type: 'server', message: message as string });
        });
      },
    });
  }, handleValidationErrors);

  const handleTabChange = async (_: unknown, value: string) => {
    const nextTab = tabs.find((tab) => tab.value === value);
    if (nextTab?.disabled) return;

    setCurrentTab(value);
  };

  const handleModeration = (action: 'approve' | 'reject' | 'to_pending') => {
    const serviceFeeValue = methods.getValues('service_fee');

    router.post(
        route('projects.moderate', project.ulid),
        {
          action,
          comment: moderationComment || null,
          service_fee: serviceFeeValue === '' ? null : Number(serviceFeeValue),
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

  const serviceFeeError = methods.formState.errors.service_fee?.message;

  const serviceFeeControl =
      canModerate && isAdminView ? (
          <ServiceFeeField __={__} control={methods.control} error={serviceFeeError} />
      ) : null;

  return (
      <>
        <title>{metadata.title}</title>
        <DashboardLayout>
          <DashboardContent maxWidth={false}>
            <CustomBreadcrumbs
                heading={project.name}
                links={breadcrumbLinks}
                action={managementAction}
                sx={{ mb: { xs: 3, md: 5 } }}
            />

            <ModerationActions
                canModerate={canModerate}
                status={project.status}
                moderationComment={moderationComment}
                onChangeComment={setModerationComment}
                onModerate={handleModeration}
                serviceFeeControl={serviceFeeControl}
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
                            tokenNetworks={normalizedTokenNetworks}
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
                        <FeesSection
                            __={__}
                            integrationAvailable={integrationAvailable}
                            serviceFee={project.service_fee}
                        />
                    )}

                    {currentTab === 'history' && showModerationHistory && (
                        <HistorySection
                            __={__}
                            moderationLogs={project.moderation_logs ?? []}
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

            {currentTab === 'history' && showModerationHistory && revokedKeys.length > 0 && (
                <Box sx={{ mt: 3 }}>
                  <RevokedKeysAccordion __={__} revokedKeys={revokedKeys} />
                </Box>
            )}

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
                      // 🔴 ВАЖНО: привязали ref к инпуту
                      inputRef={secretInputRef}
                      InputProps={{
                        readOnly: true,
                        endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                  color={isSecretCopied ? 'success' : 'default'}
                                  onClick={handleCopySecret}
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

import { useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { router, usePage } from '@inertiajs/react';

import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Divider from '@mui/material/Divider';
import Stepper from '@mui/material/Stepper';

import { CONFIG } from 'src/global-config';
import { DashboardContent, DashboardLayout } from 'src/layouts/dashboard';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Form } from 'src/components/hook-form';
import { useLang } from 'src/hooks/useLang';
import { route } from 'src/routes/route';
import type { PageProps } from '@inertiajs/core';
import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { CurrenciesStep, DetailsStep, LinksStep } from '../components/form';
import { projectSchema, type ProjectFormValues } from './schema';
import { type TokenNetwork } from '../types';
import { buildCallbackUrls, isValidHttpUrl, normalizeUrl } from '../utils';

// ----------------------------------------------------------------------

const metadata = { title: `Create project | Dashboard - ${CONFIG.appName}` };

type PlatformValue = 'website' | 'telegram_bot' | 'vk_bot' | 'other';

const platformLabels: Record<PlatformValue, string> = {
  website: 'pages/projects.form.project_url_website',
  telegram_bot: 'pages/projects.form.project_url_telegram',
  vk_bot: 'pages/projects.form.project_url_vk',
  other: 'pages/projects.form.project_url_other',
};

export default function CreateProject({ tokenNetworks }: { tokenNetworks: TokenNetwork[] }) {
  const { __ } = useLang();
  const { props } = usePage<PageProps>();
  const csrfToken = props.csrf_token;
  const [activeStep, setActiveStep] = useState(0);

  const Schema = useMemo(() => projectSchema(__), [__]);

  const methods = useForm<ProjectFormValues>({
    resolver: zodResolver(Schema),
    defaultValues: {
      name: '',
      activity_type: '',
      description: '',
      platform: '' as ProjectFormValues['platform'],
      project_url: '',
      success_url: '',
      fail_url: '',
      notify_url: '',
      logo: null,
      token_network_ids: [],
      accept: false,
      side_commission: 'client',
      side_commission_cc: 'client',
      auto_confirm_partial_by_amount: '',
      auto_confirm_partial_by_percent: '',
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

  const platformValue = watch('platform') as PlatformValue | '';
  const platform = platformValue || 'website';
  const projectUrl = watch('project_url');
  const projectUrlLabelKey = platformValue ? platformLabels[platform] : 'pages/projects.form.project_url';
  const projectUrlLabel = __(projectUrlLabelKey);
  const projectUrlPlaceholder = platformValue === 'telegram_bot' ? '@username' : 'https://';
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

  const steps = useMemo(
    () => [
      {
        key: 'details',
        label: __('pages/projects.steps.details'),
        fields: ['name', 'activity_type', 'description'] as const,
      },
      {
        key: 'links',
        label: __('pages/projects.steps.links'),
        fields: ['platform', 'project_url', 'success_url', 'fail_url', 'notify_url', 'logo'] as const,
      },
      {
        key: 'currencies',
        label: __('pages/projects.steps.currencies'),
        fields: ['token_network_ids', 'accept'] as const,
      },
    ],
    [__]
  );

  const onSubmit = handleSubmit((data) => {
    const logo = data.logo instanceof File ? data.logo.name : data.logo || '';

    const payload = {
      _token: csrfToken,
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

    router.post(route('projects.store'), payload, {
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

  const handleNext = async () => {
    const currentFields = steps[activeStep]?.fields ?? [];
    const isValid = await trigger(currentFields as unknown as string[]);

    if (isValid) {
      setActiveStep((prev) => Math.min(prev + 1, steps.length - 1));
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => Math.max(prev - 1, 0));
  };

  const isLastStep = activeStep === steps.length - 1;

  return (
    <>
      <title>{metadata.title}</title>
      <DashboardLayout>
        <DashboardContent maxWidth={false}>
          <CustomBreadcrumbs
            heading={__('pages/projects.breadcrumbs.create')}
            links={[
              { name: __('pages/projects.breadcrumbs.dashboard'), href: route('dashboard', undefined, false) },
              { name: __('pages/projects.breadcrumbs.list'), href: route('projects.index', undefined, false) },
              { name: __('pages/projects.breadcrumbs.create') },
            ]}
            sx={{ mb: { xs: 3, md: 5 } }}
          />

          <Form methods={methods} onSubmit={onSubmit}>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12 }}>
                <Card sx={{ p: { xs: 2, md: 3 } }}>
                  <Stack spacing={3}>
                    <Stepper activeStep={activeStep} alternativeLabel>
                      {steps.map((step) => (
                        <Step key={step.key}>
                          <StepLabel>{step.label}</StepLabel>
                        </Step>
                      ))}
                    </Stepper>

                    <Divider sx={{ my: 1 }} />

                    {activeStep === 0 && (
                      <DetailsStep
                        title={steps[0].label}
                        namePlaceholder={__('pages/projects.form.name')}
                        activityPlaceholder={__('pages/projects.form.activity_type')}
                      />
                    )}

                    {activeStep === 1 && (
                      <LinksStep
                        title={steps[1].label}
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
                      />
                    )}

                    {activeStep === 2 && (
                      <CurrenciesStep
                        title={steps[2].label}
                        tokenNetworks={tokenNetworks}
                        control={methods.control}
                        acceptLabel={__('pages/projects.form.accept_terms')}
                      />
                    )}

                    <Divider />

                    <Stack direction="row" spacing={2} justifyContent="space-between" flexWrap="wrap">
                      <Button variant="outlined" color="inherit" href={route('projects.index')}>
                        {__('pages/projects.actions.cancel')}
                      </Button>

                      <Stack direction="row" spacing={2}>
                        <Button variant="text" color="inherit" onClick={handleBack} disabled={activeStep === 0}>
                          {__('pages/projects.actions.previous')}
                        </Button>
                        {!isLastStep && (
                          <Button variant="contained" color="primary" onClick={handleNext}>
                            {__('pages/projects.actions.next')}
                          </Button>
                        )}
                        {isLastStep && (
                          <Button
                            variant="contained"
                            type="submit"
                            startIcon={<Iconify icon="solar:check-circle-bold" />}
                            disabled={isSubmitting}
                          >
                            {__('pages/projects.actions.save')}
                          </Button>
                        )}
                      </Stack>
                    </Stack>
                  </Stack>
                </Card>
              </Grid>
            </Grid>
          </Form>
        </DashboardContent>
      </DashboardLayout>
    </>
  );
}

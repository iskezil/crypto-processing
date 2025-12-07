import { useMemo, useState, type ReactNode } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { router, usePage } from '@inertiajs/react';

import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import Stepper from '@mui/material/Stepper';
import Typography from '@mui/material/Typography';
import FormHelperText from '@mui/material/FormHelperText';

import { CONFIG } from 'src/global-config';
import { DashboardContent, DashboardLayout } from 'src/layouts/dashboard';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Field, Form } from 'src/components/hook-form';
import { useLang } from 'src/hooks/useLang';
import { route } from 'src/routes/route';
import type { PageProps } from '@inertiajs/core';
import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { TokenNetworkAvatar } from 'src/pages/dashboard/projects/components';

// ----------------------------------------------------------------------

type TokenNetwork = {
  id: number;
  full_code: string;
  stable_coin: boolean;
  token?: { name: string; code: string; icon_path?: string; icon_url?: string };
  network?: { name: string; code: string; icon_path?: string; icon_url?: string; network?: string };
};

type FormValues = {
  name: string;
  activity_type: string;
  description: string;
  platform: 'website' | 'telegram_bot' | 'vk_bot' | 'other';
  project_url: string;
  success_url: string;
  fail_url: string;
  notify_url: string;
  logo: string | File | null;
  test_mode: boolean;
  token_network_ids: number[];
  accept: boolean;
};

const metadata = { title: `Create project | Dashboard - ${CONFIG.appName}` };

const platformLabels: Record<FormValues['platform'], string> = {
  website: 'pages/projects.form.project_url_website',
  telegram_bot: 'pages/projects.form.project_url_telegram',
  vk_bot: 'pages/projects.form.project_url_vk',
  other: 'pages/projects.form.project_url_other',
};

type FormRowProps = {
  title: string;
  description: string;
  children: ReactNode;
};

function FormRow({ title, description, children }: FormRowProps) {
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

export default function CreateProject({ tokenNetworks }: { tokenNetworks: TokenNetwork[] }) {
  const { __ } = useLang();
  const { props } = usePage<PageProps>();
  const csrfToken = props.csrf_token;
  const [activeStep, setActiveStep] = useState(0);

  const Schema = useMemo(
    () =>
      z.object({
        name: z.string().min(1, __('validation.required', { attribute: __('validation.attributes.name') })),
        activity_type: z
          .string()
          .min(1, __('validation.required', { attribute: __('pages/projects.form.activity_type') })),
        description: z.string().optional().default(''),
        platform: z.enum(['website', 'telegram_bot', 'vk_bot', 'other']),
        project_url: z.string().optional().default(''),
        success_url: z.string().optional().default(''),
        fail_url: z.string().optional().default(''),
        notify_url: z.string().optional().default(''),
        logo: z.union([z.instanceof(File), z.string(), z.null()]).optional().nullable(),
        test_mode: z.boolean(),
        token_network_ids: z.array(z.number()).min(1, __('pages/projects.validation.tokens')),
        accept: z.literal(true, { errorMap: () => ({ message: __('pages/projects.validation.accept') }) }),
      }),
    [__]
  );

  const methods = useForm<FormValues>({
    resolver: zodResolver(Schema),
    defaultValues: {
      name: '',
      activity_type: '',
      description: '',
      platform: 'website',
      project_url: '',
      success_url: '',
      fail_url: '',
      notify_url: '',
      logo: null,
      test_mode: false,
      token_network_ids: [],
      accept: false,
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
        fields: ['token_network_ids', 'test_mode', 'accept'] as const,
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
    };

    router.post(route('projects.store'), payload, {
      onSuccess: () => {
        toast.success(__('pages/projects.notifications.sent_to_moderation'));
      },
      onError: (errors) => {
        Object.entries(errors).forEach(([field, message]) => {
          setError(field as keyof FormValues, { type: 'server', message: message as string });
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
        <DashboardContent maxWidth="xl">
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
              <Grid size={{ xs: 12, md: 10 }}>
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
                      <Stack spacing={3}>
                        <Typography variant="h6">{steps[0].label}</Typography>

                        <FormRow
                          title="Название проекта"
                          description="Название проекта будет указываться на странице оплаты, в чеках об оплате у ваших покупателей, а также в вашем личном кабинете."
                        >
                          <Field.Text name="name" placeholder={__('pages/projects.form.name')} />
                        </FormRow>

                        <FormRow
                          title="Вид деятельности"
                          description="Наиболее подходящее обозначение вашей деятельности (интернет-магазин / онлайн-школа / сервис или платформа / цифровые товары / Telegram-бот и прочее)."
                        >
                          <Field.Text name="activity_type" placeholder={__('pages/projects.form.activity_type')} />
                        </FormRow>

                        <FormRow
                          title="Описание проекта"
                          description="Расскажите кратко и понятно о вашем проекте: укажите продукт или услугу, целевую аудиторию и формат продажи."
                        >
                          <Field.Text name="description" multiline minRows={4} />
                        </FormRow>
                      </Stack>
                    )}

                    {activeStep === 1 && (
                      <Stack spacing={3}>
                        <Typography variant="h6">{steps[1].label}</Typography>

                        <FormRow
                          title="Платформа проекта"
                          description="Выбирите платформу проекта."
                        >
                          <Field.Select name="platform">
                            <MenuItem value="website">{__('pages/projects.platforms.website')}</MenuItem>
                            <MenuItem value="telegram_bot">{__('pages/projects.platforms.telegram_bot')}</MenuItem>
                            <MenuItem value="vk_bot">{__('pages/projects.platforms.vk_bot')}</MenuItem>
                            <MenuItem value="other">{__('pages/projects.platforms.other')}</MenuItem>
                          </Field.Select>
                        </FormRow>

                        <FormRow
                          title={projectUrlLabel}
                          description="Ссылка на сайт, на котором вы хотите принимать платежи. Для корректности интеграции, пожалуйста, указывайте верные данные."
                        >
                          <Field.Text name="project_url" placeholder="https://" />
                        </FormRow>

                        <FormRow
                          title="Успешный URL:"
                          description="Cсылка на страницу, на которую пользователь будет попадать после успешной оплаты."
                        >
                          <Field.Text name="success_url" placeholder="https://" />
                        </FormRow>

                        <FormRow
                          title="Неудачный URL:"
                          description="Cсылка на страницу, на которую пользователь будет попадать после в случае неуспешной оплаты."
                        >
                          <Field.Text name="fail_url" placeholder="https://" />
                        </FormRow>

                        <FormRow
                          title="URL для уведомлений"
                          description="Cсылка на страницу в вашей системе, на который будут приходить уведомления о событиях. Уведомления используются при взаимодействии по API — они позволяют автоматически отслеживать и передавать вашему сайту (или сервису) статусы операций. Если вы хотите принимать платежи с помощью HTML-виджета, данное поле заполнять не нужно."
                        >
                          <Field.Text name="notify_url" placeholder="https://" />
                        </FormRow>

                        <FormRow
                          title="Логотип на платежной странице"
                          description="Допустимые форматы: png, jpeg. Максимальный вес файла: 2МБ. Соотношение сторон: 3x1"
                        >
                          <Field.Upload
                            name="logo"
                            placeholder={
                              <Stack spacing={1} alignItems="center">
                                <Iconify icon="eva:cloud-upload-fill" width={32} />
                                <Typography variant="body1">{__('pages/projects.helpers.logo_title')}</Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {__('pages/projects.helpers.logo_description')}
                                </Typography>
                              </Stack>
                            }
                            slotProps={{
                              wrapper: { sx: { maxWidth: 520, alignSelf: 'stretch' } },
                            }}
                          />
                        </FormRow>
                      </Stack>
                    )}

                    {activeStep === 2 && (
                      <Stack spacing={2.5}>
                        <Typography variant="h6">{steps[2].label}</Typography>
                        <Controller
                          name="token_network_ids"
                          control={methods.control}
                          render={({ field, fieldState: { error } }) => (
                            <Stack spacing={1.5}>
                              <Grid container spacing={2}>
                                {tokenNetworks.map((network) => {
                                  const selected = field.value.includes(network.id);
                                  const tokenIcon = network.token?.icon_url;
                                  const networkIcon = network.network?.icon_url;
                                  const networkLabel =
                                    network.network?.network ||
                                    network.network?.name ||
                                    network.network?.code ||
                                    network.full_code;

                                  return (
                                    <Grid key={network.id} size={{ xs: 12, sm: 6, md: 4 }}>
                                      <Paper
                                        variant="outlined"
                                        onClick={() =>
                                          field.onChange(
                                            selected
                                              ? field.value.filter((value: number) => value !== network.id)
                                              : [...field.value, network.id]
                                          )
                                        }
                                        sx={{
                                          p: 2,
                                          gap: 1.5,
                                          display: 'flex',
                                          alignItems: 'center',
                                          cursor: 'pointer',
                                          height: '100%',
                                          borderColor: selected ? 'primary.main' : 'divider',
                                          bgcolor: selected ? 'action.selected' : 'background.default',
                                          transition: (theme) => theme.transitions.create(['box-shadow', 'border-color']),
                                          '&:hover': { boxShadow: (theme) => theme.customShadows?.z8 },
                                        }}
                                      >
                                        <TokenNetworkAvatar
                                          tokenIcon={tokenIcon}
                                          networkIcon={networkIcon}
                                          name={network.token?.name || network.network?.name}
                                        />
                                        <Stack spacing={0.5} sx={{ flexGrow: 1 }}>
                                          <Typography variant="subtitle2">
                                            {network.token?.name || network.network?.name || network.full_code}
                                          </Typography>
                                          <Typography variant="body2" color="text.secondary">
                                            {networkLabel}
                                          </Typography>
                                        </Stack>
                                        <Iconify
                                          icon={selected ? 'solar:toggle-on-bold' : 'solar:toggle-off-bold'}
                                          width={32}
                                          color={selected ? 'var(--mui-palette-primary-main)' : undefined}
                                        />
                                      </Paper>
                                    </Grid>
                                  );
                                })}
                              </Grid>
                              <FormHelperText error={!!error}>{error?.message}</FormHelperText>
                            </Stack>
                          )}
                        />

                        <Field.Switch name="test_mode" label={__('pages/projects.form.test_mode')} />
                        <Field.Checkbox name="accept" label={__('pages/projects.form.accept_terms')} />
                      </Stack>
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

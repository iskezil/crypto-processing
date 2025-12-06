import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { router, usePage } from '@inertiajs/react';

import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';

import { CONFIG } from 'src/global-config';
import { DashboardContent, DashboardLayout } from 'src/layouts/dashboard';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Field, Form } from 'src/components/hook-form';
import { useLang } from 'src/hooks/useLang';
import { paths } from 'src/routes/paths';
import { route } from 'src/routes/route';
import type { PageProps } from '@inertiajs/core';
import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type TokenNetwork = {
  id: number;
  full_code: string;
  stable_coin: boolean;
  token?: { name: string; code: string; icon_path?: string };
  network?: { name: string; code: string; icon_path?: string };
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
  logo: string;
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

export default function CreateProject({ tokenNetworks }: { tokenNetworks: TokenNetwork[] }) {
  const { __ } = useLang();
  const { props } = usePage<PageProps>();
  const csrfToken = props.csrf_token;

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
        logo: z.string().optional().default(''),
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
      logo: '',
      test_mode: false,
      token_network_ids: [],
      accept: false,
    },
  });

  const {
    handleSubmit,
    watch,
    setError,
    formState: { isSubmitting },
  } = methods;

  const platform = watch('platform');
  const projectUrlLabel = __(platformLabels[platform]);

  const tokenOptions = tokenNetworks.map((network) => ({
    value: network.id,
    label: `${network.token?.code ?? ''} ${network.network?.code ? `(${network.network.code})` : ''}`.trim() ||
      network.full_code,
  }));

  const onSubmit = handleSubmit((data) => {
    const payload = {
      _token: csrfToken,
      ...data,
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

  return (
    <>
      <title>{metadata.title}</title>
      <DashboardLayout>
        <DashboardContent maxWidth="xl">
          <CustomBreadcrumbs
            heading={__('pages/projects.breadcrumbs.create')}
            links={[
              { name: __('pages/projects.breadcrumbs.dashboard'), href: paths.dashboard.root },
              { name: __('pages/projects.breadcrumbs.list'), href: route('projects.index') },
              { name: __('pages/projects.breadcrumbs.create') },
            ]}
            sx={{ mb: { xs: 3, md: 5 } }}
          />

          <Form methods={methods} onSubmit={onSubmit}>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 8 }}>
                <Card sx={{ p: 3 }}>
                  <Stack spacing={3}>
                    <Field.Text name="name" label={__('pages/projects.form.name')} />
                    <Field.Text name="activity_type" label={__('pages/projects.form.activity_type')} />
                    <Field.Text
                      name="description"
                      label={__('pages/projects.form.description')}
                      multiline
                      rows={4}
                    />
                    <Field.Select name="platform" label={__('pages/projects.form.platform')}>
                      <MenuItem value="website">{__('pages/projects.platforms.website')}</MenuItem>
                      <MenuItem value="telegram_bot">{__('pages/projects.platforms.telegram_bot')}</MenuItem>
                      <MenuItem value="vk_bot">{__('pages/projects.platforms.vk_bot')}</MenuItem>
                      <MenuItem value="other">{__('pages/projects.platforms.other')}</MenuItem>
                    </Field.Select>
                    <Field.Text name="project_url" label={projectUrlLabel} />
                    <Field.Text name="success_url" label={__('pages/projects.form.success_url')} />
                    <Field.Text name="fail_url" label={__('pages/projects.form.fail_url')} />
                    <Field.Text name="notify_url" label={__('pages/projects.form.notify_url')} />
                    <Field.Text name="logo" label={__('pages/projects.form.logo')} />
                    <Field.MultiSelect
                      name="token_network_ids"
                      label={__('pages/projects.form.token_networks')}
                      options={tokenOptions}
                    />
                    <Field.Switch name="test_mode" label={__('pages/projects.form.test_mode')} />
                    <Field.Checkbox name="accept" label={__('pages/projects.form.accept_terms')} />
                    <Stack direction="row" spacing={2} justifyContent="flex-end">
                      <Button variant="outlined" color="inherit" href={route('projects.index')}>
                        {__('pages/projects.actions.cancel')}
                      </Button>
                      <Button variant="contained" type="submit" startIcon={<Iconify icon="solar:check-circle-bold" />} disabled={isSubmitting}>
                        {__('pages/projects.actions.save')}
                      </Button>
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

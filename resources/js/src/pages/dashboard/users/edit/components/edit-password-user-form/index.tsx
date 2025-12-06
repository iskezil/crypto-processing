import { router, usePage } from '@inertiajs/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import { IconButton, InputAdornment } from '@mui/material';

import { Field, Form } from 'src/components/hook-form';
import { toast } from 'src/components/snackbar';
import { useLang } from 'src/hooks/useLang';
import type { PageProps } from '@inertiajs/core';
import { useBoolean } from 'minimal-shared/hooks';
import { Iconify } from '@/components/iconify';

// ----------------------------------------------------------------------

type User = { id: number };

type FormValues = {
  current_password: string;
  password: string;
  password_confirmation: string;
};

interface Props {
  currentUser: User;
}

export function EditPasswordUserForm({ currentUser }: Props) {
  const { __ } = useLang();
  const showPassword = useBoolean();
  const { props } = usePage<PageProps>();
  const csrfToken = props.csrf_token;

  const Schema = z
    .object({
      current_password: z.string().min(1, {
        message: __('validation.required', {
          attribute: __('validation.attributes.current_password'),
        }),
      }),
      password: z.string().min(6, {
        message: __('validation.min.string', {
          attribute: __('validation.attributes.password'),
          min: 6,
        }),
      }),
      password_confirmation: z.string().min(1, {
        message: __('validation.required', {
          attribute: __('validation.attributes.password_confirmation'),
        }),
      }),
    })
    .refine((data) => data.password === data.password_confirmation, {
      path: ['password_confirmation'],
      message: __('validation.confirmed'),
    });

  const methods = useForm<FormValues>({
    resolver: zodResolver(Schema),
    mode: 'onChange',
    defaultValues: { current_password: '', password: '', password_confirmation: '' },
  });

  const {
    handleSubmit,
    setError,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit((data) => {
    const payload = new FormData();
    payload.append('_token', csrfToken);
    payload.append('_method', 'PATCH');
    payload.append('current_password', data.current_password);
    payload.append('password', data.password);
    payload.append('password_confirmation', data.password_confirmation);

    router.post(route('users.update', currentUser.id), payload, {
      onSuccess: () => {
        toast.success(__('pages/users.update_success'));
        methods.reset();
      },
      onError: (errors) => {
        Object.entries(errors).forEach(([field, message]) => {
          setError(field as keyof FormValues, { type: 'server', message: message as string });
        });
        toast.error(__('pages/users.update_error'));
      },
    });
  });

  return (
    <Form methods={methods} onSubmit={onSubmit}>
      <Card sx={{ p: 3 }}>
        <Stack spacing={3}>
          <Field.Text
            name="current_password"
            type={showPassword.value ? 'text' : 'password'}
            label={__('pages/users.form.current_password')}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={showPassword.onToggle} edge="end">
                      <Iconify
                        icon={showPassword.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'}
                      />
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />

          <Field.Text
            name="password"
            type={showPassword.value ? 'text' : 'password'}
            label={__('pages/users.form.password')}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={showPassword.onToggle} edge="end">
                      <Iconify
                        icon={showPassword.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'}
                      />
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />

          <Field.Text
            name="password_confirmation"
            type={showPassword.value ? 'text' : 'password'}
            label={__('validation.attributes.password_confirmation')}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={showPassword.onToggle} edge="end">
                      <Iconify
                        icon={showPassword.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'}
                      />
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />

          <Button type="submit" variant="contained" loading={isSubmitting} sx={{ ml: 'auto' }}>
            {__('pages/users.form.submit_update')}
          </Button>
        </Stack>
      </Card>
    </Form>
  );
}

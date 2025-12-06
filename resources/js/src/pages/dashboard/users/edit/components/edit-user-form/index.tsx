import { router, usePage } from '@inertiajs/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useState } from 'react';

import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import { Field, Form } from 'src/components/hook-form';
import { toast } from 'src/components/snackbar';
import { useLang } from 'src/hooks/useLang';
import { route } from 'src/routes/route';
import type { PageProps } from '@inertiajs/core';
import { Label, LabelColor } from '@/components/label';
import Box from '@mui/material/Box';
import { ConfirmDialog } from 'src/components/custom-dialog/confirm-dialog';
import { useAuthz } from 'src/lib/authz';

// ----------------------------------------------------------------------

type Role = { id: number; name: string };

type User = {
  id: number;
  name: string;
  email: string;
  avatar: string | null;
  status: 'active' | 'pending' | 'banned';
  roles: number[];
  email_verified_at: string | null;
};

type FormValues = {
  name: string;
  email: string;
  roles: string[];
  avatar: File | string | null;
  banned: boolean;
  email_verified: boolean;
};

interface Props {
  roles: Role[];
  currentUser: User;
}

export function EditUserForm({ roles, currentUser }: Props) {
  const { __ } = useLang();
  const { props } = usePage<PageProps>();
  const csrfToken = props.csrf_token;
  const authUserId = (props.auth.user as any)?.id as number | undefined;
  const { can } = useAuthz();
  const canDelete = can('USERS_DELETE');
  const [openDelete, setOpenDelete] = useState(false);

  const Schema = z.object({
    name: z.string().min(1, {
      message: __('validation.required', {
        attribute: __('validation.attributes.name'),
      }),
    }),
    email: z.string().email({
      message: __('validation.email', {
        attribute: __('validation.attributes.email'),
      }),
    }),
    roles: z.array(z.string()).min(1, {
      message: __('validation.required', {
        attribute: __('validation.attributes.roles'),
      }),
    }),
    avatar: z.union([z.instanceof(File), z.string(), z.null()]).nullable(),
    banned: z.boolean(),
    email_verified: z.boolean(),
  });

  const methods = useForm<FormValues>({
    resolver: zodResolver(Schema),
    mode: 'onChange',
    defaultValues: {
      name: currentUser.name,
      email: currentUser.email,
      roles: currentUser.roles.map(String),
      avatar: currentUser.avatar ?? null,
      banned: currentUser.status === 'banned',
      email_verified: !!currentUser.email_verified_at,
    },
  });

  const {
    handleSubmit,
    setError,
    watch,
    formState: { isSubmitting },
  } = methods;

  const roleOptions = roles.map((r) => ({
    label: __(`pages/users.roles.${r.name.toLowerCase()}`),
    value: String(r.id),
  }));

  const watchBanned = watch('banned');
  const currentStatus: 'active' | 'pending' | 'banned' = watchBanned
    ? 'banned'
    : currentUser.status === 'pending'
      ? 'pending'
      : 'active';

  const statusColor: LabelColor = (
    { active: 'success', pending: 'warning', banned: 'error' } as const
  )[currentStatus];

  const onSubmit = handleSubmit((data) => {
    const status = data.banned ? 'banned' : currentUser.status === 'pending' ? 'pending' : 'active';
    const newRoles = data.roles.map(Number).sort();
    const currentRoles = [...currentUser.roles].sort();
    const rolesChanged =
      newRoles.length !== currentRoles.length || newRoles.some((r, idx) => r !== currentRoles[idx]);
    const avatarChanged = data.avatar instanceof File;
    const emailVerifiedChanged = data.email_verified !== !!currentUser.email_verified_at;
    const hasChanges =
      data.name !== currentUser.name ||
      data.email !== currentUser.email ||
      status !== currentUser.status ||
      rolesChanged ||
      avatarChanged ||
      emailVerifiedChanged;

    if (!hasChanges) {
      toast.error(__('pages/users.no_changes'));
      return;
    }

    if (currentUser.id === authUserId && rolesChanged) {
      toast.error(__('pages/users.self_role_error'));
      return;
    }

    const payload = new FormData();
    payload.append('_token', csrfToken);
    payload.append('_method', 'PATCH');
    payload.append('name', data.name);
    payload.append('email', data.email);
    newRoles.forEach((role: number) => payload.append('roles[]', String(role)));
    payload.append('status', status);
    payload.append('email_verified_at', data.email_verified ? new Date().toISOString() : '');
    if (data.avatar instanceof File) {
      payload.append('avatar', data.avatar);
    }

    router.post(route('users.update', currentUser.id), payload, {
      onSuccess: () => {
        toast.success(__('pages/users.update_success'));
        router.reload();
      },
      onError: (errors) => {
        Object.entries(errors).forEach(([field, message]) => {
          setError(field as keyof FormValues, { type: 'server', message: message as string });
        });
        toast.error(
          (errors as Record<string, string>).roles ?? __('pages/users.update_error')
        );
      },
    });
  });

  const handleDelete = () => {
    if (currentUser.id === authUserId) {
      toast.error(__('pages/users.self_delete_error'));
      setOpenDelete(false);
      return;
    }
    router.delete(route('users.destroy', currentUser.id), {
      data: { _token: csrfToken },
      onSuccess: () => {
        toast.success(__('pages/users.delete_success'));
        setOpenDelete(false);
        router.visit(route('users.index'));
      },
      onError: (errors: Record<string, string>) => {
        toast.error(errors.user ?? __('pages/users.delete_error'));
        setOpenDelete(false);
      },
    });
  };

  return (
    <>
      <Form methods={methods} onSubmit={onSubmit}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card sx={{ pt: 10, pb: 5, px: 3 }}>
              <Label color={statusColor} sx={{ position: 'absolute', top: 24, right: 24 }}>
                {__(`pages/users.statuses.${currentStatus}`)}
              </Label>
              <Stack spacing={3} alignItems="center">
                <Box sx={{ mb: 5 }}>
                  <Field.UploadAvatar
                    name="avatar"
                    accept={{ 'image/jpeg': [], 'image/png': [], 'image/gif': [] }}
                    maxSize={3145728}
                    helperText={
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                          mt: 3,
                          mx: 'auto',
                          display: 'block',
                          textAlign: 'center',
                          color: 'text.disabled',
                        }}
                      >
                        {__('pages/users.form.avatar_helper')}
                      </Typography>
                    }
                  />
                </Box>

                <Field.Switch
                  name="banned"
                  label={__('pages/users.form.banned')}
                  helperText={__('pages/users.form.banned_caption')}
                  slotProps={{
                    wrapper: { sx: { width: 1 } },
                    helperText: { sx: { textAlign: 'left' } },
                  }}
                />
                <Field.Switch
                  name="email_verified"
                  label={__('pages/users.form.email_verified')}
                  helperText={__('pages/users.form.email_verified_caption')}
                  slotProps={{
                    wrapper: { sx: { width: 1 } },
                    helperText: { sx: { textAlign: 'left' } },
                  }}
                />
                {canDelete && (
                  <Button
                    color="error"
                    variant="soft"
                    sx={{ mt: 1, alignSelf: 'stretch' }}
                    onClick={() => setOpenDelete(true)}
                  >
                    {__('pages/users.delete_user')}
                  </Button>
                )}
              </Stack>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 8 }}>
            <Card sx={{ p: 3 }}>
              <Stack spacing={3}>
                <Field.Text name="name" label={__('pages/users.form.name')} />
                <Field.Text name="email" label={__('pages/users.form.email')} />

                <Field.MultiSelect
                  name="roles"
                  label={__('pages/users.form.roles')}
                  options={roleOptions}
                  placeholder=""
                  checkbox
                />

                <Button
                  type="submit"
                  variant="contained"
                  loading={isSubmitting}
                  sx={{ ml: 'auto' }}
                >
                  {__('pages/users.form.submit_update')}
                </Button>
              </Stack>
            </Card>
          </Grid>
        </Grid>
      </Form>
      <ConfirmDialog
        open={openDelete}
        onClose={() => setOpenDelete(false)}
        title={__('pages/users.delete_user')}
        content={__('pages/users.delete_confirm')}
        action={
          <Button color="error" variant="contained" onClick={handleDelete}>
            {__('pages/users.delete')}
          </Button>
        }
      />
    </>
  );
}

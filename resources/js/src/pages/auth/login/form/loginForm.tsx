import { useBoolean } from 'minimal-shared/hooks';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';

import { Iconify } from 'src/components/iconify';

import { FormHead } from 'src/auth/components/form-head';
import { useForm } from '@inertiajs/react';
import TextField from '@mui/material/TextField';
import { Checkbox } from '@mui/material';
import Typography from '@mui/material/Typography';
import { useLang } from 'src/hooks/useLang';
import { useEffect } from 'react';
import { LoginProps } from 'src/pages/auth/login/types';
import Link from '@mui/material/Link';

export function LoginForm({ status, canResetPassword }: LoginProps) {
  const { __ } = useLang();

  const showPassword = useBoolean();

  const { data, setData, post, processing, errors, reset } = useForm<{
    email: string;
    password: string;
    remember: boolean;
  }>({
    email: '',
    password: '',
    remember: true,
  });

  useEffect(() => {
    return () => {
      reset('password');
    };
  }, []);

  const onSubmit = (e: { preventDefault: () => void }) => {
    e.preventDefault();

    post(route('login'));
  };

  const renderForm = () => (
    <Box sx={{ gap: 3, display: 'flex', flexDirection: 'column' }}>
      <TextField
        id="email"
        name="email"
        label={__('auth.form.login_title')}
        placeholder={__('auth.form.login_placeholder')}
        error={!!errors.email}
        helperText={errors.email}
        value={data.email}
        onChange={(e) => setData('email', e.target.value)}
        slotProps={{ inputLabel: { shrink: true } }}
      />

      <Box sx={{ gap: 1.5, display: 'flex', flexDirection: 'column' }}>
        {canResetPassword && (
          <Link href={route('password.request')} variant="subtitle2" sx={{ alignSelf: 'flex-end' }}>
            {__('auth.form.forgot_password')}
          </Link>
        )}

        <TextField
          name="password"
          label={__('auth.form.password_title')}
          placeholder={__('auth.form.password_placeholder')}
          error={!!errors.password}
          helperText={errors.password}
          value={data.password}
          type={showPassword.value ? 'text' : 'password'}
          onChange={(e) => setData('password', e.target.value)}
          slotProps={{
            inputLabel: { shrink: true },
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
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
        <Checkbox
          name="remember"
          checked={data.remember}
          onChange={(e) => setData('remember', e.target.checked)}
        />
        <Typography>{__('auth.form.remember_me')}</Typography>
      </Box>

      <Button
        fullWidth
        color="inherit"
        size="large"
        type="submit"
        variant="contained"
        loading={processing}
        loadingIndicator={__('auth.form.sign_in_process')}
      >
        {__('auth.form.sign_in')}
      </Button>
    </Box>
  );

  return (
    <>
      {status && <div className="mb-4 font-medium text-sm text-green-600">{status}</div>}
      <FormHead
        title={__('auth.form.title')}
        description={
          <>
            {__('auth.form.not_registered')}
            <Link href={route('register')} variant="subtitle2">
              {__('auth.form.create_account')}
            </Link>
          </>
        }
        sx={{ textAlign: { xs: 'center', md: 'left' } }}
      />
      <form onSubmit={onSubmit}>{renderForm()}</form>
    </>
  );
}

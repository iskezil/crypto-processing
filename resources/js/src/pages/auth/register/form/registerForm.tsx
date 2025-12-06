import { useBoolean } from 'minimal-shared/hooks';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';

import { Iconify } from 'src/components/iconify';

import { FormHead } from 'src/auth/components/form-head';
import { useForm } from '@inertiajs/react';
import TextField from '@mui/material/TextField';
import { useLang } from 'src/hooks/useLang';
import { useEffect } from 'react';
import Link from '@mui/material/Link';

export function RegisterForm() {
  const { __ } = useLang();

  const showPassword = useBoolean();

  const { data, setData, post, processing, errors, reset } = useForm<{
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
  }>({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
  });

  useEffect(() => {
    return () => {
      reset('password', 'password_confirmation');
    };
  }, []);

  const onSubmit = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    post(route('register'));
  };

  const renderForm = () => (
    <Box sx={{ gap: 3, display: 'flex', flexDirection: 'column' }}>
      <TextField
        id="name"
        name="name"
        label={__('register.form.nickname_title')}
        placeholder={__('register.form.nickname_placeholder')}
        autoComplete="off"
        error={!!errors.name}
        helperText={errors.name}
        value={data.name}
        onChange={(e) => setData('name', e.target.value)}
        slotProps={{ inputLabel: { shrink: true } }}
      />

      <TextField
        id="email"
        name="email"
        label={__('register.form.email_title')}
        placeholder={__('register.form.email_placeholder')}
        autoComplete="off"
        error={!!errors.email}
        helperText={errors.email}
        value={data.email}
        onChange={(e) => setData('email', e.target.value)}
        slotProps={{ inputLabel: { shrink: true } }}
      />

      <Box sx={{ gap: 1.5, display: 'flex', flexDirection: 'column' }}>
        <TextField
          name="password"
          label={__('register.form.password_title')}
          placeholder={__('register.form.password_placeholder')}
          autoComplete="off"
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
        <TextField
          name="password_confirmation"
          label={__('register.form.confirmation_password_title')}
          placeholder={__('register.form.confirmation_password_placeholder')}
          autoComplete="off"
          error={!!errors.password_confirmation}
          helperText={errors.password_confirmation}
          value={data.password_confirmation}
          type={showPassword.value ? 'text' : 'password'}
          onChange={(e) => setData('password_confirmation', e.target.value)}
        />
      </Box>

      <Button
        fullWidth
        color="inherit"
        size="large"
        type="submit"
        variant="contained"
        loading={processing}
        loadingIndicator={__('register.form.sign_in_process')}
      >
        {__('register.form.sign_up')}
      </Button>
    </Box>
  );

  return (
    <>
      <FormHead
        title={__('register.form.title')}
        description={
          <>
            {__('register.form.already_registered')}
            <Link href={route('register')} variant="subtitle2">
              {__('register.form.sign_in')}
            </Link>
          </>
        }
        sx={{ textAlign: { xs: 'center', md: 'left' } }}
      />
      <form onSubmit={onSubmit}>{renderForm()}</form>
    </>
  );
}

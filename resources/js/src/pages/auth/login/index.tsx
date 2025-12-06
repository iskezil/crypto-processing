import { CONFIG } from 'src/global-config';

import { AuthSplitLayout } from 'src/layouts/auth-split';
import { LoginProps } from 'src/pages/auth/login/types';
import { Head } from '@inertiajs/react';
import { LoginForm } from './form';

export default function Login({ status, canResetPassword }: LoginProps) {
  const metadata = { title: `Sign in | ${CONFIG.appName}` };
  return (
    <>
      <Head title={metadata.title} />
      <AuthSplitLayout
        slotProps={{
          section: { title: 'Hi, Welcome back' },
        }}
      >
        <LoginForm status={status} canResetPassword={canResetPassword} />
      </AuthSplitLayout>
    </>
  );
}

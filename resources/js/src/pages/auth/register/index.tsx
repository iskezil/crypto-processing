import { CONFIG } from 'src/global-config';

import { AuthSplitLayout } from 'src/layouts/auth-split';
import { Head } from '@inertiajs/react';
import { RegisterForm } from 'src/pages/auth/register/form';

export default function Register() {
  const metadata = { title: `Sign in | ${CONFIG.appName}` };
  return (
    <>
      <Head title={metadata.title} />
      <AuthSplitLayout
        slotProps={{
          section: { title: 'Hi, Welcome back' },
        }}
      >
        <RegisterForm />
      </AuthSplitLayout>
    </>
  );
}

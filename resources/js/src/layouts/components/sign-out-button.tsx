import Button from '@mui/material/Button';
import { router, usePage } from '@inertiajs/react';
import { useLang } from 'src/hooks/useLang';

export function SignOutButton() {
  const page = usePage();
  const { __ } = useLang();
  const handleLogout = async () => {
    try {
      router.post<{ _token: string }>(route('logout'), {
        _token: page.props.csrf_token as string,
      });
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  return (
    <Button fullWidth variant="soft" size="large" color="error" onClick={handleLogout}>
      {__('navbar.profile.logout')}
    </Button>
  );
}

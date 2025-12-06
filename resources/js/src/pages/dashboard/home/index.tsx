import { CONFIG } from 'src/global-config';
import { DashboardLayout } from 'src/layouts/dashboard';
import { BlankView } from 'src/sections/blank/view';
import { useLang } from 'src/hooks/useLang';

// ----------------------------------------------------------------------

const metadata = { title: `Page one | Dashboard - ${CONFIG.appName}` };

export default function Index() {
  const { __ } = useLang();
  return (
    <>
      <title>{metadata.title}</title>
      <DashboardLayout>
        <BlankView title={__('pages/home.title')} />
      </DashboardLayout>
    </>
  );
}

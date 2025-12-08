import { SimpleLayout } from 'src/layouts/simple';
import { PageNotFoundIllustration } from 'src/assets/illustrations';

import { ErrorPage } from 'src/components/error';
import { useLang } from 'src/hooks/useLang';

export default function NotFoundView() {
  const { __ } = useLang();

  return (
    <SimpleLayout
      slotProps={{
        content: { compact: true },
      }}
    >
      <ErrorPage
        title={__('errors.404.title')}
        description={__('errors.404.description')}
        illustration={PageNotFoundIllustration}
        actionHref="/"
        actionLabel={__('errors.go_home')}
      />
    </SimpleLayout>
  );
}

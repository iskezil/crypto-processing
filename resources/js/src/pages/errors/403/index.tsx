import { SimpleLayout } from 'src/layouts/simple';
import { ForbiddenIllustration } from 'src/assets/illustrations';

import { ErrorPage } from 'src/components/error';
import { useLang } from 'src/hooks/useLang';

export default function ForbiddenView() {
  const { __ } = useLang();

  return (
    <SimpleLayout
      slotProps={{
        content: { compact: true },
      }}
    >
      <ErrorPage
        title={__('errors.403.title')}
        description={__('errors.403.description')}
        illustration={ForbiddenIllustration}
        actionHref="/"
        actionLabel={__('errors.go_home')}
      />
    </SimpleLayout>
  );
}

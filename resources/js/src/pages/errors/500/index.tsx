import { SimpleLayout } from 'src/layouts/simple';
import { ServerErrorIllustration } from 'src/assets/illustrations';

import { ErrorPage } from 'src/components/error';
import { useLang } from 'src/hooks/useLang';

export default function InternalServerErrorView() {
  const { __ } = useLang();

  return (
    <SimpleLayout
      slotProps={{
        content: { compact: true },
      }}
    >
      <ErrorPage
        title={__('errors.500.title')}
        description={__('errors.500.description')}
        illustration={ServerErrorIllustration}
        actionHref="/"
        actionLabel={__('errors.go_home')}
      />
    </SimpleLayout>
  );
}

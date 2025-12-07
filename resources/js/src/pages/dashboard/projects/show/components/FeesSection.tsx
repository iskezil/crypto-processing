import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

type FeesSectionProps = {
  __: (key: string, options?: Record<string, unknown>) => string;
  integrationAvailable: boolean;
  serviceFee: number | null | undefined;
};

export function FeesSection({ __, integrationAvailable, serviceFee }: FeesSectionProps) {
  if (!integrationAvailable) {
    return <Alert severity="info">{__('pages/projects.integration.fees_placeholder')}</Alert>;
  }

  return (
    <Stack spacing={1}>
      <Typography variant="subtitle2">{__('pages/projects.integration.fees_title')}</Typography>
      <Typography variant="body2" color="text.secondary">
        {serviceFee != null
          ? __('pages/projects.integration.fees_value', { value: serviceFee })
          : __('pages/projects.integration.fees_not_set')}
      </Typography>
    </Stack>
  );
}

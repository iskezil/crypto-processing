import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';

import { Field } from 'src/components/hook-form';
import { Iconify } from 'src/components/iconify';
import { useLang } from 'src/hooks/useLang';

import { FormRow } from './FormRow';

type DetailsStepProps = {
  title: string;
  namePlaceholder: string;
  activityPlaceholder: string;
  paymentLink?: string;
  onCopyPaymentLink?: () => void;
  paymentLinkCopied?: boolean;
};

export function DetailsStep({
  title,
  namePlaceholder,
  activityPlaceholder,
  paymentLink,
  onCopyPaymentLink,
  paymentLinkCopied,
}: DetailsStepProps) {
  const { __ } = useLang();

  return (
    <Stack spacing={3}>
      <Typography variant="h6">{title}</Typography>

      {paymentLink && (
        <FormRow
          title={__('pages/projects.details_section.payment_link_title')}
          description={__('pages/projects.details_section.payment_link_description')}
        >
          <Field.Text
            name="name"
            value={paymentLink}
            placeholder={__('pages/projects.details_section.payment_link_placeholder')}
            InputProps={{
              readOnly: true,
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton color={paymentLinkCopied ? 'success' : 'default'} onClick={() => onCopyPaymentLink?.()}>
                    <Iconify icon="solar:copy-bold" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </FormRow>
      )}

      <FormRow
        title={__('pages/projects.details_section.name_title')}
        description={__('pages/projects.details_section.name_description')}
      >
        <Field.Text name="name" placeholder={namePlaceholder} autoFocus />
      </FormRow>

      <FormRow
        title={__('pages/projects.details_section.activity_title')}
        description={__('pages/projects.details_section.activity_description')}
      >
        <Field.Text name="activity_type" placeholder={activityPlaceholder} />
      </FormRow>

      <FormRow
        title={__('pages/projects.details_section.description_title')}
        description={__('pages/projects.details_section.description_description')}
      >
        <Field.Text name="description" multiline minRows={4} />
      </FormRow>
    </Stack>
  );
}

export default DetailsStep;

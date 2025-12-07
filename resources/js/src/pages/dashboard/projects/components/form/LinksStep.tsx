import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { Field } from 'src/components/hook-form';
import { Iconify } from 'src/components/iconify';
import { useLang } from 'src/hooks/useLang';

import { FormRow } from './FormRow';

type LinksStepProps = {
  title: string;
  projectUrlLabel: string;
  platformLabels: Record<'website' | 'telegram_bot' | 'vk_bot' | 'other', string>;
  projectUrlPlaceholder?: string;
  logoTitle: string;
  logoDescription: string;
  showCallbacks?: boolean;
};

export function LinksStep({
  title,
  projectUrlLabel,
  projectUrlPlaceholder,
  platformLabels,
  logoDescription,
  logoTitle,
  showCallbacks = true,
}: LinksStepProps) {
  const { __ } = useLang();
  const platformPlaceholder = __('pages/projects.links_section.platform_placeholder');

  return (
    <Stack spacing={3}>
      <Typography variant="h6">{title}</Typography>

      <FormRow
        title={__('pages/projects.links_section.platform_title')}
        description={__('pages/projects.links_section.platform_description')}
      >
        <Field.Select
          name="platform"
          label={platformPlaceholder}
          SelectProps={{
            displayEmpty: true,
            renderValue: (selected) => {
              if (!selected) {
                return <Typography color="text.disabled">{platformPlaceholder}</Typography>;
              }

              return platformLabels[selected as keyof typeof platformLabels] ?? selected;
            },
          }}
        >
          <MenuItem value="">{platformPlaceholder}</MenuItem>
          <MenuItem value="website">{platformLabels.website}</MenuItem>
          <MenuItem value="telegram_bot">{platformLabels.telegram_bot}</MenuItem>
          <MenuItem value="vk_bot">{platformLabels.vk_bot}</MenuItem>
          <MenuItem value="other">{platformLabels.other}</MenuItem>
        </Field.Select>
      </FormRow>

      <FormRow
        title={projectUrlLabel}
        description={__('pages/projects.links_section.project_url_description')}
      >
        <Field.Text name="project_url" placeholder={projectUrlPlaceholder || 'https://'} />
      </FormRow>

      {showCallbacks && (
        <>
          <FormRow
            title={__('pages/projects.links_section.success_title')}
            description={__('pages/projects.links_section.success_description')}
          >
            <Field.Text name="success_url" placeholder="https://" />
          </FormRow>

          <FormRow
            title={__('pages/projects.links_section.fail_title')}
            description={__('pages/projects.links_section.fail_description')}
          >
            <Field.Text name="fail_url" placeholder="https://" />
          </FormRow>

          <FormRow
            title={__('pages/projects.links_section.notify_title')}
            description={__('pages/projects.links_section.notify_description')}
          >
            <Field.Text name="notify_url" placeholder="https://" />
          </FormRow>
        </>
      )}

      <FormRow
        title={__('pages/projects.links_section.logo_title')}
        description={__('pages/projects.links_section.logo_description')}
      >
        <Field.Upload
          name="logo"
          placeholder={
            <Stack spacing={1} alignItems="center">
              <Iconify icon="eva:cloud-upload-fill" width={32} />
              <Typography variant="body1">{logoTitle}</Typography>
              <Typography variant="body2" color="text.secondary">{logoDescription}</Typography>
            </Stack>
          }
          slotProps={{
            wrapper: { sx: { maxWidth: 520, alignSelf: 'stretch' } },
          }}
        />
      </FormRow>
    </Stack>
  );
}

export default LinksStep;

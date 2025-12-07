import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { Field } from 'src/components/hook-form';
import { Iconify } from 'src/components/iconify';

import { FormRow } from './FormRow';

type LinksStepProps = {
  title: string;
  projectUrlLabel: string;
  platformLabels: Record<'website' | 'telegram_bot' | 'vk_bot' | 'other', string>;
  projectUrlPlaceholder?: string;
  logoTitle: string;
  logoDescription: string;
};

export function LinksStep({
  title,
  projectUrlLabel,
  projectUrlPlaceholder,
  platformLabels,
  logoDescription,
  logoTitle,
}: LinksStepProps) {
  return (
    <Stack spacing={3}>
      <Typography variant="h6">{title}</Typography>

      <FormRow title="Платформа проекта" description="Выбирите платформу проекта.">
        <Field.Select name="platform">
          <MenuItem value="website">{platformLabels.website}</MenuItem>
          <MenuItem value="telegram_bot">{platformLabels.telegram_bot}</MenuItem>
          <MenuItem value="vk_bot">{platformLabels.vk_bot}</MenuItem>
          <MenuItem value="other">{platformLabels.other}</MenuItem>
        </Field.Select>
      </FormRow>

      <FormRow
        title={projectUrlLabel}
        description="Ссылка на сайт, на котором вы хотите принимать платежи. Для корректности интеграции, пожалуйста, указывайте верные данные."
      >
        <Field.Text name="project_url" placeholder={projectUrlPlaceholder || 'https://'} />
      </FormRow>

      <FormRow
        title="Успешный URL:"
        description="Cсылка на страницу, на которую пользователь будет попадать после успешной оплаты."
      >
        <Field.Text name="success_url" placeholder="https://" />
      </FormRow>

      <FormRow
        title="Неудачный URL:"
        description="Cсылка на страницу, на которую пользователь будет попадать после в случае неуспешной оплаты."
      >
        <Field.Text name="fail_url" placeholder="https://" />
      </FormRow>

      <FormRow
        title="URL для уведомлений"
        description="Cсылка на страницу в вашей системе, на который будут приходить уведомления о событиях. Уведомления используются при взаимодействии по API — они позволяют автоматически отслеживать и передавать вашему сайту (или сервису) статусы операций. Если вы хотите принимать платежи с помощью HTML-виджета, данное поле заполнять не нужно."
      >
        <Field.Text name="notify_url" placeholder="https://" />
      </FormRow>

      <FormRow
        title="Логотип на платежной странице"
        description="Допустимые форматы: png, jpeg. Максимальный вес файла: 2МБ. Соотношение сторон: 3x1"
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

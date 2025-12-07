import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';

import { Field } from 'src/components/hook-form';
import { Iconify } from 'src/components/iconify';

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
  return (
    <Stack spacing={3}>
      <Typography variant="h6">{title}</Typography>

      {paymentLink && (
        <FormRow
          title="Cсылка на постоянную страницу оплаты:"
          description="Используйте ссылку для приема платежей без интеграции."
        >
          <TextField
            fullWidth
            value={paymentLink}
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
        title="Название проекта"
        description="Название проекта будет указываться на странице оплаты, в чеках об оплате у ваших покупателей, а также в вашем личном кабинете."
      >
          <TextField
              size={'small'}
              margin="dense"
              fullWidth
              variant="filled"
              label={namePlaceholder}
              value={''}
              onChange={() => {}}
          />
        {/*<Field.Text name="name" placeholder={namePlaceholder} />*/}
      </FormRow>

      <FormRow
        title="Вид деятельности"
        description="Наиболее подходящее обозначение вашей деятельности (интернет-магазин / онлайн-школа / сервис или платформа / цифровые товары / Telegram-бот и прочее)."
      >
        <Field.Text name="activity_type" placeholder={activityPlaceholder} />
      </FormRow>

      <FormRow
        title="Описание проекта"
        description="Расскажите кратко и понятно о вашем проекте: укажите продукт или услугу, целевую аудиторию и формат продажи."
      >
        <Field.Text name="description" multiline minRows={4} />
      </FormRow>
    </Stack>
  );
}

export default DetailsStep;

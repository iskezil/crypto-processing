import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { Field } from 'src/components/hook-form';

import { FormRow } from './FormRow';

type DetailsStepProps = {
  title: string;
  namePlaceholder: string;
  activityPlaceholder: string;
};

export function DetailsStep({ title, namePlaceholder, activityPlaceholder }: DetailsStepProps) {
  return (
    <Stack spacing={3}>
      <Typography variant="h6">{title}</Typography>

      <FormRow
        title="Название проекта"
        description="Название проекта будет указываться на странице оплаты, в чеках об оплате у ваших покупателей, а также в вашем личном кабинете."
      >
        <Field.Text name="name" placeholder={namePlaceholder} />
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

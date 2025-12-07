import FormHelperText from '@mui/material/FormHelperText';
import Slider from '@mui/material/Slider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Controller, type Control } from 'react-hook-form';

import type { ProjectFormValues } from '../../create/schema';

type ServiceFeeFieldProps = {
  __: (key: string, options?: Record<string, unknown>) => string;
  control: Control<ProjectFormValues>;
  error?: string;
};

export function ServiceFeeField({ __, control, error }: ServiceFeeFieldProps) {
  return (
    <Stack spacing={1.25} sx={{ width: '100%' }}>
      <Stack spacing={0.5}>
        <Typography variant="subtitle1">{__('pages/projects.fees.service_fee_title')}</Typography>
        <Typography variant="body2" color="text.secondary">
          {__('pages/projects.fees.service_fee_description')}
        </Typography>
      </Stack>

      <Controller
        control={control}
        name="service_fee"
        render={({ field }) => {
          const sliderValue = field.value === '' ? 1.5 : Number(field.value);

          return (
            <Stack spacing={1} sx={{ width: '100%' }}>
              <Slider
                value={sliderValue}
                min={0}
                max={10}
                step={0.1}
                marks
                onChange={(_, value) => {
                  const nextValue = Array.isArray(value) ? value[0] : value;
                  field.onChange(String(nextValue));
                }}
                valueLabelDisplay="on"
              />

              {error && <FormHelperText error>{error}</FormHelperText>}
            </Stack>
          );
        }}
      />
    </Stack>
  );
}

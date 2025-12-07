import type { ChangeEvent } from 'react';

import Alert from '@mui/material/Alert';
import InputAdornment from '@mui/material/InputAdornment';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import { Controller, useFormContext } from 'react-hook-form';

import type { ProjectFormValues } from '../../create/schema';

type FeesSectionProps = {
  __: (key: string, options?: Record<string, unknown>) => string;
  integrationAvailable: boolean;
  serviceFee: number | null | undefined;
};

type AutoConfirmMode = 'percent' | 'amount';

export function FeesSection({ __, integrationAvailable, serviceFee }: FeesSectionProps) {
  const {
    control,
    watch,
    setValue,
    clearErrors,
    formState: { errors },
  } = useFormContext<ProjectFormValues>();

  const sideCommission = watch('side_commission');
  const sideServiceCommission = watch('side_commission_cc');
  const autoConfirmAmount = watch('auto_confirm_partial_by_amount');
  const autoConfirmPercent = watch('auto_confirm_partial_by_percent');

  const autoConfirmMode: AutoConfirmMode = autoConfirmPercent ? 'percent' : 'amount';
  const autoConfirmValue = (autoConfirmMode === 'percent' ? autoConfirmPercent : autoConfirmAmount) || '';
  const autoConfirmError =
    errors.auto_confirm_partial_by_amount?.message || errors.auto_confirm_partial_by_percent?.message;

  if (!integrationAvailable) {
    return <Alert severity="info">{__('pages/projects.integration.fees_placeholder')}</Alert>;
  }

  const handleAutoConfirmModeChange = (mode: AutoConfirmMode | null) => {
    if (!mode || mode === autoConfirmMode) return;

    if (mode === 'percent') {
      setValue('auto_confirm_partial_by_percent', autoConfirmValue);
      setValue('auto_confirm_partial_by_amount', '');
    } else {
      setValue('auto_confirm_partial_by_amount', autoConfirmValue);
      setValue('auto_confirm_partial_by_percent', '');
    }

    clearErrors(['auto_confirm_partial_by_amount', 'auto_confirm_partial_by_percent']);
  };

  const handleAutoConfirmChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;

    if (autoConfirmMode === 'percent') {
      setValue('auto_confirm_partial_by_percent', value);
      setValue('auto_confirm_partial_by_amount', '');
    } else {
      setValue('auto_confirm_partial_by_amount', value);
      setValue('auto_confirm_partial_by_percent', '');
    }
  };

  const renderSideSwitcher = (
    name: 'side_commission' | 'side_commission_cc',
    value: string | undefined,
    title: string,
    description: string
  ) => (
    <Stack spacing={1.5}>
      <Stack spacing={0.5}>
        <Typography variant="subtitle1">{title}</Typography>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      </Stack>

      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Typography variant="body2" color={value === 'client' ? 'text.primary' : 'text.secondary'}>
              {__('pages/projects.fees.client')}
            </Typography>

            <Switch
              checked={field.value === 'merchant'}
              onChange={(_, checked) => {
                const nextValue = checked ? 'merchant' : 'client';

                field.onChange(nextValue);
                setValue(name, nextValue);
              }}
              inputProps={{ 'aria-label': name }}
            />

            <Typography variant="body2" color={value === 'merchant' ? 'text.primary' : 'text.secondary'}>
              {__('pages/projects.fees.merchant')}
            </Typography>
          </Stack>
        )}
      />
    </Stack>
  );

  return (
    <Stack spacing={3}>
      {serviceFee != null && (
        <Stack spacing={0.5}>
          <Typography variant="subtitle2">{__('pages/projects.integration.fees_title')}</Typography>
          <Typography variant="body2" color="text.secondary">
            {__('pages/projects.integration.fees_value', { value: serviceFee })}
          </Typography>
        </Stack>
      )}

      {renderSideSwitcher(
        'side_commission',
        sideCommission,
        __('pages/projects.fees.transfer_title'),
        __('pages/projects.fees.transfer_description')
      )}

      {renderSideSwitcher(
        'side_commission_cc',
        sideServiceCommission,
        __('pages/projects.fees.service_title'),
        __('pages/projects.fees.service_description')
      )}

      <Stack spacing={1.5}>
        <Stack spacing={0.5}>
          <Typography variant="subtitle1">{__('pages/projects.fees.auto_confirm_title')}</Typography>
          <Typography variant="body2" color="text.secondary">
            {__('pages/projects.fees.auto_confirm_description')}
          </Typography>
        </Stack>

        <TextField
          value={autoConfirmValue}
          onChange={handleAutoConfirmChange}
          margin="dense"
          size="small"
          variant="filled"
          placeholder="0"
          error={!!autoConfirmError}
          helperText={autoConfirmError}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <ToggleButtonGroup
                  exclusive
                  value={autoConfirmMode}
                  onChange={(_, value) => handleAutoConfirmModeChange(value)}
                  size="small"
                >
                  <ToggleButton value="percent">%</ToggleButton>
                  <ToggleButton value="amount">$</ToggleButton>
                </ToggleButtonGroup>
              </InputAdornment>
            ),
          }}
        />
      </Stack>
    </Stack>
  );
}

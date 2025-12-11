import { useEffect, useState } from 'react';
import type { ChangeEvent } from 'react';

import Alert from '@mui/material/Alert';
import InputAdornment from '@mui/material/InputAdornment';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import { Controller, useFormContext } from 'react-hook-form';

import { Iconify } from 'src/components/iconify';
import { FormRow } from '../../components/form';
import { projectAccent } from '../../theme';

import type { ProjectFormValues } from '../../create/schema';

type FeesSectionProps = {
  __: (key: string, replaces?: Record<string, string | number> | string) => string;
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

  const autoConfirmAmount = watch('auto_confirm_partial_by_amount');
  const autoConfirmPercent = watch('auto_confirm_partial_by_percent');

  const [autoConfirmMode, setAutoConfirmMode] = useState<AutoConfirmMode>(
    autoConfirmPercent ? 'percent' : 'amount'
  );

  useEffect(() => {
    if (autoConfirmPercent) {
      setAutoConfirmMode('percent');
    } else if (autoConfirmAmount) {
      setAutoConfirmMode('amount');
    }
  }, [autoConfirmAmount, autoConfirmPercent]);

  const autoConfirmValue = (autoConfirmMode === 'percent' ? autoConfirmPercent : autoConfirmAmount) || '';
  const autoConfirmError =
    errors.auto_confirm_partial_by_amount?.message || errors.auto_confirm_partial_by_percent?.message;

  const sideOptions = [
    { value: 'client', label: __('pages/projects.fees.client'), icon: 'solar:user-rounded-bold' },
    { value: 'merchant', label: __('pages/projects.fees.merchant'), icon: 'solar:bag-2-bold' },
  ];

  const autoConfirmOptions: { value: AutoConfirmMode; label: string; icon: string }[] = [
    { value: 'percent', label: '%', icon: 'solar:percent-round-bold' },
    { value: 'amount', label: '$', icon: 'solar:tag-price-bold' },
  ];

  if (!integrationAvailable) {
    return <Alert severity="info">{__('pages/projects.integration.fees_placeholder')}</Alert>;
  }

  const handleAutoConfirmModeChange = (mode: AutoConfirmMode | null) => {
    if (!mode || mode === autoConfirmMode) return;

    setAutoConfirmMode(mode);

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
    title: string,
    description: string
  ) => (
    <FormRow title={title} description={description}>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <ToggleButtonGroup
            exclusive
            value={field.value || ''}
            onChange={(_, nextValue) => {
              if (!nextValue) return;

              field.onChange(nextValue);
              setValue(name, nextValue);
            }}
            aria-label={name}
            sx={{ flexWrap: 'wrap' }}
          >
            {sideOptions.map((option) => (
              <ToggleButton
                key={option.value}
                value={option.value}
                sx={{
                  px: 2,
                  borderRadius: 999,
                  textTransform: 'none',
                  borderColor: (theme) =>
                    field.value === option.value ? projectAccent(theme).color : theme.vars.palette.divider,
                  color: (theme) =>
                    field.value === option.value
                      ? projectAccent(theme).color
                      : theme.vars.palette.text.secondary,
                  backgroundColor: (theme) =>
                    field.value === option.value ? projectAccent(theme).backgroundColor : 'transparent',
                  '&.Mui-selected': (theme) => ({
                    ...projectAccent(theme),
                    borderColor: projectAccent(theme).color,
                  }),
                }}
              >
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Iconify icon={option.icon} width={18} />
                  <Typography
                    variant="body2"
                    color={field.value === option.value ? 'primary.contrastText' : 'text.secondary'}
                  >
                    {option.label}
                  </Typography>
                </Stack>
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        )}
      />
    </FormRow>
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
        __('pages/projects.fees.transfer_title'),
        __('pages/projects.fees.transfer_description')
      )}

      {renderSideSwitcher(
        'side_commission_cc',
        __('pages/projects.fees.service_title'),
        __('pages/projects.fees.service_description')
      )}

      <FormRow
        title={__('pages/projects.fees.auto_confirm_title')}
        description={__('pages/projects.fees.auto_confirm_description')}
      >
        <Stack spacing={1} alignItems="flex-start">
          <ToggleButtonGroup
            exclusive
            value={autoConfirmMode}
            onChange={(_, value) => handleAutoConfirmModeChange(value)}
            size="small"
            sx={{ flexWrap: 'wrap' }}
          >
            {autoConfirmOptions.map((option) => (
              <ToggleButton
                key={option.value}
                value={option.value}
                sx={{
                  px: 2,
                  borderRadius: 999,
                  textTransform: 'none',
                  borderColor: (theme) =>
                    autoConfirmMode === option.value
                      ? projectAccent(theme).color
                      : theme.vars.palette.divider,
                  color: (theme) =>
                    autoConfirmMode === option.value
                      ? projectAccent(theme).color
                      : theme.vars.palette.text.secondary,
                  backgroundColor: (theme) =>
                    autoConfirmMode === option.value ? projectAccent(theme).backgroundColor : 'transparent',
                  '&.Mui-selected': (theme) => ({
                    ...projectAccent(theme),
                    borderColor: projectAccent(theme).color,
                  }),
                }}
              >
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <Iconify icon={option.icon} width={16} />
                  <Typography variant="body2">{option.label}</Typography>
                </Stack>
              </ToggleButton>
            ))}
          </ToggleButtonGroup>

          <TextField
            value={autoConfirmValue}
            onChange={handleAutoConfirmChange}
            margin="dense"
            size="small"
            variant="filled"
            placeholder="0"
            error={!!autoConfirmError}
            helperText={autoConfirmError}
            label={autoConfirmMode === 'percent' ? 'Проценты' : 'Сумма'}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">{autoConfirmMode === 'percent' ? '%' : '$'}</InputAdornment>
              ),
            }}
          />
        </Stack>
      </FormRow>
    </Stack>
  );
}

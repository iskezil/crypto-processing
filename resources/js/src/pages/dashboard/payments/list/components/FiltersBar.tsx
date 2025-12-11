import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Chip from '@mui/material/Chip';
import InputAdornment from '@mui/material/InputAdornment';
import type { SelectChangeEvent } from '@mui/material/Select';
import { DateRangePicker } from '@mui/x-date-pickers-pro';
import type dayjs from 'dayjs';
import type { SxProps, Theme } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';
import { projectAccent } from 'src/theme/projectAccent';
import { useLang } from 'src/hooks/useLang';

import Typography from '@mui/material/Typography';

import { TokenNetworkAvatar } from '@/components/token-network-avatar';
import type { CurrencyOption, DateRangeValue, FilterState, ProjectOption, StatusOption } from '../../types';

type Props = {
  filters: FilterState;
  projects: ProjectOption[];
  currencies: CurrencyOption[];
  statuses: StatusOption[];
  dateRange: DateRangeValue;

  onFilterChange: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
  onDateRangeChange: (range: [dayjs.Dayjs | null, dayjs.Dayjs | null]) => void;
};

export function FiltersBar({
                             filters,
                             projects,
                             currencies,
                             statuses,
                             dateRange,
                             onFilterChange,
                             onDateRangeChange,
                           }: Props) {
  const { __ } = useLang();

  const chipSx: SxProps<Theme> = (theme) => ({
    borderRadius: 1,
    ...(projectAccent(theme) as object),
  });

  const setFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    onFilterChange(key, value);
  };

  const projectsWithId = projects.filter(
    (p): p is ProjectOption & { id: number } => typeof p.id === 'number'
  );

  const renderProjectValues = (values: number[]) => (
    <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
      {values.map((id) => {
        const label = projectsWithId.find((p) => p.id === id)?.name ?? id;
        return <Chip key={`project-${id}`} label={label} size="small" sx={chipSx} />;
      })}
    </Stack>
  );

  const renderCurrencyValues = (values: string[]) => (
    <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
      {values.map((code) => {
        const currency = currencies.find((item) => item.code === code);
        const label = currency ? `${currency.token} · ${currency.network}` : code;

        return <Chip key={`currency-${code}`} label={label} size="small" sx={chipSx} />;
      })}
    </Stack>
  );

  const renderStatusValues = (values: string[]) => (
    <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
      {values.map((value) => {
        const label = statuses.find((s) => s.value === value)?.label ?? value;
        return <Chip key={`status-${value}`} label={label} size="small" sx={chipSx} />;
      })}
    </Stack>
  );

  const handleProjectChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    const next: number[] = Array.isArray(value)
      ? value.map((item) => Number(item))
      : value.split(',').map((item) => Number(item));
    setFilter('project_id', next);
  };

  const handleProjectSelectChange = (event: SelectChangeEvent<unknown>) =>
    handleProjectChange(event as SelectChangeEvent<string[]>);

  const handleCurrencyChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    const next: string[] = Array.isArray(value) ? value : value.split(',');
    setFilter('currency', next);
  };

  const handleCurrencySelectChange = (event: SelectChangeEvent<unknown>) =>
    handleCurrencyChange(event as SelectChangeEvent<string[]>);

  const handleStatusChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    const next: string[] = Array.isArray(value) ? value : value.split(',');
    setFilter('status', next);
  };

  const handleStatusSelectChange = (event: SelectChangeEvent<unknown>) =>
    handleStatusChange(event as SelectChangeEvent<string[]>);

  return (
    <Stack spacing={2} direction={{ xs: 'column', sm: 'row' }} sx={{ p: 2 }}>
      <TextField
        value={filters.search}
        onChange={(event) => setFilter('search', event.target.value)}
        placeholder={__('pages/payments.search')}
        label={__('pages/payments.search')}
        size="small"
        sx={{ minWidth: { xs: '100%', md: 220 } }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="solar:magnifer-linear" width={20} />
              </InputAdornment>
            ),
          },
        }}
      />

      <TextField
        select
        placeholder={__('pages/payments.filters.project')}
        label={__('pages/payments.filters.project')}
        value={filters.project_id}
        size="small"
        sx={{ minWidth: { xs: '100%', md: 170 } }}
        SelectProps={{
          multiple: true,
          onChange: handleProjectSelectChange,
          renderValue: (selected) => renderProjectValues(selected as number[]),
        }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="solar:widget-6-bold" width={18} />
              </InputAdornment>
            ),
          },
        }}
      >
        {projectsWithId.map((project) => (
          <MenuItem key={project.id} value={project.id}>
            {project.name}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        select
        placeholder={__('pages/payments.filters.currency')}
        label={__('pages/payments.filters.currency')}
        value={filters.currency}
        size="small"
        sx={{ minWidth: { xs: '100%', md: 190 } }}
        SelectProps={{
          multiple: true,
          onChange: handleCurrencySelectChange,
          renderValue: (selected) => renderCurrencyValues(selected as string[]),
        }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="solar:dollar-bold" width={18} />
              </InputAdornment>
            ),
          },
        }}
      >
        {currencies.map((currency) => (
          <MenuItem key={`${currency.code}-${currency.token}`} value={currency.code}>
            <Stack direction="row" spacing={1} alignItems="center">
              <TokenNetworkAvatar
                tokenIcon={currency.tokenIcon}
                networkIcon={currency.networkIcon}
                name={currency.token}
                size={24}
              />

              <Stack direction="row" spacing={0.5} alignItems="baseline">
                <Typography variant="subtitle2">{currency.token}</Typography>
                <Typography variant="body2" color="text.secondary">
                  · {currency.network}
                </Typography>
              </Stack>
            </Stack>
          </MenuItem>
        ))}
      </TextField>

      <TextField
        select
        placeholder={__('pages/payments.filters.status')}
        label={__('pages/payments.filters.status')}
        value={filters.status}
        size="small"
        sx={{ minWidth: { xs: '100%', md: 190 } }}
        SelectProps={{
          multiple: true,
          onChange: handleStatusSelectChange,
          renderValue: (selected) => renderStatusValues(selected as string[]),
        }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="solar:checklist-minimalistic-bold" width={18} />
              </InputAdornment>
            ),
          },
        }}
      >
        {statuses.map((status) => (
          <MenuItem key={status.value} value={status.value}>
            {status.label}
          </MenuItem>
        ))}
      </TextField>

      <DateRangePicker
        value={dateRange}
        onChange={onDateRangeChange}
        calendars={2}
        slotProps={{
          textField: {
            size: 'small',
            sx: { minWidth: { xs: '100%', md: 260 } },
            label: `${__('pages/payments.filters.date_from')} – ${__('pages/payments.filters.date_to')}`,
            slotProps: {
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Iconify icon="solar:calendar-bold" width={18} />
                  </InputAdornment>
                ),
              },
            },
          },
        }}
      />
    </Stack>
  );
}

import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';
import InputAdornment from '@mui/material/InputAdornment';
import { DateRangePicker } from '@mui/x-date-pickers-pro';
import type dayjs from 'dayjs';

import { Iconify } from 'src/components/iconify';
import { useLang } from 'src/hooks/useLang';

import type { DateRangeValue, FilterState, Option, StatusOption } from '../../types';

// ----------------------------------------------------------------------

type Props = {
  filters: FilterState;
  projects: Option[];
  currencies: Option[];
  statuses: StatusOption[];
  dateRange: DateRangeValue;
  onFilterChange: (key: keyof FilterState, value: any) => void;
  onDateRangeChange: (range: [dayjs.Dayjs | null, dayjs.Dayjs | null]) => void;
};

export function FiltersBar({ filters, projects, currencies, statuses, dateRange, onFilterChange, onDateRangeChange }: Props) {
  const { __ } = useLang();

  const renderProjectValues = (values: number[]) => (
    <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
      {values.map((item) => (
        <Chip key={`project-${item}`} label={projects.find((project) => project.id === item)?.name ?? item} size="small" />
      ))}
    </Stack>
  );

  const renderCurrencyValues = (values: string[]) => (
    <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
      {values.map((item) => (
        <Chip key={`currency-${item}`} label={item} size="small" />
      ))}
    </Stack>
  );

  const renderStatusValues = (values: string[]) => (
    <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
      {values.map((item) => (
        <Chip key={`status-${item}`} label={statuses.find((status) => status.value === item)?.label ?? item} size="small" />
      ))}
    </Stack>
  );

  return (
    <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
      <TextField
        value={filters.search}
        onChange={(event) => onFilterChange('search', event.target.value)}
        placeholder={__('pages/payments.search')}
        size="small"
        sx={{ minWidth: { xs: '100%', md: 220 } }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Iconify icon="solar:magnifer-linear" width={20} />
            </InputAdornment>
          ),
        }}
      />

      <TextField
        select
        label={__('pages/payments.filters.project')}
        value={filters.project_id}
        onChange={(event) => onFilterChange('project_id', event.target.value as number[])}
        size="small"
        sx={{ minWidth: { xs: '100%', md: 170 } }}
        SelectProps={{
          multiple: true,
          renderValue: (selected) => renderProjectValues(selected as number[]),
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Iconify icon="solar:widget-6-bold" width={18} />
            </InputAdornment>
          ),
        }}
      >
        {projects.map((project) => (
          <MenuItem key={project.id ?? project.name} value={project.id ?? undefined}>
            {project.name}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        select
        label={__('pages/payments.filters.currency')}
        value={filters.currency}
        onChange={(event) => onFilterChange('currency', event.target.value as string[])}
        size="small"
        sx={{ minWidth: { xs: '100%', md: 190 } }}
        SelectProps={{
          multiple: true,
          renderValue: (selected) => renderCurrencyValues(selected as string[]),
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Iconify icon="solar:dollar-bold" width={18} />
            </InputAdornment>
          ),
        }}
      >
        {currencies.map((currency) => (
          <MenuItem key={`${currency.code}-${currency.name}`} value={currency.code ?? currency.name}>
            <Stack direction="row" spacing={1} alignItems="center">
              {currency.icon ? <Avatar src={currency.icon} sx={{ width: 24, height: 24 }} /> : null}
              <Stack spacing={0.25}>
                <span>{currency.code}</span>
                <span>{currency.name}</span>
              </Stack>
            </Stack>
          </MenuItem>
        ))}
      </TextField>

      <TextField
        select
        label={__('pages/payments.filters.status')}
        value={filters.status}
        onChange={(event) => onFilterChange('status', event.target.value as string[])}
        size="small"
        sx={{ minWidth: { xs: '100%', md: 190 } }}
        SelectProps={{
          multiple: true,
          renderValue: (selected) => renderStatusValues(selected as string[]),
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Iconify icon="solar:checklist-minimalistic-bold" width={18} />
            </InputAdornment>
          ),
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
            InputProps: {
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="solar:calendar-bold" width={18} />
                </InputAdornment>
              ),
            },
          },
        }}
      />
    </Stack>
  );
}

import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import InputAdornment from '@mui/material/InputAdornment';
import { Iconify } from 'src/components/iconify';
import { useLang } from 'src/hooks/useLang';
import type { Filters, Role } from '../../types';

// ----------------------------------------------------------------------

interface Props {
  filters: Filters;
  onFilters: (name: keyof Filters, value: string | number | null) => void;
  roles: Role[];
}

export function UserTableToolbar({ filters, onFilters, roles }: Props) {
  const { __ } = useLang();

  return (
    <Stack spacing={2} direction={{ xs: 'column', sm: 'row' }} sx={{ p: 2 }}>
      <TextField
        size="small"
        variant="filled"
        hiddenLabel
        value={filters.keyword}
        onChange={(e) => onFilters('keyword', e.target.value)}
        sx={{ width: { xs: 1, sm: 240 } }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="solar:magnifer-linear" width={24} />
              </InputAdornment>
            ),
          },
        }}
      />

      <TextField
        select
        size="small"
        sx={{ minWidth: '100px', width: 'auto' }}
        hiddenLabel
        variant="filled"
        placeholder={__('pages/users.filters.role')}
        value={filters.role ?? ''}
        onChange={(e) => onFilters('role', e.target.value === '' ? null : Number(e.target.value))}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="solar:user-id-bold" width={24} />
              </InputAdornment>
            ),
          },
        }}
      >
        {roles.map((role) => {
          const key = role.name.toLowerCase();
          return (
            <MenuItem key={role.id} value={role.id}>
              {__(`pages/users.roles.${key}`)}
            </MenuItem>
          );
        })}
      </TextField>
    </Stack>
  );
}

import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import { Iconify } from 'src/components/iconify';
import { useLang } from 'src/hooks/useLang';
import type { Filters, Role } from '../../types';

// ----------------------------------------------------------------------

interface Props {
  filters: Filters;
  onFilters: (name: keyof Filters, value: string | number | null) => void;
  onResetFilters: () => void;
  results: number;
  roles: Role[];
}

export function UserTableFiltersResult({
  filters,
  onFilters,
  onResetFilters,
  results,
  roles,
}: Props) {
  const { __ } = useLang();
  const { keyword, role, status } = filters;
  const roleName = role !== null ? roles.find((r) => r.id === role)?.name || '' : '';

  const canReset = keyword || role !== null || status !== 'all';
  if (!canReset) return null;

  return (
    <Stack spacing={1} direction="row" alignItems="center" sx={{ p: 2, pt: 0 }}>
      <Typography variant="body2" sx={{ mr: 1 }}>
        {__('pages/users.filters.results', { count: results })}
      </Typography>

      {status !== 'all' && (
        <Chip
          label={`${__('pages/users.filters.status')}: ${__('pages/users.tabs.' + status)}`}
          onDelete={() => onFilters('status', 'all')}
        />
      )}

      {role !== null && (
        <Chip
          label={`${__('pages/users.filters.role')}: ${__(`pages/users.roles.${roleName.toLowerCase()}`)}`}
          onDelete={() => onFilters('role', null)}
        />
      )}

      {keyword && (
        <Chip
          label={`${__('pages/users.filters.keyword')}: ${keyword}`}
          onDelete={() => onFilters('keyword', '')}
        />
      )}

      <Button
        color="error"
        startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
        onClick={onResetFilters}
      >
        {__('pages/users.filters.clear')}
      </Button>
    </Stack>
  );
}

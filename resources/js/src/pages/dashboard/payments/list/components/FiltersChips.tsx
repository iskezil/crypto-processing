import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import { useLang } from 'src/hooks/useLang';

import type { FilterState, Option, StatusOption } from '../../types';

// ----------------------------------------------------------------------

type Props = {
  filters: FilterState;
  projects: Option[];
  currencies: Option[];
  statuses: StatusOption[];
  onClearFilter: (key: keyof FilterState, value?: string | number) => void;
};

export function FiltersChips({ filters, projects, currencies, statuses, onClearFilter }: Props) {
  const { __ } = useLang();

  const getProjectName = (id: number) => projects.find((project) => project.id === id)?.name ?? '';
  const getCurrencyLabel = (code: string) => currencies.find((currency) => currency.code === code)?.code ?? code;
  const getStatusLabel = (value: string) => statuses.find((status) => status.value === value)?.label ?? value;

  const hasFilters =
    filters.search ||
    filters.project_id.length > 0 ||
    filters.currency.length > 0 ||
    filters.status.length > 0 ||
    filters.date_from ||
    filters.date_to;

  if (!hasFilters) {
    return null;
  }

  return (
    <Stack spacing={1} direction="row" alignItems="center" flexWrap="wrap" useFlexGap>
      {filters.search && (
        <Chip
          label={`${__('pages/payments.search')}: ${filters.search}`}
          onDelete={() => onClearFilter('search')}
        />
      )}

      {filters.project_id.map((projectId) => (
        <Chip
          key={`project-${projectId}`}
          label={`${__('pages/payments.filters.project')}: ${getProjectName(projectId)}`}
          onDelete={() => onClearFilter('project_id', projectId)}
        />
      ))}

      {filters.currency.map((code) => (
        <Chip
          key={`currency-${code}`}
          label={`${__('pages/payments.filters.currency')}: ${getCurrencyLabel(code)}`}
          onDelete={() => onClearFilter('currency', code)}
        />
      ))}

      {filters.status.map((value) => (
        <Chip
          key={`status-${value}`}
          label={`${__('pages/payments.filters.status')}: ${getStatusLabel(value)}`}
          onDelete={() => onClearFilter('status', value)}
        />
      ))}

      {(filters.date_from || filters.date_to) && (
        <Chip
          label={`${__('pages/payments.filters.date_from')}: ${filters.date_from ?? '—'} / ${__('pages/payments.filters.date_to')}: ${filters.date_to ?? '—'}`}
          onDelete={() => onClearFilter('date_from')}
        />
      )}
    </Stack>
  );
}

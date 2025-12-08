import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import type { SxProps, Theme } from '@mui/material/styles';

import { projectAccent } from 'src/theme/projectAccent';
import { useLang } from 'src/hooks/useLang';

import type { CurrencyOption, FilterState, ProjectOption, StatusOption } from '../../types';

type Props = {
  filters: FilterState;
  projects: ProjectOption[];
  currencies: CurrencyOption[];
  statuses: StatusOption[];
  onClearFilter: (key: keyof FilterState, value?: string | number) => void;
};

export function FiltersChips({ filters, projects, currencies, statuses, onClearFilter }: Props) {
  const { __ } = useLang();

  const getProjectName = (id: number) => projects.find((project) => project.id === id)?.name ?? '';
  const getCurrencyLabel = (code: string) => {
    const currency = currencies.find((item) => item.code === code);

    if (!currency) return code;

    return `${currency.token} · ${currency.network}`;
  };
  const getStatusLabel = (value: string) => statuses.find((status) => status.value === value)?.label ?? value;

  const chipSx: SxProps<Theme> = (theme) => ({
    borderRadius: 1,
    ...projectAccent(theme),
    '& .MuiChip-deleteIcon': {
      color: projectAccent(theme).color,
    },
  });

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
    <Stack spacing={1} direction="row" alignItems="center" flexWrap="wrap" useFlexGap sx={{ paddingX: 2, pb: 2 }}>
      {filters.search && (
        <Chip
          label={`${__('pages/payments.search')}: ${filters.search}`}
          onDelete={() => onClearFilter('search')}
          color="primary"
          variant="soft"
          sx={chipSx}
        />
      )}

      {filters.project_id.map((projectId) => (
        <Chip
          key={`project-${projectId}`}
          label={`${__('pages/payments.filters.project')}: ${getProjectName(projectId)}`}
          onDelete={() => onClearFilter('project_id', projectId)}
          color="primary"
          variant="soft"
          sx={chipSx}
        />
      ))}

      {filters.currency.map((code) => (
        <Chip
          key={`currency-${code}`}
          label={`${__('pages/payments.filters.currency')}: ${getCurrencyLabel(code)}`}
          onDelete={() => onClearFilter('currency', code)}
          color="primary"
          variant="soft"
          sx={chipSx}
        />
      ))}

      {filters.status.map((value) => (
        <Chip
          key={`status-${value}`}
          label={`${__('pages/payments.filters.status')}: ${getStatusLabel(value)}`}
          onDelete={() => onClearFilter('status', value)}
          color="primary"
          variant="soft"
          sx={chipSx}
        />
      ))}

      {(filters.date_from || filters.date_to) && (
        <Chip
          label={`${__('pages/payments.filters.date_from')}: ${filters.date_from ?? '—'} / ${__('pages/payments.filters.date_to')}: ${filters.date_to ?? '—'}`}
          onDelete={() => onClearFilter('date_from')}
          color="primary"
          variant="soft"
          sx={chipSx}
        />
      )}
    </Stack>
  );
}

import type { Theme } from '@mui/material/styles';

import { varAlpha } from 'minimal-shared/utils';

export const projectAccent = (theme: Theme) => ({
  color: theme.vars.palette.primary.main,
  backgroundColor: varAlpha(theme.vars.palette.primary.mainChannel, 0.08),
  '&:hover': {
    backgroundColor: varAlpha(theme.vars.palette.primary.mainChannel, 0.16),
  },
});

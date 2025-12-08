import type { BoxProps } from '@mui/material/Box';
import type { Theme, SxProps } from '@mui/material/styles';
import type { TypographyProps } from '@mui/material/Typography';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

type SearchNotFoundProps = BoxProps & {
  query?: string;
  sx?: SxProps<Theme>;
  slotProps?: {
    title?: TypographyProps;
    description?: TypographyProps;
  };
};

const baseSx: SxProps<Theme> = {
  gap: 1,
  display: 'flex',
  borderRadius: 1.5,
  textAlign: 'center',
  flexDirection: 'column',
};

function mergeSx(...items: Array<SxProps<Theme> | undefined>): SxProps<Theme> {
  // MUI sx спокойно принимает массив, поэтому возвращаем массив как SxProps
  return items.filter(Boolean) as SxProps<Theme>;
}

export function SearchNotFound({
                                 query,
                                 sx,
                                 slotProps,
                                 ...other
                               }: SearchNotFoundProps) {
  const { title, description } = slotProps ?? {};

  const containerSx = mergeSx(baseSx, sx);

  if (!query) {
    return (
      <Box sx={containerSx} {...other}>
        <Typography variant="body2" {...description}>
          Please enter keywords
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={containerSx} {...other}>
      <Typography
        variant="h6"
        {...title}
        sx={mergeSx({ color: 'text.primary' }, title?.sx)}
      >
        Not found
      </Typography>

      <Typography variant="body2" {...description}>
        No results found for&nbsp;
        <strong>{`"${query}"`}</strong>.
        <br />
        Try checking for typos or using complete words.
      </Typography>
    </Box>
  );
}

import { varAlpha } from 'minimal-shared/utils';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { DashboardContent } from '../../layouts/dashboard';
import { SxProps } from "@mui/material/styles";

export type BlankViewProps = {
  title: string,
  description?: string,
  sx?: SxProps
}
export function BlankView({ title = 'Blank', description, sx } : BlankViewProps) {
  const renderContent = () => (
    <Box
      sx={[
        (theme) => ({
          mt: 5,
          width: 1,
          height: 320,
          borderRadius: 2,
          border: `dashed 1px ${theme.vars.palette.divider}`,
          bgcolor: varAlpha(theme.vars.palette.grey['500Channel'], 0.04),
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    />
  );

  return (
    <DashboardContent maxWidth="xl">
      <Typography variant="h4"> {title} </Typography>
      {description && <Typography sx={{ mt: 1 }}> {description} </Typography>}

      {renderContent()}
    </DashboardContent>
  );
}

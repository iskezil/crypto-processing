import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { ReactNode } from 'react';

type FormRowProps = {
  title: string;
  description: string;
  children: ReactNode;
};

export function FormRow({ title, description, children }: FormRowProps) {
  return (
    <Grid container spacing={2.5} alignItems="flex-start">
      <Grid size={{ xs: 12, md: 6 }}>
        <Stack spacing={0.75}>
          <Typography variant="subtitle1">{title}</Typography>
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        </Stack>
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>{children}</Grid>
    </Grid>
  );
}

export default FormRow;

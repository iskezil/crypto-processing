import { ElementType } from 'react';
import { m } from 'framer-motion';

import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { SxProps, Theme, useTheme } from '@mui/material/styles';

import { RouterLink } from 'src/routes/components';

import { MotionContainer, varBounce } from '../animate';

type IllustrationComponent = ElementType<{ sx?: SxProps<Theme> }>;

export type ErrorPageProps = {
  title: string;
  description: string;
  illustration: IllustrationComponent;
  actionHref: string;
  actionLabel: string;
};

export function ErrorPage({ title, description, illustration: Illustration, actionHref, actionLabel }: ErrorPageProps) {
  const theme = useTheme();

  return (
    <Container component={MotionContainer} sx={{ textAlign: 'center' }}>
      <Stack spacing={3} alignItems="center">
        <m.div variants={varBounce('in')}>
          <Typography variant="h3" sx={{ mb: 2 }}>
            {title}
          </Typography>
        </m.div>

        <m.div variants={varBounce('in')}>
          <Typography sx={{ color: 'text.secondary' }}>{description}</Typography>
        </m.div>

        <m.div variants={varBounce('in')}>
          <Illustration sx={{ my: { xs: theme.spacing(5), sm: theme.spacing(10) } }} />
        </m.div>

        <Stack direction="row" justifyContent="center">
          <Button component={RouterLink} href={actionHref} size="large" variant="contained">
            {actionLabel}
          </Button>
        </Stack>
      </Stack>
    </Container>
  );
}


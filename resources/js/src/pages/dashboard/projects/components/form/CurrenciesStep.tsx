import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import FormHelperText from '@mui/material/FormHelperText';

import { Controller, type Control } from 'react-hook-form';

import { Iconify } from 'src/components/iconify';
import { Field } from 'src/components/hook-form';
import { TokenNetworkAvatar } from 'src/pages/dashboard/projects/components';

import { FormRow } from './FormRow';

type TokenNetwork = {
  id: number;
  full_code: string;
  stable_coin: boolean;
  token?: { name: string; code: string; icon_path?: string; icon_url?: string };
  network?: { name: string; code: string; icon_path?: string; icon_url?: string; network?: string };
};

type CurrenciesStepProps = {
  title: string;
  acceptLabel: string;
  control: Control<any>;
  tokenNetworks: TokenNetwork[];
};

export function CurrenciesStep({ title, control, tokenNetworks, acceptLabel }: CurrenciesStepProps) {
  return (
    <Stack spacing={2.5}>
      <Typography variant="h6">{title}</Typography>
      <Controller
        name="token_network_ids"
        control={control}
        render={({ field, fieldState: { error } }) => (
          <Stack spacing={1.5}>
            <Grid container spacing={2}>
              {tokenNetworks.map((network) => {
                const selected = field.value.includes(network.id);
                const tokenIcon = network.token?.icon_url;
                const networkIcon = network.network?.icon_url;
                const networkLabel =
                  network.network?.network || network.network?.name || network.network?.code || network.full_code;

                return (
                  <Grid key={network.id} size={{ xs: 12, sm: 6, md: 4 }}>
                    <Paper
                      variant="outlined"
                      onClick={() =>
                        field.onChange(
                          selected
                            ? field.value.filter((value: number) => value !== network.id)
                            : [...field.value, network.id]
                        )
                      }
                      sx={{
                        p: 2,
                        gap: 1.5,
                        display: 'flex',
                        alignItems: 'center',
                        cursor: 'pointer',
                        height: '100%',
                        borderColor: selected ? 'primary.main' : 'divider',
                        bgcolor: selected ? 'action.selected' : 'background.default',
                        transition: (theme) => theme.transitions.create(['box-shadow', 'border-color']),
                        '&:hover': { boxShadow: (theme) => theme.customShadows?.z8 },
                      }}
                    >
                      <TokenNetworkAvatar
                        tokenIcon={tokenIcon}
                        networkIcon={networkIcon}
                        name={network.token?.name || network.network?.name}
                      />
                      <Stack spacing={0.5} sx={{ flexGrow: 1 }}>
                        <Typography variant="subtitle2">
                          {network.token?.name || network.network?.name || network.full_code}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {networkLabel}
                        </Typography>
                      </Stack>
                      <Iconify
                        icon={selected ? 'solar:toggle-on-bold' : 'solar:toggle-off-bold'}
                        width={32}
                        color={selected ? 'var(--mui-palette-primary-main)' : undefined}
                      />
                    </Paper>
                  </Grid>
                );
              })}
            </Grid>
            <FormHelperText error={!!error}>{error?.message}</FormHelperText>
          </Stack>
        )}
      />

      <FormRow title="" description="">
        <Field.Checkbox name="accept" label={acceptLabel} />
      </FormRow>
    </Stack>
  );
}

export default CurrenciesStep;

import { useState } from 'react';

import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

import TextField from '@mui/material/TextField';

import { Field } from 'src/components/hook-form';
import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog/confirm-dialog';

import type { ProjectApiKey } from '../../types';
import { FormRow } from '../../components/form';

type IntegrationSectionProps = {
  __: (key: string, options?: Record<string, unknown>) => string;
  integrationAvailable: boolean;
  activeApiKey?: ProjectApiKey;
  apiKeyStatusLabels: Record<ProjectApiKey['status'], string>;
  apiKeyStatusColors: Record<ProjectApiKey['status'], 'warning' | 'success' | 'error' | 'info'>;
  projectUlid: string;
  isApiKeyCopied: boolean;
  isShopIdCopied: boolean;
  isGeneratingSecret: boolean;
  onCopyApiKey: () => void;
  onCopyShopId: () => void;
  onGenerateSecret: () => void;
};

export function IntegrationSection({
  __,
  integrationAvailable,
  activeApiKey,
  apiKeyStatusColors,
  apiKeyStatusLabels,
  projectUlid,
  isApiKeyCopied,
  isShopIdCopied,
  isGeneratingSecret,
  onCopyApiKey,
  onCopyShopId,
  onGenerateSecret,
}: IntegrationSectionProps) {
  const [isSecretConfirmOpen, setIsSecretConfirmOpen] = useState(false);

  if (!integrationAvailable) {
    return <Alert severity="info">{__('pages/projects.integration.apikey_placeholder')}</Alert>;
  }

  return (
    <Stack spacing={3}>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems={{ md: 'flex-start' }}>
        <Stack spacing={1} flex={{ md: '1 1 40%' }}>
          <Typography variant="h6">{__('pages/projects.integration.api_keys_title')}</Typography>
          <Typography variant="body2" color="text.secondary">
            {__('pages/projects.integration.api_keys_hint')}
          </Typography>
        </Stack>

        <Stack spacing={2} flex={{ md: '1 1 60%' }}>
          {activeApiKey ? (
            <>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ sm: 'center' }}>
                <Chip color={apiKeyStatusColors[activeApiKey.status]} label={apiKeyStatusLabels[activeApiKey.status]} />
                <Typography variant="caption" color="text.secondary">
                  {__('pages/projects.integration.generated_at', { date: activeApiKey.created_at })}
                </Typography>
              </Stack>

              <TextField
                label={__('pages/projects.integration.api_key')}
                value={activeApiKey.plain_text_token || ''}
                margin="dense"
                size="small"
                variant="filled"
                InputProps={{
                  readOnly: true,
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        color={isApiKeyCopied ? 'success' : 'default'}
                        onClick={onCopyApiKey}
                        disabled={!activeApiKey.plain_text_token}
                      >
                        <Iconify icon="solar:copy-bold" width={18} />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                label={__('pages/projects.integration.shop_id')}
                value={projectUlid}
                margin="dense"
                size="small"
                variant="filled"
                InputProps={{
                  readOnly: true,
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton color={isShopIdCopied ? 'success' : 'default'} onClick={onCopyShopId}>
                        <Iconify icon="solar:copy-bold" width={18} />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                label={__('pages/projects.integration.api_secret')}
                value={__('pages/projects.integration.secret_placeholder')}
                margin="dense"
                size="small"
                variant="filled"
                InputProps={{
                  readOnly: true,
                  startAdornment: (
                    <InputAdornment position="start">
                      <Iconify icon="solar:lock-keyhole-bold-duotone" width={20} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <Button
                        color="primary"
                        variant="text"
                        size="small"
                        startIcon={<Iconify icon="solar:lock-keyhole-bold" width={18} />}
                        onClick={() => setIsSecretConfirmOpen(true)}
                        disabled={isGeneratingSecret}
                      >
                        {__('pages/projects.integration.generate_secret')}
                      </Button>
                    </InputAdornment>
                  ),
                }}
              />
            </>
          ) : (
            <Alert severity="warning">{__('pages/projects.integration.api_key_missing')}</Alert>
          )}
        </Stack>
      </Stack>

      <Stack spacing={2}>
        <Typography variant="h6">{__('pages/projects.integration.project_data_title')}</Typography>

        <FormRow
          title="Успешный URL:"
          description="Cсылка на страницу, на которую пользователь будет попадать после успешной оплаты."
        >
          <Field.Text name="success_url" placeholder="https://" />
        </FormRow>

        <FormRow
          title="Неудачный URL:"
          description="Cсылка на страницу, на которую пользователь будет попадать после в случае неуспешной оплаты."
        >
          <Field.Text name="fail_url" placeholder="https://" />
        </FormRow>

        <FormRow
          title="URL для уведомлений"
          description="Cсылка на страницу в вашей системе, на который будут приходить уведомления о событиях. Уведомления используются при взаимодействии по API — они позволяют автоматически отслеживать и передавать вашему сайту (или сервису) статусы операций. Если вы хотите принимать платежи с помощью HTML-виджета, данное поле заполнять не нужно."
        >
          <Field.Text name="notify_url" placeholder="https://" />
        </FormRow>
      </Stack>

      <ConfirmDialog
        open={isSecretConfirmOpen}
        onClose={() => setIsSecretConfirmOpen(false)}
        title={__('pages/projects.integration.secret_confirm.title')}
        content={__('pages/projects.integration.secret_confirm.description')}
        action={
          <Button
            color="error"
            variant="contained"
            onClick={() => {
              setIsSecretConfirmOpen(false);
              onGenerateSecret();
            }}
            disabled={isGeneratingSecret}
          >
            {__('pages/projects.integration.secret_confirm.action')}
          </Button>
        }
      />
    </Stack>
  );
}

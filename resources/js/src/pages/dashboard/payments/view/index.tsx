import { router } from '@inertiajs/react';
import dayjs from 'dayjs';

import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import Tooltip from '@mui/material/Tooltip';

import { DashboardContent, DashboardLayout } from 'src/layouts/dashboard';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { useLang } from 'src/hooks/useLang';
import { route } from 'src/routes/route';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { TokenNetworkAvatar } from 'src/components/token-network-avatar';

import type { InvoiceRow } from '../types';
import { formatAmount, formatTx, statusColor, statusIcon } from '../utils';

// ----------------------------------------------------------------------

type Props = {
  invoice: InvoiceRow;
  isAdmin: boolean;
};

// ----------------------------------------------------------------------

export default function PaymentView({ invoice, isAdmin }: Props) {
  const { __ } = useLang();
  const title = __('pages/payments.details.title');
  const listRoute = isAdmin ? 'payments.admin' : 'payments.index';
  const currencyCode = invoice.currency.token ?? invoice.currency.code ?? '';

  const handleCancelInvoice = () => {
    if (!invoice.can_cancel) return;

    router.post(route('payments.cancel', invoice.id), {}, { preserveScroll: true, preserveState: true });
  };

  const infoRows = [
    { label: __('pages/payments.details.link'), value: invoice.number },
    { label: __('pages/payments.details.status'), value: <Label color={statusColor[invoice.status] ?? 'info'}>{__(`pages/payments.statuses.${invoice.status}`)}</Label> },
    { label: __('pages/payments.details.type'), value: __('pages/payments.details.income') },
    { label: __('pages/payments.details.date'), value: invoice.created_at ? dayjs(invoice.created_at).format('DD.MM.YYYY HH:mm') : '—' },
    { label: __('pages/payments.details.completed_at'), value: invoice.updated_at ? dayjs(invoice.updated_at).format('DD.MM.YYYY HH:mm') : '—' },
    { label: __('pages/payments.details.order_id'), value: invoice.external_order_id ?? '—' },
    {
      label: __('pages/payments.details.project'),
      value:
        invoice.project?.ulid && invoice.project?.name ? (
          <Link
            href={route('projects.show', { project: invoice.project.ulid })}
            target="_blank"
            rel="noopener noreferrer"
            underline="hover"
          >
            {invoice.project.name}
          </Link>
        ) : (
          invoice.project?.name ?? '—'
        ),
    },
  ];

  const amountRows = [
    { label: __('pages/payments.details.amount'), value: `${formatAmount(invoice.amount)} ${currencyCode}` },
    { label: __('pages/payments.details.amount_usd'), value: `$${formatAmount(invoice.amount_usd, 2)}` },
    { label: __('pages/payments.details.paid'), value: `${formatAmount(invoice.paid_amount)} ${currencyCode}` },
    { label: __('pages/payments.details.credited'), value: `${formatAmount(invoice.credited_amount)} ${currencyCode}` },
    { label: __('pages/payments.details.service_fee'), value: `${formatAmount(invoice.service_fee)} ${currencyCode}` },
    { label: __('pages/payments.details.transfer_fee'), value: `${formatAmount(invoice.transfer_fee)} ${currencyCode}` },
  ];

  return (
    <>
      <title>{title}</title>
      <DashboardLayout>
        <DashboardContent maxWidth="lg">
          <CustomBreadcrumbs
            heading={title}
            links={[
              { name: __('pages/payments.breadcrumbs.dashboard'), href: route('dashboard', undefined, false) },
              { name: __('pages/payments.title'), href: route(listRoute, undefined, false) },
              { name: invoice.number },
            ]}
            sx={{ mb: { xs: 3, md: 5 } }}
          />

          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card
                sx={{
                  p: 3,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Stack spacing={1} alignItems="center" sx={{ width: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    {invoice.created_at ? dayjs(invoice.created_at).format('DD.MM.YYYY HH:mm') : '—'}
                  </Typography>
                  <Typography variant="h3">{`$${formatAmount(invoice.paid_amount, 2)}`}</Typography>
                  <Typography variant="subtitle1" color="text.secondary">
                    {`${formatAmount(invoice.paid_amount)} ${currencyCode}`}
                  </Typography>
                </Stack>

                <Stack spacing={1} alignItems="center">
                  <Iconify
                    icon={statusIcon[invoice.status] ?? 'solar:info-circle-bold'}
                    width={64}
                    sx={{ color: (theme) => theme.palette[statusColor[invoice.status] ?? 'info'].main }}
                  />
                  <Typography variant="h6">{__(`pages/payments.statuses.${invoice.status}`)}</Typography>
                </Stack>

                {invoice.status === 'created' && invoice.can_cancel && (
                  <Button fullWidth variant="outlined" color="error" onClick={handleCancelInvoice}>
                    {__('pages/payments.details.cancel')}
                  </Button>
                )}
              </Card>
            </Grid>

            <Grid item xs={12} md={8}>
              <Card sx={{ p: 3 }}>
                <Grid container spacing={2} mb={1}>
                  {infoRows.map((item) => (
                    <Grid key={item.label} item xs={12} sm={6}>
                      <Typography variant="caption" color="text.secondary">
                        {item.label}
                      </Typography>
                      <Typography variant="subtitle1" sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                        {item.value}
                      </Typography>
                    </Grid>
                  ))}
                </Grid>

                <Divider sx={{ my: 2 }} />

                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm="auto">
                    <Typography variant="caption" color="text.secondary">
                      {__('pages/payments.details.currency')}
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <TokenNetworkAvatar
                        tokenIcon={invoice.currency.tokenIcon}
                        networkIcon={invoice.currency.networkIcon}
                        name={currencyCode}
                        size={32}
                      />
                      <Stack spacing={0.25}>
                        <Typography variant="subtitle1">{currencyCode}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {invoice.currency.network ?? '—'}
                        </Typography>
                      </Stack>
                    </Stack>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 2 }} />

                <Grid container spacing={2}>
                  {amountRows.map((item) => (
                    <Grid key={item.label} item xs={12} sm={6}>
                      <Typography variant="caption" color="text.secondary">
                        {item.label}
                      </Typography>
                      <Typography variant="subtitle1">{item.value}</Typography>
                    </Grid>
                  ))}
                </Grid>

                <Divider sx={{ my: 2 }} />

                <Stack spacing={1}>
                  <Typography variant="caption" color="text.secondary">
                    {__('pages/payments.details.txids')}
                  </Typography>
                  <Stack spacing={0.5}>
                    {invoice.tx_ids.length === 0 && (
                      <Typography variant="body2" color="text.secondary">
                        —
                      </Typography>
                    )}
                    {invoice.tx_ids.map((tx) => {
                      const explorerUrl = invoice.tx_explorer_url?.replace('{tx}', tx);

                      return (
                        <Tooltip key={tx} title={tx} placement="top-start">
                          {explorerUrl ? (
                            <Link href={explorerUrl} target="_blank" rel="noopener noreferrer" underline="hover">
                              {formatTx(tx)}
                            </Link>
                          ) : (
                            <Typography variant="body2">{formatTx(tx)}</Typography>
                          )}
                        </Tooltip>
                      );
                    })}
                    {invoice.address && (
                      <Typography variant="body2" color="text.secondary">
                        {invoice.address}
                      </Typography>
                    )}
                  </Stack>
                </Stack>
              </Card>
            </Grid>
          </Grid>
        </DashboardContent>
      </DashboardLayout>
    </>
  );
}

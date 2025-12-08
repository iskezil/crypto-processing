import { useMemo } from 'react';

import { router } from '@inertiajs/react';
import dayjs from 'dayjs';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import Tooltip from '@mui/material/Tooltip';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';

import { DashboardContent, DashboardLayout } from 'src/layouts/dashboard';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { useLang } from 'src/hooks/useLang';
import { route } from 'src/routes/route';
import { Iconify } from 'src/components/iconify';
import { TokenNetworkAvatar } from 'src/components/token-network-avatar';
import type { IconifyName } from 'src/components/iconify';

import type { InvoiceRow } from '../types';
import { formatAmount, formatTx, InvoiceStatus } from '../utils';

type Props = {
    invoice: InvoiceRow;
    isAdmin: boolean;
};

export default function PaymentView({ invoice, isAdmin }: Props) {
    const { __ } = useLang();
    const theme = useTheme();
    const title = __('pages/payments.details.title');
    const listRoute = isAdmin ? 'payments.admin' : 'payments.index';
    const currencyCode = invoice.currency.token ?? invoice.currency.code ?? '';
    const currencyName = invoice.currency.token ?? invoice.currency.code ?? '—';
    const networkName = invoice.currency.network ?? '—';

    const status = invoice.status as InvoiceStatus;
    const statusLabel = __(`pages/payments.statuses.${status}`);

    const statusStyles = useMemo(
        () => ({
            paid: { icon: 'solar:file-check-bold-duotone', color: theme.palette.success.main },
            overpaid: { icon: 'solar:wallet-money-bold', color: theme.palette.secondary.main },
            partial: { icon: 'solar:pie-chart-2-bold', color: theme.palette.warning.main },
            canceled: { icon: 'solar:clock-circle-bold', color: theme.palette.error.main },
            created: { icon: 'solar:sort-by-time-bold-duotone', color: theme.palette.warning.main },
        }) as Record<InvoiceStatus, { icon: IconifyName; color: string }>,
        [theme.palette],
    );

    const statusStyle = statusStyles[status] ?? statusStyles.created;

    const statusIconName = statusStyle.icon as Parameters<typeof Iconify>[0]['icon'];
    const statusColorValue = statusStyle.color;
    const statusContrastText = theme.palette.getContrastText(statusColorValue);

    const createdAt = invoice.created_at
        ? dayjs(invoice.created_at).format('DD.MM.YYYY HH:mm')
        : '—';

    const completedAt = invoice.updated_at
        ? dayjs(invoice.updated_at).format('DD.MM.YYYY HH:mm')
        : '—';

    const handleCancelInvoice = () => {
        if (!invoice.can_cancel) return;
        router.post(route('payments.cancel', invoice.id), {}, { preserveScroll: true, preserveState: true });
    };

    // --- ui helpers (строки справа) ---
    const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
        <Stack spacing={0.5}>
            <Typography variant="caption" color="text.secondary">
                {label}
            </Typography>
            <Typography
                variant="subtitle2"
                sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap' }}
            >
                {children}
            </Typography>
        </Stack>
    );

    const AmountRow = ({
                           label,
                           main,
                           sub,
                       }: {
        label: string;
        main: string;
        sub?: string;
    }) => (
        <Stack spacing={0.25}>
            <Typography variant="caption" color="text.secondary">
                {label}
            </Typography>
            <Typography variant="subtitle2">{main}</Typography>
            {sub && (
                <Typography variant="body2" color="text.secondary">
                    {sub}
                </Typography>
            )}
        </Stack>
    );

    return (
        <>
            <title>{title}</title>
            <DashboardLayout>
                <DashboardContent maxWidth="xl">
                    <CustomBreadcrumbs
                        heading={title}
                        links={[
                            { name: __('pages/payments.breadcrumbs.dashboard'), href: route('dashboard', undefined, false) },
                            { name: __('pages/payments.title'), href: route(listRoute, undefined, false) },
                            { name: invoice.number },
                        ]}
                        sx={{ mb: { xs: 3, md: 5 } }}
                    />

                    {/* ✅ Двухколоночная компоновка как в JobDetailsView */}
                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: {
                                xs: '1fr',
                                md: '360px 1fr',
                            },
                            gap: 3,
                            alignItems: 'stretch',
                        }}
                    >
                        {/* LEFT CARD — big amount + round status */}
                        <Card
                            sx={{
                                p: 3,
                                minHeight: 420,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'stretch',
                                textAlign: 'center',
                                gap: 2.5,
                                borderRadius: 2,
                            }}
                        >
                            <Stack spacing={0.75} alignItems="center">
                                <Typography variant="body2" color="text.secondary">
                                    {createdAt}
                                </Typography>

                                <Typography variant="h2" sx={{ fontWeight: 700, letterSpacing: -0.5 }}>
                                    {`$ ${formatAmount(invoice.paid_amount, 2)}`}
                                </Typography>

                                <Typography variant="subtitle1" color="text.secondary">
                                    {`${formatAmount(invoice.paid_amount)} ${currencyCode}`}
                                </Typography>
                            </Stack>

                            <Box sx={{ flexGrow: 1 }} />

                            <Stack spacing={1.5} alignItems="center">
                                <Box
                                    sx={{
                                        width: 120,
                                        height: 120,
                                        borderRadius: '50%',
                                        display: 'grid',
                                        placeItems: 'center',
                                        bgcolor: statusColorValue,
                                        color: statusContrastText,
                                        boxShadow: (theme) => theme.shadows[8],
                                    }}
                                >
                                    <Iconify icon={statusIconName} width={56} />
                                </Box>

                                <Typography
                                    variant="h6"
                                    sx={{ fontWeight: 600, color: statusColorValue }}
                                >
                                    {statusLabel}
                                </Typography>
                            </Stack>

                            {status === 'created' && invoice.can_cancel && (
                                <Button fullWidth variant="outlined" color="error" onClick={handleCancelInvoice} sx={{ mt: 1 }}>
                                    {__('pages/payments.details.cancel')}
                                </Button>
                            )}
                        </Card>

                        {/* RIGHT CARD — details */}
                        <Card sx={{ p: 3, borderRadius: 2 }}>
                            {/* TOP META — строгая 2-колоночная сетка */}
                            <Box
                                sx={{
                                    display: 'grid',
                                    gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                                    columnGap: 2.5,
                                    rowGap: 2,
                                }}
                            >
                                <Row label={__('pages/payments.details.link')}>
                                    <Iconify icon="solar:link-bold" width={16} />
                                    <Typography component="span" sx={{ fontWeight: 600 }}>
                                        {invoice.number}
                                    </Typography>
                                </Row>

                                <Row label={__('pages/payments.details.status')}>
                                    <Iconify
                                        icon={statusIconName}
                                        width={16}
                                        sx={{ color: statusColorValue }}
                                    />
                                    <Typography component="span" sx={{ color: statusColorValue }}>
                                        {statusLabel}
                                    </Typography>
                                </Row>

                                <Row label={__('pages/payments.details.type')}>
                                    {__('pages/payments.details.income')}
                                </Row>

                                <Row label={__('pages/payments.details.project')}>
                                    {invoice.project?.ulid && invoice.project?.name ? (
                                        <Link
                                            href={route('projects.show', { project: invoice.project.ulid })}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            underline="hover"
                                            sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}
                                        >
                                            {invoice.project.name}
                                            <Iconify icon="solar:external-link-outline" width={14} />
                                        </Link>
                                    ) : (
                                        invoice.project?.name ?? '—'
                                    )}
                                </Row>

                                <Row label={__('pages/payments.details.date')}>{createdAt}</Row>
                                <Row label={__('pages/payments.details.completed_at')}>{completedAt}</Row>

                                <Row label={__('pages/payments.details.order_id')}>
                                    {invoice.external_order_id ?? '—'}
                                </Row>
                            </Box>

                            <Divider sx={{ my: 3 }} />

                            {/* CURRENCY / NETWORK */}
                            <Box
                                sx={{
                                    display: 'grid',
                                    gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                                    columnGap: 2.5,
                                    rowGap: 2,
                                    alignItems: 'center',
                                }}
                            >
                                <Row label={__('pages/payments.details.currency')}>
                                    <TokenNetworkAvatar
                                        tokenIcon={invoice.currency.tokenIcon}
                                        name={currencyName}
                                        size={28}
                                    />
                                    <Typography component="span">{currencyName}</Typography>
                                </Row>

                                <Row label={__('pages/payments.details.network')}>
                                    <TokenNetworkAvatar
                                        tokenIcon={invoice.currency.networkIcon}
                                        name={networkName}
                                        size={28}
                                    />
                                    <Typography component="span">{networkName}</Typography>
                                </Row>
                            </Box>

                            <Divider sx={{ my: 3 }} />

                            {/* AMOUNTS */}
                            <Box
                                sx={{
                                    display: 'grid',
                                    gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                                    columnGap: 2.5,
                                    rowGap: 2,
                                }}
                            >
                                <AmountRow
                                    label={__('pages/payments.details.amount')}
                                    main={`${formatAmount(invoice.amount)} ${currencyName}`}
                                />

                                <AmountRow
                                    label={__('pages/payments.table.amount_usd')}
                                    main={`$ ${formatAmount(invoice.amount_usd, 2)}`}
                                />

                                <AmountRow
                                    label={__('pages/payments.details.service_fee')}
                                    main={`${formatAmount(invoice.service_fee)} ${currencyName}`}
                                />

                                <AmountRow
                                    label={__('pages/payments.details.paid')}
                                    main={`${formatAmount(invoice.paid_amount)} ${currencyName}`}
                                />

                                <AmountRow
                                    label={__('pages/payments.details.transfer_fee')}
                                    main={`${formatAmount(invoice.transfer_fee)} ${currencyName}`}
                                />

                                <AmountRow
                                    label={__('pages/payments.details.credited')}
                                    main={`${formatAmount(invoice.credited_amount)} ${currencyName}`}
                                />
                            </Box>

                            <Divider sx={{ my: 3 }} />

                            {/* TX / ADDRESS */}
                            <Stack spacing={2}>
                                {invoice.address && (
                                    <Stack spacing={0.5}>
                                        <Typography variant="caption" color="text.secondary">
                                            {__('pages/payments.details.address')}
                                        </Typography>
                                        <Stack direction="row" spacing={0.75} alignItems="center">
                                            <Iconify icon="solar:wallet-bold" width={16} />
                                            <Typography variant="subtitle2">{invoice.address}</Typography>
                                        </Stack>
                                    </Stack>
                                )}

                                <Stack spacing={0.5}>
                                    <Typography variant="caption" color="text.secondary">
                                        {__('pages/payments.details.txids')}
                                    </Typography>

                                    <Stack spacing={0.75}>
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
                                                        <Link
                                                            href={explorerUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            underline="hover"
                                                            onClick={(e) => e.stopPropagation()}
                                                            sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, fontWeight: 600 }}
                                                        >
                                                            <Iconify icon="solar:link-bold" width={16} />
                                                            {formatTx(tx)}
                                                            <Iconify icon="solar:external-link-outline" width={14} />
                                                        </Link>
                                                    ) : (
                                                        <Stack direction="row" spacing={0.75} alignItems="center">
                                                            <Iconify icon="solar:link-bold" width={16} />
                                                            <Typography variant="subtitle2">{formatTx(tx)}</Typography>
                                                        </Stack>
                                                    )}
                                                </Tooltip>
                                            );
                                        })}
                                    </Stack>
                                </Stack>
                            </Stack>
                        </Card>
                    </Box>
                </DashboardContent>
            </DashboardLayout>
        </>
    );
}

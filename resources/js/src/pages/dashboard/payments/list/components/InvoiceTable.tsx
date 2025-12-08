import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';

import {Label} from 'src/components/label';
import {TokenNetworkAvatar} from 'src/components/token-network-avatar';
import {Iconify} from 'src/components/iconify';
import {formatAmount, formatTx, statusColor} from '../../utils';
import type {ColumnSetting, InvoiceRow} from '../../types';
import {useLang} from 'src/hooks/useLang';
import {route} from 'src/routes/route';

import type {InvoiceStatus} from '../../utils';

type Props = {
    columns: ColumnSetting[];
    invoices: InvoiceRow[];
    onRowClick: (invoice: InvoiceRow) => void;
};

const cellBaseSx = {
    whiteSpace: 'nowrap',
    verticalAlign: 'middle',
    textAlign: 'left',
    pl: 2,
} as const;

const CellContent = ({children}: { children: React.ReactNode }) => (
    <Stack
        direction="row"
        alignItems="center"
        justifyContent="flex-start"
        sx={{width: '100%', height: '100%'}}
    >
        {children}
    </Stack>
);

export function InvoiceTable({columns, invoices, onRowClick}: Props) {
    const {__} = useLang();
    const visibleColumns = columns.filter((column) => column.visible);

    if (invoices.length === 0) {
        return null;
    }

    return (
        <TableContainer>
            <Table>
                <TableHead>
                    <TableRow>
                        {visibleColumns.map((column) => (
                            <TableCell key={column.key} sx={cellBaseSx}>
                                {column.label}
                            </TableCell>
                        ))}
                    </TableRow>
                </TableHead>

                <TableBody>
                    {invoices.map((invoice) => {
                        // ✅ сузили тип один раз
                        const status = invoice.status as InvoiceStatus;

                        return (
                            <TableRow
                                key={invoice.id}
                                hover
                                onClick={() => onRowClick(invoice)}
                                sx={{cursor: 'pointer'}}
                            >
                                {visibleColumns.map((column) => {
                                    switch (column.key) {
                                        case 'status':
                                            return (
                                                <TableCell key={column.key} sx={cellBaseSx}>
                                                    <CellContent>
                                                        <Label color={statusColor[status] ?? 'info'}>
                                                            {__(`pages/payments.statuses.${status}`)}
                                                        </Label>
                                                    </CellContent>
                                                </TableCell>
                                            );

                                        case 'currency':
                                            return (
                                                <TableCell key={column.key} sx={cellBaseSx}>
                                                    <CellContent>
                                                        <TokenNetworkAvatar
                                                            tokenIcon={invoice.currency.tokenIcon}
                                                            networkIcon={invoice.currency.networkIcon}
                                                            name={invoice.currency.token ?? undefined}
                                                            size={24}
                                                        />

                                                        <Stack direction="row" spacing={0.5} alignItems="baseline"
                                                               sx={{ml: 1}}>
                                                            <Typography variant="subtitle2">
                                                                {invoice.currency.token}
                                                            </Typography>
                                                            <Typography variant="body2" color="text.secondary">
                                                                · {invoice.currency.network}
                                                            </Typography>
                                                        </Stack>
                                                    </CellContent>
                                                </TableCell>
                                            );

                                        case 'amount':
                                            return (
                                                <TableCell key={column.key} sx={cellBaseSx}>
                                                    {`${formatAmount(invoice.amount)} ${invoice.currency.token}`}
                                                </TableCell>
                                            );

                                        case 'amountUsd':
                                            return (
                                                <TableCell key={column.key} sx={cellBaseSx}>
                                                    {`$${formatAmount(invoice.amount_usd, 2)}`}
                                                </TableCell>
                                            );

                                        case 'paid':
                                            return (
                                                <TableCell key={column.key} sx={cellBaseSx}>
                                                    {`${formatAmount(invoice.paid_amount)} ${invoice.currency.token}`}
                                                </TableCell>
                                            );

                                        case 'serviceFee':
                                            return (
                                                <TableCell key={column.key} sx={cellBaseSx}>
                                                    {`${formatAmount(invoice.service_fee)} ${invoice.currency.token}`}
                                                </TableCell>
                                            );

                                        case 'transferFee':
                                            return (
                                                <TableCell key={column.key} sx={cellBaseSx}>
                                                    {`${formatAmount(invoice.transfer_fee)} ${invoice.currency.token}`}
                                                </TableCell>
                                            );

                                        case 'credited':
                                            return (
                                                <TableCell key={column.key} sx={cellBaseSx}>
                                                    {`${formatAmount(invoice.credited_amount)} ${invoice.currency.token}`}
                                                </TableCell>
                                            );

                                        case 'creditedUsd':
                                            return (
                                                <TableCell key={column.key} sx={cellBaseSx}>
                                                    {`$${formatAmount(invoice.credited_amount_usd, 2)}`}
                                                </TableCell>
                                            );

                                        case 'tx':
                                            return (
                                                <TableCell key={column.key} sx={cellBaseSx}>
                                                    <CellContent>
                                                        <Stack spacing={0.5} alignItems="flex-start">
                                                            {invoice.tx_ids.length === 0 && (
                                                                <Typography variant="body2" color="text.secondary">
                                                                    —
                                                                </Typography>
                                                            )}

                                                            {invoice.tx_ids.map((tx) => {
                                                                const explorerUrl =
                                                                    invoice.tx_explorer_url?.replace('{tx}', tx);

                                                                return (
                                                                    <Tooltip key={tx} title={tx} placement="top">
                                                                        {explorerUrl ? (
                                                                            <Link
                                                                                href={explorerUrl}
                                                                                target="_blank"
                                                                                rel="noopener noreferrer"
                                                                                onClick={(e) => e.stopPropagation()}
                                                                                underline="hover"
                                                                                sx={{
                                                                                    fontWeight: 600,
                                                                                    display: 'inline-flex',
                                                                                    alignItems: 'center',
                                                                                    gap: 0.5,
                                                                                }}
                                                                            >
                                                                                {formatTx(tx)}
                                                                                <Iconify
                                                                                    icon="solar:external-link-outline"
                                                                                    width={14}
                                                                                />
                                                                            </Link>
                                                                        ) : (
                                                                            <Typography variant="body2">
                                                                                {formatTx(tx)}
                                                                            </Typography>
                                                                        )}
                                                                    </Tooltip>
                                                                );
                                                            })}
                                                        </Stack>
                                                    </CellContent>
                                                </TableCell>
                                            );

                                        case 'number':
                                            return (
                                                <TableCell key={column.key} sx={cellBaseSx}>
                                                    {invoice.number}
                                                </TableCell>
                                            );

                                        case 'project':
                                            return (
                                                <TableCell key={column.key} sx={cellBaseSx}>
                                                    {invoice.project?.ulid ? (
                                                        <Link
                                                            href={route('projects.show', {
                                                                project: invoice.project.ulid,
                                                            })}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            onClick={(e) => e.stopPropagation()}
                                                            underline="hover"
                                                            sx={{
                                                                display: 'inline-flex',
                                                                alignItems: 'center',
                                                                gap: 0.5,
                                                                fontWeight: 600,
                                                            }}
                                                        >
                                                            {invoice.project.name}
                                                            <Iconify
                                                                icon="solar:external-link-outline"
                                                                width={14}
                                                            />
                                                        </Link>
                                                    ) : (
                                                        invoice.project?.name ?? '—'
                                                    )}
                                                </TableCell>
                                            );

                                        case 'date':
                                            return (
                                                <TableCell key={column.key} sx={cellBaseSx}>
                                                    {invoice.created_at ?? '—'}
                                                </TableCell>
                                            );

                                        default:
                                            return null;
                                    }
                                })}
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </TableContainer>
    );
}

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import { Label } from 'src/components/label';
import { TokenNetworkAvatar } from 'src/components/token-network-avatar';
import { formatAmount, formatTx, statusColor } from '../../utils';
import type { ColumnSetting, InvoiceRow } from '../../types';
import { useLang } from 'src/hooks/useLang';

// ----------------------------------------------------------------------

type Props = {
  columns: ColumnSetting[];
  invoices: InvoiceRow[];
  onRowClick: (invoice: InvoiceRow) => void;
};

export function InvoiceTable({ columns, invoices, onRowClick }: Props) {
  const { __ } = useLang();
  const visibleColumns = columns.filter((column) => column.visible);

  if (invoices.length === 0) {
    return null;
  }

  return (
    <TableContainer sx={{ mt: 3, overflowX: 'auto' }}>
      <Table sx={{ minWidth: 1200 }}>
        <TableHead>
          <TableRow>
            {visibleColumns.map((column) => (
              <TableCell key={column.key} sx={{ whiteSpace: 'nowrap' }}>
                {column.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {invoices.map((invoice) => (
            <TableRow key={invoice.id} hover onClick={() => onRowClick(invoice)} sx={{ cursor: 'pointer' }}>
              {visibleColumns.map((column) => {
                switch (column.key) {
                  case 'status':
                    return (
                      <TableCell key={column.key}>
                        <Label color={statusColor[invoice.status] ?? 'info'}>
                          {__(`pages/payments.statuses.${invoice.status}`)}
                        </Label>
                      </TableCell>
                    );
                  case 'currency':
                    return (
                      <TableCell key={column.key}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <TokenNetworkAvatar
                            tokenIcon={invoice.currency.tokenIcon}
                            networkIcon={invoice.currency.networkIcon}
                            name={invoice.currency.token ?? undefined}
                            size={24}
                          />
                          <Stack spacing={0.25}>
                            <Typography variant="subtitle2">{invoice.currency.token}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              {invoice.currency.network}
                            </Typography>
                          </Stack>
                        </Stack>
                      </TableCell>
                    );
                  case 'amount':
                    return <TableCell key={column.key}>{`${formatAmount(invoice.amount)} ${invoice.currency.token}`}</TableCell>;
                  case 'amountUsd':
                    return <TableCell key={column.key}>{`$${formatAmount(invoice.amount_usd, 2)}`}</TableCell>;
                  case 'paid':
                    return <TableCell key={column.key}>{`${formatAmount(invoice.paid_amount)} ${invoice.currency.token}`}</TableCell>;
                  case 'serviceFee':
                    return (
                      <TableCell key={column.key}>{`${formatAmount(invoice.service_fee)} ${invoice.currency.token}`}</TableCell>
                    );
                  case 'transferFee':
                    return (
                      <TableCell key={column.key}>{`${formatAmount(invoice.transfer_fee)} ${invoice.currency.token}`}</TableCell>
                    );
                  case 'credited':
                    return (
                      <TableCell key={column.key}>{`${formatAmount(invoice.credited_amount)} ${invoice.currency.token}`}</TableCell>
                    );
                  case 'creditedUsd':
                    return <TableCell key={column.key}>{`$${formatAmount(invoice.credited_amount_usd, 2)}`}</TableCell>;
                  case 'tx':
                    return (
                      <TableCell key={column.key}>
                        <Stack spacing={0.5}>
                          {invoice.tx_ids.length === 0 && (
                            <Typography variant="body2" color="text.secondary">
                              —
                            </Typography>
                          )}
                          {invoice.tx_ids.map((tx) => (
                            <Tooltip key={tx} title={tx} placement="top-start">
                              <Typography variant="body2" component="span">
                                {formatTx(tx)}
                              </Typography>
                            </Tooltip>
                          ))}
                        </Stack>
                      </TableCell>
                    );
                  case 'number':
                    return <TableCell key={column.key}>{invoice.number}</TableCell>;
                  case 'project':
                    return <TableCell key={column.key}>{invoice.project?.name ?? '—'}</TableCell>;
                  case 'date':
                    return <TableCell key={column.key}>{invoice.created_at ?? '—'}</TableCell>;
                  default:
                    return null;
                }
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

import { useEffect, useMemo, useRef, useState } from 'react';
import { router } from '@inertiajs/react';
import dayjs from 'dayjs';

import Stack from '@mui/material/Stack';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Checkbox from '@mui/material/Checkbox';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Tooltip from '@mui/material/Tooltip';
import InputAdornment from '@mui/material/InputAdornment';

import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateRangePicker, DateRange } from '@mui/lab';

import { DashboardContent, DashboardLayout } from 'src/layouts/dashboard';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { useLang } from 'src/hooks/useLang';
import { route } from 'src/routes/route';
import { Iconify } from 'src/components/iconify';
import { Label } from 'src/components/label';
import { SearchNotFound } from 'src/components/search-not-found';

// ----------------------------------------------------------------------

type InvoiceCurrency = {
  token?: string | null;
  tokenIcon?: string | null;
  code?: string | null;
  network?: string | null;
  networkIcon?: string | null;
};

type InvoiceProject = {
  id?: number;
  name?: string;
};

type InvoiceRow = {
  id: number;
  ulid: string;
  number: string;
  status: string;
  amount: string;
  amount_usd: string;
  paid_amount: string;
  service_fee: string | null;
  transfer_fee: string | null;
  credited_amount: string;
  credited_amount_usd: string;
  tx_ids: string[];
  project?: InvoiceProject | null;
  currency: InvoiceCurrency;
  created_at?: string | null;
};

type FilterState = {
  search: string;
  project_id?: number | null;
  currency?: string | null;
  status?: string | null;
  date_from?: string | null;
  date_to?: string | null;
};

type Option = {
  id: number | null;
  name: string;
  code?: string | null;
  icon?: string | null;
};

type ColumnKey =
  | 'status'
  | 'currency'
  | 'amount'
  | 'amountUsd'
  | 'paid'
  | 'serviceFee'
  | 'transferFee'
  | 'credited'
  | 'creditedUsd'
  | 'tx'
  | 'number'
  | 'project'
  | 'date';

type ColumnSetting = {
  key: ColumnKey;
  label: string;
  visible: boolean;
};

interface PaymentsProps {
  invoices: InvoiceRow[];
  filters: FilterState;
  projects: Option[];
  currencies: Option[];
  isAdmin: boolean;
}

// ----------------------------------------------------------------------

const statusColor: Record<string, 'warning' | 'error' | 'success' | 'info'> = {
  created: 'warning',
  canceled: 'error',
  paid: 'success',
  partial: 'info',
  overpaid: 'info',
};

// ----------------------------------------------------------------------

export default function PaymentsList({ invoices, filters: serverFilters, projects, currencies, isAdmin }: PaymentsProps) {
  const { __ } = useLang();

  const [filters, setFilters] = useState<FilterState>(serverFilters);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [columns, setColumns] = useState<ColumnSetting[]>([]);
  const [settingsColumns, setSettingsColumns] = useState<ColumnSetting[]>([]);
  const [dragKey, setDragKey] = useState<ColumnKey | null>(null);
  const [dateRange, setDateRange] = useState<DateRange<dayjs.Dayjs>>([
    serverFilters.date_from ? dayjs(serverFilters.date_from) : null,
    serverFilters.date_to ? dayjs(serverFilters.date_to) : null,
  ]);
  const mountedRef = useRef(false);

  const routeName = isAdmin ? 'payments.admin' : 'payments.index';
  const exportRouteName = isAdmin ? 'payments.admin.export' : 'payments.export';

  const statusOptions = useMemo(
    () => [
      { value: 'created', label: __('pages/payments.statuses.created') },
      { value: 'canceled', label: __('pages/payments.statuses.canceled') },
      { value: 'paid', label: __('pages/payments.statuses.paid') },
      { value: 'partial', label: __('pages/payments.statuses.partial') },
      { value: 'overpaid', label: __('pages/payments.statuses.overpaid') },
    ],
    [__]
  );

  const buildColumns = () => [
    { key: 'status', label: __('pages/payments.table.status'), visible: true },
    { key: 'currency', label: __('pages/payments.table.currency'), visible: true },
    { key: 'amount', label: __('pages/payments.table.amount'), visible: true },
    { key: 'amountUsd', label: __('pages/payments.table.amount_usd'), visible: true },
    { key: 'paid', label: __('pages/payments.table.paid'), visible: true },
    { key: 'serviceFee', label: __('pages/payments.table.service_fee'), visible: true },
    { key: 'transferFee', label: __('pages/payments.table.transfer_fee'), visible: true },
    { key: 'credited', label: __('pages/payments.table.credited'), visible: true },
    { key: 'creditedUsd', label: __('pages/payments.table.credited_usd'), visible: true },
    { key: 'tx', label: __('pages/payments.table.txids'), visible: true },
    { key: 'number', label: __('pages/payments.table.number'), visible: true },
    { key: 'project', label: __('pages/payments.table.project'), visible: true },
    { key: 'date', label: __('pages/payments.table.date'), visible: true },
  ];

  useEffect(() => {
    const prepared = buildColumns();
    setColumns(prepared);
    setSettingsColumns(prepared);
  }, [__]);

  useEffect(() => {
    setFilters(serverFilters);
    setDateRange([
      serverFilters.date_from ? dayjs(serverFilters.date_from) : null,
      serverFilters.date_to ? dayjs(serverFilters.date_to) : null,
    ]);
  }, [serverFilters]);

  const handleFilterChange = (key: keyof FilterState, value: string | number | null) => {
    const nextFilters = { ...filters, [key]: value } as FilterState;
    setFilters(nextFilters);

    if (key !== 'search') {
      submitFilters(nextFilters);
    }
  };

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      return undefined;
    }
    const handler = setTimeout(() => submitFilters(filters), 400);
    return () => clearTimeout(handler);
  }, [filters.search]);

  const submitFilters = (values: FilterState) => {
    const query: Record<string, any> = {};
    if (values.search) query.search = values.search;
    if (values.project_id) query.project_id = values.project_id;
    if (values.currency) query.currency = values.currency;
    if (values.status) query.status = values.status;
    if (values.date_from) query.date_from = values.date_from;
    if (values.date_to) query.date_to = values.date_to;

    router.get(route(routeName), query, { preserveScroll: true, preserveState: true, replace: true });
  };

  const handleDateRangeChange = (value: DateRange<dayjs.Dayjs>) => {
    setDateRange(value);
    const [from, to] = value;
    const updated: FilterState = {
      ...filters,
      date_from: from ? from.format('YYYY-MM-DD') : null,
      date_to: to ? to.format('YYYY-MM-DD') : null,
    };
    setFilters(updated);
    submitFilters(updated);
  };

  const handleResetFilters = () => {
    const resetValues: FilterState = {
      search: '',
      project_id: null,
      currency: null,
      status: null,
      date_from: null,
      date_to: null,
    };
    setFilters(resetValues);
    setDateRange([null, null]);
    submitFilters(resetValues);
  };

  const handleExport = () => {
    const query = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        query.append(key, String(value));
      }
    });
    const url = route(exportRouteName);
    window.location.href = query.toString() ? `${url}?${query.toString()}` : url;
  };

  const toggleColumnVisibility = (key: ColumnKey) => {
    setSettingsColumns((prev) => prev.map((column) => (column.key === key ? { ...column, visible: !column.visible } : column)));
  };

  const handleSettingsSave = () => {
    const visibleColumns = settingsColumns.some((column) => column.visible);
    if (!visibleColumns) {
      return;
    }
    setColumns(settingsColumns);
    setSettingsOpen(false);
  };

  const startDrag = (key: ColumnKey) => setDragKey(key);

  const handleDrop = (targetKey: ColumnKey) => {
    if (!dragKey || dragKey === targetKey) return;

    setSettingsColumns((prev) => {
      const currentIndex = prev.findIndex((col) => col.key === dragKey);
      const targetIndex = prev.findIndex((col) => col.key === targetKey);
      if (currentIndex === -1 || targetIndex === -1) return prev;
      const updated = [...prev];
      const [moved] = updated.splice(currentIndex, 1);
      updated.splice(targetIndex, 0, moved);
      return updated;
    });
    setDragKey(null);
  };

  const formatAmount = (value: string | null, maximumFractionDigits = 8) => {
    if (value == null) return '—';
    return Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits });
  };

  const formatTx = (value: string) => (value.length <= 8 ? value : `${value.slice(0, 4)}...${value.slice(-4)}`);

  const visibleColumns = columns.filter((column) => column.visible);

  const filteredInvoices = useMemo(() => invoices, [invoices]);

  const title = isAdmin ? __('pages/payments.title_admin') : __('pages/payments.title');

  return (
    <>
      <title>{title}</title>
      <DashboardLayout>
        <DashboardContent maxWidth="xl">
          <CustomBreadcrumbs
            heading={title}
            links={[
              { name: __('pages/payments.breadcrumbs.dashboard'), href: route('dashboard', undefined, false) },
              { name: title },
            ]}
            action={
              <Stack direction="row" spacing={1}>
                <Chip
                  color="primary"
                  variant="soft"
                  label={__('pages/payments.export')}
                  onClick={handleExport}
                  icon={<Iconify icon="solar:export-bold" width={18} />}
                />
                <Chip
                  variant="outlined"
                  label={__('pages/payments.settings')}
                  onClick={() => setSettingsOpen(true)}
                  icon={<Iconify icon="solar:settings-bold" width={18} />}
                />
              </Stack>
            }
            sx={{ mb: { xs: 3, md: 5 } }}
          />

          <Card sx={{ p: 3 }}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <Stack
                direction="row"
                spacing={1.5}
                alignItems="center"
                flexWrap="wrap"
                divider={<Divider flexItem orientation="vertical" />}
              >
                <TextField
                  value={filters.search}
                  onChange={(event) => handleFilterChange('search', event.target.value)}
                  placeholder={__('pages/payments.search')}
                  size="small"
                  sx={{ minWidth: { xs: '100%', md: 220 } }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Iconify icon="solar:magnifer-linear" width={20} />
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  select
                  label={__('pages/payments.filters.project')}
                  value={filters.project_id ?? ''}
                  onChange={(event) => handleFilterChange('project_id', event.target.value ? Number(event.target.value) : null)}
                  size="small"
                  sx={{ minWidth: { xs: '100%', md: 150 } }}
                >
                  <MenuItem value="">{__('pages/payments.filters.all')}</MenuItem>
                  {projects.map((project) => (
                    <MenuItem key={project.id ?? project.name} value={project.id ?? ''}>
                      {project.name}
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  select
                  label={__('pages/payments.filters.currency')}
                  value={filters.currency ?? ''}
                  onChange={(event) => handleFilterChange('currency', event.target.value || null)}
                  size="small"
                  sx={{ minWidth: { xs: '100%', md: 170 } }}
                  SelectProps={{
                    renderValue: (value) => {
                      if (!value) return __('pages/payments.filters.all');
                      const selected = currencies.find((currency) => currency.code === value || currency.name === value);
                      if (!selected) return value;
                      return (
                        <Stack direction="row" spacing={1} alignItems="center">
                          {selected.icon && <Avatar src={selected.icon} sx={{ width: 24, height: 24 }} />}
                          <span>{selected.code ? `${selected.code} — ${selected.name}` : selected.name}</span>
                        </Stack>
                      );
                    },
                  }}
                >
                  <MenuItem value="">{__('pages/payments.filters.all')}</MenuItem>
                  {currencies.map((currency) => (
                    <MenuItem key={`${currency.code}-${currency.name}`} value={currency.code ?? currency.name}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        {currency.icon && <Avatar src={currency.icon} sx={{ width: 24, height: 24 }} />}
                        <span>{currency.code ? `${currency.code} — ${currency.name}` : currency.name}</span>
                      </Stack>
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  select
                  label={__('pages/payments.filters.status')}
                  value={filters.status ?? ''}
                  onChange={(event) => handleFilterChange('status', event.target.value || null)}
                  size="small"
                  sx={{ minWidth: { xs: '100%', md: 170 } }}
                >
                  <MenuItem value="">{__('pages/payments.filters.all')}</MenuItem>
                  {statusOptions.map((status) => (
                    <MenuItem key={status.value} value={status.value}>
                      {status.label}
                    </MenuItem>
                  ))}
                </TextField>

                <DateRangePicker
                  value={dateRange}
                  onChange={handleDateRangeChange}
                  calendars={2}
                  renderInput={(startProps, endProps) => (
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: { xs: '100%', md: 260 } }}>
                      <TextField
                        {...startProps}
                        label={__('pages/payments.filters.date_range')}
                        size="small"
                        fullWidth
                      />
                      <TextField {...endProps} label={null} size="small" sx={{ display: 'none' }} />
                    </Stack>
                  )}
                />

                <Button variant="outlined" color="inherit" onClick={handleResetFilters} size="small" sx={{ minWidth: 120 }}>
                  {__('pages/payments.filters.clear')}
                </Button>
              </Stack>
            </LocalizationProvider>

            <TableContainer sx={{ mt: 3 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    {visibleColumns.map((column) => (
                      <TableCell key={column.key}>{column.label}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredInvoices.map((invoice) => (
                    <TableRow key={invoice.id} hover>
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
                                  {invoice.currency.tokenIcon && <Avatar src={invoice.currency.tokenIcon} variant="rounded" sx={{ width: 32, height: 32 }} />}
                                  {invoice.currency.networkIcon && (
                                    <Avatar src={invoice.currency.networkIcon} variant="rounded" sx={{ width: 32, height: 32 }} />
                                  )}
                                  <Stack spacing={0.25}>
                                    <Typography variant="body2">{invoice.currency.token}</Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      {invoice.currency.network}
                                    </Typography>
                                  </Stack>
                                </Stack>
                              </TableCell>
                            );
                          case 'amount':
                            return (
                              <TableCell key={column.key}>
                                {formatAmount(invoice.amount)} {invoice.currency.token}
                              </TableCell>
                            );
                          case 'amountUsd':
                            return <TableCell key={column.key}>${formatAmount(invoice.amount_usd)}</TableCell>;
                          case 'paid':
                            return <TableCell key={column.key}>{formatAmount(invoice.paid_amount)}</TableCell>;
                          case 'serviceFee':
                            return <TableCell key={column.key}>{formatAmount(invoice.service_fee)}</TableCell>;
                          case 'transferFee':
                            return <TableCell key={column.key}>{formatAmount(invoice.transfer_fee)}</TableCell>;
                          case 'credited':
                            return <TableCell key={column.key}>{formatAmount(invoice.credited_amount)}</TableCell>;
                          case 'creditedUsd':
                            return <TableCell key={column.key}>${formatAmount(invoice.credited_amount_usd)}</TableCell>;
                          case 'tx':
                            return (
                              <TableCell key={column.key}>
                                <Stack spacing={0.5}>
                                  {invoice.tx_ids.map((tx) => (
                                    <Tooltip key={tx} title={tx} placement="top">
                                      <Typography variant="body2" component="span">
                                        {formatTx(tx)}
                                      </Typography>
                                    </Tooltip>
                                  ))}
                                  {invoice.tx_ids.length === 0 && '—'}
                                </Stack>
                              </TableCell>
                            );
                          case 'number':
                            return <TableCell key={column.key}>{invoice.number}</TableCell>;
                          case 'project':
                            return <TableCell key={column.key}>{invoice.project?.name ?? '—'}</TableCell>;
                          case 'date':
                            return <TableCell key={column.key}>{invoice.created_at}</TableCell>;
                          default:
                            return null;
                        }
                      })}
                    </TableRow>
                  ))}

                  {filteredInvoices.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={visibleColumns.length}>
                        <Stack alignItems="center" sx={{ py: 4 }}>
                          <SearchNotFound query={filters.search} />
                        </Stack>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </DashboardContent>
      </DashboardLayout>

      <Dialog open={settingsOpen} onClose={() => setSettingsOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{__('pages/payments.settings')}</DialogTitle>
        <DialogContent>
          <List dense>
            {settingsColumns.map((column) => (
              <ListItem
                key={column.key}
                disableGutters
                draggable
                onDragStart={() => startDrag(column.key)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={() => handleDrop(column.key)}
                secondaryAction={
                  <Checkbox
                    edge="end"
                    checked={column.visible}
                    onChange={() => toggleColumnVisibility(column.key)}
                    inputProps={{ 'aria-label': column.label }}
                  />
                }
              >
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <Iconify icon="solar:menu-dots-bold" />
                </ListItemIcon>
                <ListItemText primary={column.label} />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button color="inherit" onClick={() => setSettingsOpen(false)}>
            {__('pages/payments.close')}
          </Button>
          <Button variant="contained" onClick={handleSettingsSave}>
            {__('pages/payments.save')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

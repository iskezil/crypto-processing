import { useEffect, useMemo, useRef, useState } from 'react';
import { router } from '@inertiajs/react';
import dayjs from 'dayjs';

import Stack from '@mui/material/Stack';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';

import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

import { DashboardContent, DashboardLayout } from 'src/layouts/dashboard';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { useLang } from 'src/hooks/useLang';
import { route } from 'src/routes/route';
import { Iconify } from 'src/components/iconify';
import { SearchNotFound } from 'src/components/search-not-found';

import type { ColumnSetting, DateRangeValue, FilterState, InvoiceRow, Option } from '../types';
import { buildColumns, toStatusOptions } from '../utils';
import { FiltersBar } from './components/FiltersBar';
import { FiltersChips } from './components/FiltersChips';
import { InvoiceTable } from './components/InvoiceTable';
import { ColumnSettingsDialog } from './components/ColumnSettingsDialog';

type PaymentsProps = {
  invoices: InvoiceRow[];
  filters: FilterState;
  projects: Option[];
  currencies: Option[];
  isAdmin: boolean;
};

export default function PaymentsList({ invoices, filters: serverFilters, projects, currencies, isAdmin }: PaymentsProps) {
  const { __ } = useLang();
  const mountedRef = useRef(false);

  const normalizeArray = <T,>(value: T[] | T | null | undefined): T[] => {
    if (Array.isArray(value)) return value.filter((item) => item !== null && item !== undefined) as T[];
    if (value !== null && value !== undefined) return [value as T];
    return [];
  };

  const [filters, setFilters] = useState<FilterState>({
    search: serverFilters.search ?? '',
    project_id: normalizeArray<number>(serverFilters.project_id),
    currency: normalizeArray<string>(serverFilters.currency),
    status: normalizeArray<string>(serverFilters.status),
    date_from: serverFilters.date_from ?? null,
    date_to: serverFilters.date_to ?? null,
  });

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [columns, setColumns] = useState<ColumnSetting[]>([]);
  const [settingsColumns, setSettingsColumns] = useState<ColumnSetting[]>([]);
  const [dateRange, setDateRange] = useState<DateRangeValue>([
    serverFilters.date_from ? dayjs(serverFilters.date_from) : null,
    serverFilters.date_to ? dayjs(serverFilters.date_to) : null,
  ]);

  const routeName = isAdmin ? 'payments.admin' : 'payments.index';
  const exportRouteName = isAdmin ? 'payments.admin.export' : 'payments.export';
  const detailRouteName = isAdmin ? 'payments.admin.show' : 'payments.show';

  const statusOptions = useMemo(() => toStatusOptions(__), [__]);

  useEffect(() => {
    const labels = {
      status: __('pages/payments.table.status'),
      currency: __('pages/payments.table.currency'),
      amount: __('pages/payments.table.amount'),
      amountUsd: __('pages/payments.table.amount_usd'),
      paid: __('pages/payments.table.paid'),
      serviceFee: __('pages/payments.table.service_fee'),
      transferFee: __('pages/payments.table.transfer_fee'),
      credited: __('pages/payments.table.credited'),
      creditedUsd: __('pages/payments.table.credited_usd'),
      tx: __('pages/payments.table.txids'),
      number: __('pages/payments.table.number'),
      project: __('pages/payments.table.project'),
      date: __('pages/payments.table.date'),
    } as const;

    const prepared = buildColumns(labels);
    setColumns(prepared);
    setSettingsColumns(prepared);
  }, [__]);

  useEffect(() => {
    setFilters({
      search: serverFilters.search ?? '',
      project_id: normalizeArray<number>(serverFilters.project_id),
      currency: normalizeArray<string>(serverFilters.currency),
      status: normalizeArray<string>(serverFilters.status),
      date_from: serverFilters.date_from ?? null,
      date_to: serverFilters.date_to ?? null,
    });

    setDateRange([
      serverFilters.date_from ? dayjs(serverFilters.date_from) : null,
      serverFilters.date_to ? dayjs(serverFilters.date_to) : null,
    ]);
  }, [serverFilters]);

  const handleFilterChange = (key: keyof FilterState, value: any) => {
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
    if (values.project_id.length) query.project_id = values.project_id;
    if (values.currency.length) query.currency = values.currency;
    if (values.status.length) query.status = values.status;
    if (values.date_from) query.date_from = values.date_from;
    if (values.date_to) query.date_to = values.date_to;

    router.get(route(routeName), query, { preserveScroll: true, preserveState: true, replace: true });
  };

  const handleDateRangeChange = (newRange: DateRangeValue) => {
    setDateRange(newRange);
    const [from, to] = newRange;

    const updated: FilterState = {
      ...filters,
      date_from: from ? from.format('YYYY-MM-DD') : null,
      date_to: to ? to.format('YYYY-MM-DD') : null,
    };

    setFilters(updated);
    submitFilters(updated);
  };

  const handleClearFilter = (key: keyof FilterState, value?: string | number) => {
    const updated: FilterState = { ...filters };

    if (key === 'search') {
      updated.search = '';
    } else if (key === 'project_id' && typeof value !== 'undefined') {
      updated.project_id = filters.project_id.filter((id) => id !== value);
    } else if (key === 'currency' && typeof value === 'string') {
      updated.currency = filters.currency.filter((item) => item !== value);
    } else if (key === 'status' && typeof value === 'string') {
      updated.status = filters.status.filter((item) => item !== value);
    } else if (key === 'date_from' || key === 'date_to') {
      updated.date_from = null;
      updated.date_to = null;
      setDateRange([null, null]);
    }

    setFilters(updated);
    submitFilters(updated);
  };

  const handleExport = () => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((item) => params.append(`${key}[]`, String(item)));
      } else if (value) {
        params.append(key, String(value));
      }
    });

    const url = route(exportRouteName);
    window.location.href = params.toString() ? `${url}?${params.toString()}` : url;
  };

  const handleSaveColumns = () => {
    if (settingsColumns.some((column) => column.visible)) {
      setColumns(settingsColumns);
    }
  };

  const filteredInvoices = useMemo(() => invoices, [invoices]);
  const title = isAdmin ? __('pages/payments.title_admin') : __('pages/payments.title');

  const handleSelectInvoice = (invoice: InvoiceRow) => {
    console.log('invoice.ulid', invoice.ulid);
    router.get(route(detailRouteName, { invoice: invoice.ulid }));
  };

  const visibleColumns = columns.filter((column) => column.visible);

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

          <Card>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <FiltersBar
                filters={filters}
                projects={projects}
                currencies={currencies}
                statuses={statusOptions}
                dateRange={dateRange}
                onFilterChange={handleFilterChange}
                onDateRangeChange={handleDateRangeChange}
              />
            </LocalizationProvider>

            <Divider sx={{ mb: 2 }} />

            <FiltersChips
              filters={filters}
              projects={projects}
              currencies={currencies}
              statuses={statusOptions}
              onClearFilter={handleClearFilter}
            />

            {filteredInvoices.length === 0 && (
              <Box sx={{ pt: 3 }}>
                <SearchNotFound sx={{ py: 5 }} query={filters.search} />
              </Box>
            )}

            {visibleColumns.length > 0 && (
              <InvoiceTable columns={columns} invoices={filteredInvoices} onRowClick={handleSelectInvoice} />
            )}
          </Card>
        </DashboardContent>
      </DashboardLayout>

      <ColumnSettingsDialog
        open={settingsOpen}
        columns={settingsColumns}
        onChange={setSettingsColumns}
        onClose={() => setSettingsOpen(false)}
        onSave={handleSaveColumns}
      />
    </>
  );
}

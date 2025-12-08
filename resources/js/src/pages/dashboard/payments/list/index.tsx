import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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

import type {
  ColumnSetting,
  CurrencyOption,
  DateRangeValue,
  FilterState,
  InvoiceRow,
  ProjectOption,
} from '../types';
import { buildColumns, toStatusOptions } from '../utils';
import { FiltersBar } from './components/FiltersBar';
import { FiltersChips } from './components/FiltersChips';
import { InvoiceTable } from './components/InvoiceTable';
import { ColumnSettingsDialog } from './components/ColumnSettingsDialog';
import {Scrollbar} from "@/components/scrollbar";
import {InvoiceAnalytic} from "@/pages/dashboard/payments/list/components/InvoiceAnalytic";
import {useTheme} from "@mui/material/styles";

type PaymentsProps = {
  invoices: InvoiceRow[];
  filters: FilterState;
  projects: ProjectOption[];
  currencies: CurrencyOption[];
  isAdmin: boolean;
};

// ----------------------------- helpers -----------------------------

const normalizeArray = <T,>(value: T[] | T | null | undefined): T[] => {
  if (Array.isArray(value)) return value.filter((v): v is T => v !== null && v !== undefined);
  if (value !== null && value !== undefined) return [value];
  return [];
};

const toQueryParams = (values: FilterState) => {
  const query: Record<string, any> = {};
  if (values.search) query.search = values.search;
  if (values.project_id.length) query.project_id = values.project_id;
  if (values.currency.length) query.currency = values.currency;
  if (values.status.length) query.status = values.status;
  if (values.date_from) query.date_from = values.date_from;
  if (values.date_to) query.date_to = values.date_to;
  return query;
};

export default function PaymentsList({
                                       invoices,
                                       filters: serverFilters,
                                       projects,
                                       currencies,
                                       isAdmin,
                                     }: PaymentsProps) {
  const { __ } = useLang();

  // ----------------------------- routes -----------------------------

  const routeName = isAdmin ? 'payments.admin' : 'payments.index';
  const exportRouteName = isAdmin ? 'payments.admin.export' : 'payments.export';
  const detailRouteName = isAdmin ? 'payments.admin.show' : 'payments.show';

  // ----------------------------- derived/memo -----------------------------

  const statusOptions = useMemo(() => toStatusOptions(__), [__]);

  // стабилизируем зависимости по строкам переводов
  const labelStatus = __('pages/payments.table.status');
  const labelCurrency = __('pages/payments.table.currency');
  const labelAmount = __('pages/payments.table.amount');
  const labelAmountUsd = __('pages/payments.table.amount_usd');
  const labelPaid = __('pages/payments.table.paid');
  const labelServiceFee = __('pages/payments.table.service_fee');
  const labelTransferFee = __('pages/payments.table.transfer_fee');
  const labelCredited = __('pages/payments.table.credited');
  const labelCreditedUsd = __('pages/payments.table.credited_usd');
  const labelTx = __('pages/payments.table.txids');
  const labelNumber = __('pages/payments.table.number');
  const labelProject = __('pages/payments.table.project');
  const labelDate = __('pages/payments.table.date');
const theme = useTheme();
  const preparedColumns = useMemo(() => {
    const labels = {
      status: labelStatus,
      currency: labelCurrency,
      amount: labelAmount,
      amountUsd: labelAmountUsd,
      paid: labelPaid,
      serviceFee: labelServiceFee,
      transferFee: labelTransferFee,
      credited: labelCredited,
      creditedUsd: labelCreditedUsd,
      tx: labelTx,
      number: labelNumber,
      project: labelProject,
      date: labelDate,
    } as const;

    return buildColumns(labels);
  }, [
    labelStatus,
    labelCurrency,
    labelAmount,
    labelAmountUsd,
    labelPaid,
    labelServiceFee,
    labelTransferFee,
    labelCredited,
    labelCreditedUsd,
    labelTx,
    labelNumber,
    labelProject,
    labelDate,
  ]);

  const filteredInvoices = useMemo(() => invoices, [invoices]);
  const title = isAdmin ? __('pages/payments.title_admin') : __('pages/payments.title');

  // ----------------------------- state -----------------------------

  const [filters, setFilters] = useState<FilterState>(() => ({
    search: serverFilters.search ?? '',
    project_id: normalizeArray<number>(serverFilters.project_id),
    currency: normalizeArray<string>(serverFilters.currency),
    status: normalizeArray<string>(serverFilters.status),
    date_from: serverFilters.date_from ?? null,
    date_to: serverFilters.date_to ?? null,
  }));

  const [dateRange, setDateRange] = useState<DateRangeValue>(() => [
    serverFilters.date_from ? dayjs(serverFilters.date_from) : null,
    serverFilters.date_to ? dayjs(serverFilters.date_to) : null,
  ]);

  const [settingsOpen, setSettingsOpen] = useState(false);

  // применённые колонки (влияют на таблицу)
  const [columns, setColumns] = useState<ColumnSetting[]>(preparedColumns);

  // колонки внутри диалога (черновик)
  const [settingsColumns, setSettingsColumns] = useState<ColumnSetting[]>(preparedColumns);

  const lastSubmittedSearchRef = useRef(serverFilters.search ?? '');
  const mountedRef = useRef(false);

  // ✅ НОВОЕ: всегда держим самые свежие filters в ref, чтобы debounce не сабмитил "старый" search
  const latestFiltersRef = useRef<FilterState>(filters);
  useEffect(() => {
    latestFiltersRef.current = filters;
  }, [filters]);

  // ----------------------------- effects -----------------------------

  /**
   * при смене языка:
   * - обновляем labels
   * - сохраняем порядок и visible из текущих columns
   */
  useEffect(() => {
    setColumns((prevApplied) => {
      const prevByKey = new Map(prevApplied.map((c) => [c.key, c]));

      const merged = prevApplied.length
        ? prevApplied
          .map((prevCol) => {
            const fresh = preparedColumns.find((c) => c.key === prevCol.key);
            return fresh ? { ...fresh, visible: prevCol.visible } : prevCol;
          })
          .concat(preparedColumns.filter((c) => !prevByKey.has(c.key)))
        : preparedColumns;

      if (!settingsOpen) {
        setSettingsColumns(merged);
      }

      return merged;
    });
  }, [preparedColumns, settingsOpen]);

  /**
   * при открытии диалога:
   * берём текущие применённые columns как стартовое состояние настроек
   */
  useEffect(() => {
    if (settingsOpen) {
      setSettingsColumns(columns);
    }
  }, [settingsOpen, columns]);

  // Sync local filters/dateRange from server filters
  useEffect(() => {
    setFilters((prev) => ({
      search:
        serverFilters.search === lastSubmittedSearchRef.current
          ? serverFilters.search ?? ''
          : prev.search,
      project_id: normalizeArray<number>(serverFilters.project_id),
      currency: normalizeArray<string>(serverFilters.currency),
      status: normalizeArray<string>(serverFilters.status),
      date_from: serverFilters.date_from ?? null,
      date_to: serverFilters.date_to ?? null,
    }));

    setDateRange([
      serverFilters.date_from ? dayjs(serverFilters.date_from) : null,
      serverFilters.date_to ? dayjs(serverFilters.date_to) : null,
    ]);
  }, [serverFilters]);

  // ✅ ИЗМЕНЕНО: debounce search сабмитит latestFiltersRef.current
  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      return;
    }

    const t = window.setTimeout(() => {
      submitFilters(latestFiltersRef.current);
    }, 400);

    return () => window.clearTimeout(t);
  }, [filters.search]); // intentionally only search

  // ----------------------------- actions -----------------------------

  const submitFilters = useCallback(
    (values: FilterState) => {
      lastSubmittedSearchRef.current = values.search ?? '';
      router.get(route(routeName), toQueryParams(values), {
        preserveScroll: true,
        preserveState: true,
        replace: true,
      });
    },
    [routeName]
  );

  const handleFilterChange = useCallback(
    (key: keyof FilterState, value: any) => {
      setFilters((prev) => {
        const next = { ...prev, [key]: value } as FilterState;
        if (key !== 'search') submitFilters(next);
        return next;
      });
    },
    [submitFilters]
  );

  const handleDateRangeChange = useCallback(
    (newRange: DateRangeValue) => {
      setDateRange(newRange);
      const [from, to] = newRange;

      setFilters((prev) => {
        const updated: FilterState = {
          ...prev,
          date_from: from ? from.format('YYYY-MM-DD') : null,
          date_to: to ? to.format('YYYY-MM-DD') : null,
        };
        submitFilters(updated);
        return updated;
      });
    },
    [submitFilters]
  );

  const handleClearFilter = useCallback(
    (key: keyof FilterState, value?: string | number) => {
      setFilters((prev) => {
        let updated = prev;

        switch (key) {
          case 'search':
            updated = { ...prev, search: '' };
            break;

          case 'project_id':
            if (typeof value === 'number') {
              updated = {
                ...prev,
                project_id: prev.project_id.filter((id) => id !== value),
              };
            }
            break;

          case 'currency':
            if (typeof value === 'string') {
              updated = {
                ...prev,
                currency: prev.currency.filter((c) => c !== value),
              };
            }
            break;

          case 'status':
            if (typeof value === 'string') {
              updated = {
                ...prev,
                status: prev.status.filter((s) => s !== value),
              };
            }
            break;

          case 'date_from':
          case 'date_to':
            updated = { ...prev, date_from: null, date_to: null };
            setDateRange([null, null]);
            break;

          default:
            break;
        }

        if (updated !== prev) submitFilters(updated);
        return updated;
      });
    },
    [submitFilters]
  );

  const handleExport = useCallback(() => {
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
  }, [filters, exportRouteName]);

  const handleSaveColumns = useCallback(() => {
    if (settingsColumns.some((c) => c.visible)) {
      setColumns(settingsColumns);
    }
  }, [settingsColumns]);

  const handleSelectInvoice = useCallback(
    (invoice: InvoiceRow) => {
      router.get(route(detailRouteName, { invoice: invoice.ulid }));
    },
    [detailRouteName]
  );

  const visibleColumns = useMemo(
    () => columns.filter((c) => c.visible),
    [columns]
  );

  // ----------------------------- render -----------------------------

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

          <Card sx={{ mb: { xs: 3, md: 5 } }}>
            <Scrollbar sx={{ minHeight: 108 }}>
              <Stack
                divider={<Divider orientation="vertical" flexItem sx={{ borderStyle: 'dashed' }} />}
                sx={{ py: 2, flexDirection: 'row' }}
              >
                <InvoiceAnalytic
                  title="Total"
                  total={100}
                  percent={100}
                  price={100}
                  icon="solar:bill-list-bold-duotone"
                  color={theme.vars.palette.info.main}
                />

                <InvoiceAnalytic
                  title="Paid"
                  total={100}
                  percent={100}
                  price={100}
                  icon="solar:file-check-bold-duotone"
                  color={theme.vars.palette.success.main}
                />

                <InvoiceAnalytic
                  title="Overpaid"
                  total={100}
                  percent={100}
                  price={100}
                  icon="solar:wallet-money-bold"
                  color={theme.vars.palette.secondary.main}
                />

                <InvoiceAnalytic
                  title="Partial"
                  total={100}
                  percent={100}
                  price={100}
                  icon="solar:pie-chart-2-bold"
                  color={theme.vars.palette.warning.main}
                />

                <InvoiceAnalytic
                  title="Canceled"
                  total={100}
                  percent={100}
                  price={100}
                  icon="solar:clock-circle-bold"
                  color={theme.vars.palette.error.main}
                />

                <InvoiceAnalytic
                  title="created"
                  total={100}
                  percent={100}
                  price={100}
                  icon="solar:sort-by-time-bold-duotone"
                  color={theme.vars.palette.warning.main}
                />
              </Stack>
            </Scrollbar>
          </Card>

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
              <InvoiceTable columns={visibleColumns} invoices={filteredInvoices} onRowClick={handleSelectInvoice} />
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

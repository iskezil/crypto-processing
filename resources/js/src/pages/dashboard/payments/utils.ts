import type { ColumnSetting, ColumnKey, StatusOption } from './types';

// ----------------------------------------------------------------------
// ✅ 1) Строгий union статусов
export type InvoiceStatus = 'paid' | 'overpaid' | 'partial' | 'canceled' | 'created';

// ✅ 2) Строго типизированные схемы цветов/иконок
export const statusColor: Record<InvoiceStatus, 'warning' | 'error' | 'success' | 'info'> = {
  created: 'warning',
  canceled: 'error',
  paid: 'success',
  partial: 'info',
  overpaid: 'info',
};

export const statusIcon: Record<InvoiceStatus, string> = {
  paid: 'solar:check-circle-bold',
  overpaid: 'solar:wallet-money-bold',
  partial: 'solar:check-circle-line-duotone',
  canceled: 'solar:close-circle-bold',
  created: 'solar:clock-circle-bold',
};

// ----------------------------------------------------------------------

export const buildColumns = (labels: Record<ColumnKey, string>): ColumnSetting[] => [
  { key: 'status', label: labels.status, visible: true },
  { key: 'currency', label: labels.currency, visible: true },
  { key: 'amount', label: labels.amount, visible: true },
  { key: 'amountUsd', label: labels.amountUsd, visible: true },
  { key: 'paid', label: labels.paid, visible: true },
  { key: 'serviceFee', label: labels.serviceFee, visible: true },
  { key: 'transferFee', label: labels.transferFee, visible: true },
  { key: 'credited', label: labels.credited, visible: true },
  { key: 'creditedUsd', label: labels.creditedUsd, visible: true },
  { key: 'tx', label: labels.tx, visible: true },
  { key: 'number', label: labels.number, visible: true },
  { key: 'project', label: labels.project, visible: true },
  { key: 'date', label: labels.date, visible: true },
];

export const formatAmount = (value: string | null, maximumFractionDigits = 8) => {
  if (value == null) return '—';
  return Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits });
};

export const formatTx = (value: string) =>
    value.length <= 8 ? value : `${value.slice(0, 4)}...${value.slice(-4)}`;

export const toStatusOptions = (translate: (key: string) => string): StatusOption[] => [
  { value: 'created', label: translate('pages/payments.statuses.created') },
  { value: 'canceled', label: translate('pages/payments.statuses.canceled') },
  { value: 'paid', label: translate('pages/payments.statuses.paid') },
  { value: 'partial', label: translate('pages/payments.statuses.partial') },
  { value: 'overpaid', label: translate('pages/payments.statuses.overpaid') },
];

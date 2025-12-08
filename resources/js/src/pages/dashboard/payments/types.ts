import type dayjs from 'dayjs';

export type InvoiceCurrency = {
  token?: string | null;
  tokenIcon?: string | null;
  code?: string | null;
  network?: string | null;
  networkIcon?: string | null;
};

export type InvoiceProject = {
  id?: number;
  name?: string;
  ulid?: string;
};

export type InvoiceRow = {
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
  tx_explorer_url?: string | null;
  external_order_id?: string | null;
  project?: InvoiceProject | null;
  currency: InvoiceCurrency;
  created_at?: string | null;
  updated_at?: string | null;
  address?: string | null;
  can_cancel?: boolean;
};

export type FilterState = {
  search: string;
  project_id: number[];
  currency: string[];
  status: string[];
  date_from?: string | null;
  date_to?: string | null;
};

export type Option = {
  id: number | null;
  name: string;
  code: string;
  icon: string;
};

export type ColumnKey =
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

export type ColumnSetting = {
  key: ColumnKey;
  label: string;
  visible: boolean;
};

export type StatusOption = {
  value: string;
  label: string;
};

export type DateRangeValue = [dayjs.Dayjs | null, dayjs.Dayjs | null];

import { useCallback, useMemo } from 'react';

import type { InvoiceRow } from '../../types';
import type { InvoiceStatus } from '../../utils';

export type PaymentsAnalytics = Record<InvoiceStatus | 'total', { count: number; amount: number; percent: number }>;

const analyticsStatuses: InvoiceStatus[] = ['paid', 'overpaid', 'partial', 'canceled', 'created'];

const parseAmount = (value: string | null | undefined) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
};

export const usePaymentsAnalytics = (invoices: InvoiceRow[]) => {
  const analytics = useMemo<PaymentsAnalytics>(() => {
    const initial = analyticsStatuses.reduce(
      (acc, key) => ({ ...acc, [key]: { count: 0, amount: 0, percent: 0 } }),
      {} as PaymentsAnalytics,
    );

    const totals = invoices.reduce(
      (acc, invoice) => {
        const amount = parseAmount(invoice.amount);

        acc.total.amount += amount;
        acc.total.count += 1;

        const status = invoice.status as InvoiceStatus;

        if (status in acc) {
          acc[status].count += 1;
          acc[status].amount += amount;
        }

        return acc;
      },
      { ...initial, total: { count: 0, amount: 0, percent: 0 } } as PaymentsAnalytics,
    );

    const totalCount = invoices.length;
    const calcPercent = (count: number) => (totalCount === 0 ? 0 : (count / totalCount) * 100);

    return {
      ...totals,
      total: { ...totals.total, percent: totalCount ? 100 : 0 },
      ...analyticsStatuses.reduce(
        (acc, key) => {
          acc[key] = {
            ...totals[key],
            percent: calcPercent(totals[key].count),
          };
          return acc;
        },
        { ...totals } as PaymentsAnalytics,
      ),
    };
  }, [invoices]);

  const formatAnalyticsAmount = useCallback((value: number) => Number(value.toFixed(2)), []);

  return { analytics, formatAnalyticsAmount } as const;
};

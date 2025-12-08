import Card from '@mui/material/Card';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';

import { Scrollbar } from 'src/components/scrollbar';
import type { IconifyName } from 'src/components/iconify';

import type { PaymentsAnalytics } from '../hooks/usePaymentsAnalytics';
import { InvoiceAnalytic } from './InvoiceAnalytic';

// ----------------------------------------------------------------------

type Props = {
  analytics: PaymentsAnalytics;
  formatAmount: (value: number) => number;
};

export function InvoiceAnalyticsSection({ analytics, formatAmount }: Props) {
  const theme = useTheme();

  const items: Array<{
    key: keyof PaymentsAnalytics;
    title: string;
    icon: IconifyName;
    color: string;
  }> = [
    {
      key: 'total' as const,
      title: 'Total',
      icon: 'solar:bill-list-bold-duotone',
      color: theme.palette.info.main,
    },
    {
      key: 'paid' as const,
      title: 'Paid',
      icon: 'solar:file-check-bold-duotone',
      color: theme.palette.success.main,
    },
    {
      key: 'overpaid' as const,
      title: 'Overpaid',
      icon: 'solar:wallet-money-bold',
      color: theme.palette.secondary.main,
    },
    {
      key: 'partial' as const,
      title: 'Partial',
      icon: 'solar:pie-chart-2-bold',
      color: theme.palette.warning.main,
    },
    {
      key: 'canceled' as const,
      title: 'Canceled',
      icon: 'solar:clock-circle-bold',
      color: theme.palette.error.main,
    },
    {
      key: 'created' as const,
      title: 'Created',
      icon: 'solar:sort-by-time-bold-duotone',
      color: theme.palette.warning.main,
    },
  ];

  return (
    <Card sx={{ mb: { xs: 3, md: 5 } }}>
      <Scrollbar sx={{ minHeight: 108 }}>
        <Stack
          divider={<Divider orientation="vertical" flexItem sx={{ borderStyle: 'dashed' }} />}
          sx={{ py: 2, flexDirection: 'row' }}
        >
          {items.map((item) => (
            <InvoiceAnalytic
              key={item.key}
              title={item.title}
              icon={item.icon}
              color={item.color}
              total={analytics[item.key].count}
              percent={analytics[item.key].percent}
              price={formatAmount(analytics[item.key].amount)}
            />
          ))}
        </Stack>
      </Scrollbar>
    </Card>
  );
}

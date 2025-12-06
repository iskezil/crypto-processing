import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { Label } from 'src/components/label';
import { type SyntheticEvent } from 'react';

// ----------------------------------------------------------------------

export type StatusTab = { value: string; label: string };

interface Props {
  value: string;
  tabs: StatusTab[];
  onChange: (event: SyntheticEvent, value: string) => void;
  getCount: (value: string) => number;
}

export function UserStatusTabs({ value, tabs, onChange, getCount }: Props) {
  return (
    <Tabs value={value} onChange={onChange} sx={{ px: { md: 2.5 } }}>
      {tabs.map((tab) => (
        <Tab
          key={tab.value}
          value={tab.value}
          iconPosition="end"
          label={tab.label}
          icon={
            <Label
              variant={tab.value === 'all' || tab.value === value ? 'filled' : 'soft'}
              color={
                (tab.value === 'active' && 'success') ||
                (tab.value === 'pending' && 'warning') ||
                (tab.value === 'banned' && 'error') ||
                'default'
              }
            >
              {getCount(tab.value)}
            </Label>
          }
        />
      ))}
    </Tabs>
  );
}

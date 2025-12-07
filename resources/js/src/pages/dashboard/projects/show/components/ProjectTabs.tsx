import Tab from '@mui/material/Tab';
import { tabClasses } from '@mui/material/Tab';
import type { Theme } from '@mui/material/styles';

import { CustomTabs } from 'src/components/custom-tabs';

import { projectAccent } from '../../theme';

export type ProjectTab = { value: string; label: string; disabled?: boolean };

type ProjectTabsProps = {
  value: string;
  tabs: ProjectTab[];
  onChange: (event: React.SyntheticEvent, value: string) => void;
};

export function ProjectTabs({ value, tabs, onChange }: ProjectTabsProps) {
  return (
    <CustomTabs
      value={value}
      onChange={onChange}
      variant="scrollable"
      allowScrollButtonsMobile
      slotProps={{
        indicator: { sx: { display: 'none' } },
        indicatorContent: { sx: { display: 'none' } },
      }}
    >
      {tabs.map((tab) => (
        <Tab key={tab.value} value={tab.value} label={tab.label} disabled={tab.disabled} sx={styles.tab} />
      ))}
    </CustomTabs>
  );
}

const styles = {
  tab: (theme: Theme) => ({
    borderRadius: 1,
    minHeight: 44,
    px: 1.5,
    fontWeight: 600,
    fontSize: 14,
    textTransform: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: theme.vars.palette.text.secondary,
    backgroundColor: 'transparent',
    transition: theme.transitions.create(['background-color', 'color'], {
      duration: theme.transitions.duration.shorter,
    }),
    '&:hover': {
      backgroundColor: theme.vars.palette.action.hover,
    },
    [`&.${tabClasses.selected}`]: {
      ...projectAccent(theme),
    },
  }),
};

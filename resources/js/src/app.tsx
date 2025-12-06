import 'src/global.css';
import React from 'react';
import { themeConfig, ThemeProvider } from 'src/theme';

import { MotionLazy } from 'src/components/animate/motion-lazy';
import { SettingsDrawer, defaultSettings, SettingsProvider } from 'src/components/settings';
import { ReactNode } from 'react';
import { Snackbar } from 'src/components/snackbar';

export default function App({ children }: { children: ReactNode }) {
  return (
    <SettingsProvider defaultSettings={defaultSettings}>
      <ThemeProvider
        modeStorageKey={themeConfig.modeStorageKey}
        defaultMode={themeConfig.defaultMode}
      >
        <MotionLazy>
          <SettingsDrawer defaultSettings={defaultSettings} />
          <Snackbar />
          {children}
        </MotionLazy>
      </ThemeProvider>
    </SettingsProvider>
  );
}

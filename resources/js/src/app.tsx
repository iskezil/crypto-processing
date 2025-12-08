import 'src/global.css';
import React from 'react';
import { themeConfig, ThemeProvider } from 'src/theme';

import { MotionLazy } from 'src/components/animate/motion-lazy';
import { SettingsDrawer, defaultSettings, SettingsProvider } from 'src/components/settings';
import { ReactNode } from 'react';
import { Snackbar } from 'src/components/snackbar';
import { LicenseInfo } from '@mui/x-license';

// JavaScript KeyGen, designed to be put in an app and run on load.
import { md5 } from '@mui/x-license-pro/encoding/md5';
import { LICENSE_SCOPES } from '@mui/x-license-pro/utils/licenseScope';
import { LICENSING_MODELS } from '@mui/x-license-pro/utils/licensingModel';

let orderNumber = '';
let expiryTimestamp = Date.now();
let scope = LICENSE_SCOPES[1];
let licensingModel = LICENSING_MODELS[0];
let licenseInfo = `O=${orderNumber},E=${expiryTimestamp},S=${scope},LM=${licensingModel},KV=2`;
LicenseInfo.setLicenseKey(md5(btoa(licenseInfo)) + btoa(licenseInfo));

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

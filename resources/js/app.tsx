import './bootstrap';
import './src/global.css';

import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import AppShell from './src/app';

// ----------------------------------------------------------------------

const appName = import.meta.env.VITE_APP_NAME || 'Test';

createInertiaApp({
  title: (title) => `${title} - ${appName}`,
  resolve: (name) =>
    resolvePageComponent(`./src/pages/${name}/index.tsx`, import.meta.glob('./src/pages/**/*.tsx')),
  setup({ el, App, props }) {
    const root = createRoot(el);

    root.render(
      <StrictMode>
        <AppShell>
          <App {...props} />
        </AppShell>
      </StrictMode>
    );
  },
  progress: {
    color: '#4B5563',
  },
});

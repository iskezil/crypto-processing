import '@inertiajs/core';

type LangValue = string | { [key: string]: LangValue };
export type LangObject = Record<string, LangValue>;

declare module '@inertiajs/core' {
  interface PageProps {
    csrf_token: string;
    locale: string;
    lang: LangObject;
    auth: {
      user?: {
        id?: number;
        name?: string;
        email?: string;
        avatar?: string;
        role?: string;
        roles?: string[];
        permissions?: string[];
      };
    };
  }
}

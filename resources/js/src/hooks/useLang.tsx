import { usePage } from '@inertiajs/react';
import type { PageProps } from '@inertiajs/core';
import type { LangObject } from 'src/types/inertia';

type Replaces = Record<string, string | number>;
type LangValue = LangObject[string];

export function useLang() {
  const { lang } = usePage<PageProps>().props;

  function trans(key: string, replaces: Replaces | string = {}): string {
    const raw = getValueFromKey(key);
    if (typeof raw !== 'string') return key;

    let translated = raw;

    if (typeof replaces === 'string') {
      translated += ' ' + replaces;
    } else if (typeof replaces === 'object') {
      translated = replacePlaceholders(translated, replaces);
    }

    return translated;
  }

  function __(key: string, replaces: Replaces | string = {}) {
    return trans(key, replaces);
  }

  function replacePlaceholders(text: string, replaces: Replaces): string {
    return Object.entries(replaces).reduce(
      (acc, [key, val]) => acc.replaceAll(`{${key}}`, String(val)),
      text
    );
  }

  function getValueFromKey(key: string): string | undefined {
    const segments = key.split('.');
    let current: LangValue | undefined = lang;

    for (const segment of segments) {
      if (typeof current !== 'object' || current === null || !(segment in current)) {
        return undefined;
      }

      const nextValue: LangValue | undefined = (current as Record<string, LangValue>)[segment];
      current = typeof nextValue === 'string' || typeof nextValue === 'object' ? nextValue : undefined;
    }

    return typeof current === 'string' ? current : undefined;
  }

  return { trans, __ };
}

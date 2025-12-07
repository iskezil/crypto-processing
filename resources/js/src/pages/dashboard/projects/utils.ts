export const isValidHttpUrl = (value?: string | null) => {
  if (!value) return false;

  try {
    const url = new URL(value);

    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (error) {
    return false;
  }
};

export const normalizeUrl = (value: string) => value.trim().replace(/\/+$/, '');

export const buildCallbackUrls = (baseUrl: string) => {
  const normalizedUrl = normalizeUrl(baseUrl);

  return {
    success: `${normalizedUrl}/CryptoPaymentSuccess`,
    fail: `${normalizedUrl}/CryptoPaymentFailed`,
    notify: `${normalizedUrl}/api/Hook7QNB1YYtp8E6Z554AfPVG2J3`,
  } as const;
};

export const isTelegramHandle = (value?: string | null) => !!value && value.trim().startsWith('@');

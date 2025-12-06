import { Ziggy, type RouteName } from 'src/ziggy';

export function route(
  name: RouteName,
  params?: Record<string, any> | string | number,
  absolute = true
) {
  let uri: string = Ziggy.routes[name].uri;

  if (params) {
    const parameters: Record<string, any> =
      typeof params === 'string' || typeof params === 'number'
        ? (() => {
            const key = uri.match(/\{([^}]+)\}/)?.[1];
            return key ? { [key]: params } : {};
          })()
        : params;

    Object.keys(parameters).forEach((key) => {
      uri = uri.replace(`{${key}}`, encodeURIComponent(String(parameters[key])));
    });
  }

  return `/${uri}`;
}

export default route;

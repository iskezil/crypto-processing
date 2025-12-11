import { route as ziggyRoute, type Config as ZiggyConfig } from 'ziggy-js';
import { Ziggy, type RouteName } from 'src/ziggy';

type RouteParamsInput = Parameters<typeof ziggyRoute>[1] | Record<string, unknown> | Array<Parameters<typeof ziggyRoute>[1]>;

export function route(
  name: RouteName,
  params?: RouteParamsInput,
  absolute = false,
): string {
  const config: ZiggyConfig = { ...Ziggy };

  if (typeof window !== 'undefined') {
    config.url = window.location.origin;
    config.location = new URL(window.location.href);
  }

  if (!config.routes[name]) {
    console.warn(`Route [${name}] is not defined in Ziggy configuration`, { params });
    return '#';
  }

  const normalizedParams = params as Parameters<typeof ziggyRoute>[1];

  const result = ziggyRoute(name, normalizedParams, absolute, config);

  return result.toString();
}

export default route;

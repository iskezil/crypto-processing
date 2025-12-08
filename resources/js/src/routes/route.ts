import {
  route as ziggyRoute,
  type Config as ZiggyConfig,
} from 'ziggy-js';
import { Ziggy, type RouteName } from 'src/ziggy';

type RouteParamsInput =
  | string
  | number
  | boolean
  | null
  | undefined
  | Record<string, any>
  | Array<string | number | boolean | null | undefined>;

export function route(
  name: RouteName,
  params?: RouteParamsInput,
  absolute = false,
): string {
  const config: ZiggyConfig = { ...Ziggy };

  if (typeof window !== 'undefined') {
    config.url = window.location.origin;
    (config as any).location = new URL(window.location.href);
  }

  if (!config.routes[name]) {
    console.warn(`Route [${name}] is not defined in Ziggy configuration`, { params });
    return '#';
  }

  const result = ziggyRoute(name as any, params as any, absolute, config as any);

  return (result as unknown as { toString(): string }).toString();
}

export default route;

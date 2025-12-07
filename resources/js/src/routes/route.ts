import {
  route as ziggyRoute,
  type Config as ZiggyConfig,
} from 'ziggy-js';
import { Ziggy, type RouteName } from 'src/ziggy';

const resolveZiggyConfig = (): ZiggyConfig => {
  if (
    typeof window !== 'undefined' &&
    (window as typeof window & { Ziggy?: ZiggyConfig }).Ziggy
  ) {
    const runtimeZiggy = (window as typeof window & { Ziggy?: ZiggyConfig }).Ziggy!;

    return {
      ...Ziggy,
      ...runtimeZiggy,
      routes: { ...Ziggy.routes, ...runtimeZiggy.routes },
    };
  }

  return Ziggy;
};

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
  const config = resolveZiggyConfig();

  if (typeof window !== 'undefined') {
    config.url = window.location.origin;
    config.location = new URL(window.location.href);
  }

  if (!config.routes[name]) {
    console.warn(`Route [${name}] is not defined in Ziggy configuration`, { params });
    return '#';
  }
  return ziggyRoute(name as any, params as any, absolute, config as any) as unknown as string;
}

export default route;

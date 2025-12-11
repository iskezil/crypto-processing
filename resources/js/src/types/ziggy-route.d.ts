import type { RouteName } from 'src/ziggy';
import { route as routeHelper } from '../routes/route';

declare global {
  function route(
    name: RouteName,
    params?: Parameters<typeof routeHelper>[1],
    absolute?: boolean,
  ): string;
}

export {};

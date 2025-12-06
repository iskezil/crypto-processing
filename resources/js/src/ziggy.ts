export const Ziggy = {
  url: '',
  port: null,
  defaults: {},
  routes: {
    'locale.update': { uri: 'locale' },
    'users.index': { uri: 'users' },
    'users.create': { uri: 'users/create' },
    'users.store': { uri: 'users' },
    'users.edit': { uri: 'users/{user}/edit' },
    'users.edit.password': { uri: 'users/{user}/edit/change-password' },
    'users.update': { uri: 'users/{user}' },
    'users.destroy': { uri: 'users/{user}' },
    'roles.index': { uri: 'roles' },
    'roles.store': { uri: 'roles' },
    'roles.update': { uri: 'roles/{role}' },
    'roles.destroy': { uri: 'roles/{role}' },
    'permissions.index': { uri: 'permissions' },
    'permissions.store': { uri: 'permissions' },
    'permissions.update': { uri: 'permissions/{permission}' },
    'permissions.destroy': { uri: 'permissions/{permission}' },
    login: { uri: 'login' },
    register: { uri: 'register' },
    'password.request': { uri: 'forgot-password' },
  },
} as const;

export type RouteName = keyof typeof Ziggy.routes;

export default Ziggy;

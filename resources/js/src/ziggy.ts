import type { Config } from 'ziggy-js';

export const Ziggy: Config = {
  url: 'http://localhost',
  port: null,
  defaults: {},
  routes: {
    'sanctum.csrf-cookie': { uri: 'sanctum/csrf-cookie', methods: ['GET', 'HEAD'] },
    'ignition.healthCheck': { uri: '_ignition/health-check', methods: ['GET', 'HEAD'] },
    'ignition.executeSolution': { uri: '_ignition/execute-solution', methods: ['POST'] },
    'ignition.updateConfig': { uri: '_ignition/update-config', methods: ['POST'] },

    'locale.update': { uri: 'locale', methods: ['PATCH'] },

    home: { uri: '/', methods: ['GET', 'HEAD'] },
    dashboard: { uri: 'dashboard', methods: ['GET', 'HEAD'] },
    faqs: { uri: 'faqs', methods: ['GET', 'HEAD'] },

    'users.index': { uri: 'users', methods: ['GET', 'HEAD'] },
    'users.create': { uri: 'users/create', methods: ['GET', 'HEAD'] },
    'users.store': { uri: 'users', methods: ['POST'] },
    'users.edit': {
      uri: 'users/{user}/edit',
      methods: ['GET', 'HEAD'],
      parameters: ['user'],
      bindings: { user: 'id' },
    },
    'users.edit.password': {
      uri: 'users/{user}/edit/change-password',
      methods: ['GET', 'HEAD'],
      parameters: ['user'],
      bindings: { user: 'id' },
    },
    'users.update': {
      uri: 'users/{user}',
      methods: ['PATCH'],
      parameters: ['user'],
      bindings: { user: 'id' },
    },
    'users.destroy': {
      uri: 'users/{user}',
      methods: ['DELETE'],
      parameters: ['user'],
      bindings: { user: 'id' },
    },

    'roles.index': { uri: 'roles', methods: ['GET', 'HEAD'] },
    'roles.store': { uri: 'roles', methods: ['POST'] },
    'roles.update': {
      uri: 'roles/{role}',
      methods: ['PATCH'],
      parameters: ['role'],
      bindings: { role: 'id' },
    },
    'roles.destroy': {
      uri: 'roles/{role}',
      methods: ['DELETE'],
      parameters: ['role'],
      bindings: { role: 'id' },
    },

    'permissions.index': { uri: 'permissions', methods: ['GET', 'HEAD'] },
    'permissions.store': { uri: 'permissions', methods: ['POST'] },
    'permissions.update': {
      uri: 'permissions/{permission}',
      methods: ['PATCH'],
      parameters: ['permission'],
      bindings: { permission: 'id' },
    },
    'permissions.destroy': {
      uri: 'permissions/{permission}',
      methods: ['DELETE'],
      parameters: ['permission'],
      bindings: { permission: 'id' },
    },

    'projects.index': { uri: 'projects', methods: ['GET', 'HEAD'] },
    'projects.create': { uri: 'projects/create', methods: ['GET', 'HEAD'] },
    'projects.store': { uri: 'projects', methods: ['POST'] },
    'projects.update': {
      uri: 'projects/{project}',
      methods: ['PATCH'],
      parameters: ['project'],
      bindings: { project: 'ulid' },
    },
    'projects.show': {
      uri: 'projects/{project}',
      methods: ['GET', 'HEAD'],
      parameters: ['project'],
      bindings: { project: 'ulid' },
    },
    'projects.api_keys.secret': {
      uri: 'projects/{project}/api-keys/secret',
      methods: ['POST'],
      parameters: ['project'],
      bindings: { project: 'ulid' },
    },
    'projects.api_keys.regenerate': {
      uri: 'projects/{project}/api-keys/regenerate',
      methods: ['POST'],
      parameters: ['project'],
      bindings: { project: 'ulid' },
    },
    'projects_admin.show': {
      uri: 'admin/projects/{status}/{project}',
      methods: ['GET', 'HEAD'],
      parameters: ['status', 'project'],
      bindings: { project: 'ulid' },
    },
    'pos.show': {
      uri: 'pos/{project}',
      methods: ['GET', 'HEAD'],
      parameters: ['project'],
    },
    'projects_moderation.index': {
      uri: 'admin/projects/moderation',
      methods: ['GET', 'HEAD'],
    },
    'projects_rejected.index': {
      uri: 'admin/projects/rejected',
      methods: ['GET', 'HEAD'],
    },
    'projects_active.index': {
      uri: 'admin/projects/active',
      methods: ['GET', 'HEAD'],
    },
    'projects.moderate': {
      uri: 'admin/projects/{project}/moderate',
      methods: ['POST'],
      parameters: ['project'],
      bindings: { project: 'ulid' },
    },

    register: { uri: 'register', methods: ['GET', 'HEAD'] },
    login: { uri: 'login', methods: ['GET', 'HEAD'] },
    'password.request': { uri: 'forgot-password', methods: ['GET', 'HEAD'] },
    'password.email': { uri: 'forgot-password', methods: ['POST'] },
    'password.reset': {
      uri: 'reset-password/{token}',
      methods: ['GET', 'HEAD'],
      parameters: ['token'],
    },
    'password.store': { uri: 'reset-password', methods: ['POST'] },
    'verification.notice': { uri: 'verify-email', methods: ['GET', 'HEAD'] },
    'verification.verify': {
      uri: 'verify-email/{id}/{hash}',
      methods: ['GET', 'HEAD'],
      parameters: ['id', 'hash'],
    },
    'verification.send': { uri: 'email/verification-notification', methods: ['POST'] },
    'password.confirm': { uri: 'confirm-password', methods: ['GET', 'HEAD'] },
    'password.update': { uri: 'password', methods: ['PUT'] },
    logout: { uri: 'logout', methods: ['POST'] },
  },
};

export type RouteName = keyof typeof Ziggy.routes;

export default Ziggy;

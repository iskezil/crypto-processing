export enum ROLE_NAMES {
  ADMIN = 'pages/roles.names.admin',
  MANAGER = 'pages/roles.names.manager',
  USER = 'pages/roles.names.user',
}

// Permission value is i18n key; enum key equals DB permission name (UPPERCASE)
export enum PERMISSION_NAMES {
  USERS_VIEW = 'pages/permissions.names.users_view',
  USERS_CREATE = 'pages/permissions.names.users_create',
  USERS_EDIT = 'pages/permissions.names.users_edit',
  USERS_DELETE = 'pages/permissions.names.users_delete',

  ROLES_VIEW = 'pages/permissions.names.roles_view',
  ROLES_CREATE = 'pages/permissions.names.roles_create',
  ROLES_EDIT = 'pages/permissions.names.roles_edit',
  ROLES_DELETE = 'pages/permissions.names.roles_delete',

  PERMISSIONS_VIEW = 'pages/permissions.names.permissions_view',
  PERMISSIONS_CREATE = 'pages/permissions.names.permissions_create',
  PERMISSIONS_EDIT = 'pages/permissions.names.permissions_edit',
  PERMISSIONS_DELETE = 'pages/permissions.names.permissions_delete',
}

export enum PERMISSION_MODULE_NAMES {
  USERS = 'pages/permissions.modules.users',
  ROLES = 'pages/permissions.modules.roles',
  PERMISSIONS = 'pages/permissions.modules.permissions',
}

// ----------------------------------------------------------------------

const ROOTS = {
  DASHBOARD: '/dashboard',
};

// ----------------------------------------------------------------------

export const paths = {
  users: '/users',
  userCreate: '/users/create',
  userEdit: (id: number | string) => `/users/${id}/edit`,
  roles: '/roles',
  permissions: '/permissions',
  faqs: '/faqs',
  // DASHBOARD
  dashboard: {
    root: ROOTS.DASHBOARD,
  },
};

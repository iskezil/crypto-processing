import { ChangeEvent, Fragment, useEffect, useMemo, useState } from 'react';
import { router, usePage } from '@inertiajs/react';

import { CONFIG } from 'src/global-config';
import { DashboardContent, DashboardLayout } from 'src/layouts/dashboard';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog/confirm-dialog';
import { toast } from 'src/components/snackbar';
import { useLang } from 'src/hooks/useLang';
import { paths } from 'src/routes/paths';
import { PERMISSION_MODULE_NAMES, PERMISSION_NAMES, ROLE_NAMES } from 'src/enums/rights';
import { useAuthz } from 'src/lib/authz';
import { Can } from 'src/components/Can';

import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import InputAdornment from '@mui/material/InputAdornment';
import Checkbox from '@mui/material/Checkbox';
import MenuItem from '@mui/material/MenuItem';
import type { PageProps } from '@inertiajs/core';

// ----------------------------------------------------------------------

type Role = { id: number; name: string };
type Permission = {
  id: number;
  name: string;
  module: string;
  created_at: string;
  roles: Role[];
};

type Props = { permissions: Permission[]; roles: Role[] };

const metadata = { title: `Permissions | Dashboard - ${CONFIG.appName}` };

export default function List({ permissions, roles }: Props) {
  const { __ } = useLang();
  const { props } = usePage<PageProps>();
  const csrfToken = props.csrf_token;
  const { can } = useAuthz();
  const canEdit = can('PERMISSIONS_EDIT');
  const canDelete = can('PERMISSIONS_DELETE');

  const [permissionList, setPermissionList] = useState<Permission[]>(permissions);
  const [search, setSearch] = useState('');
  const [openAdd, setOpenAdd] = useState(false);
  const moduleKeys = Object.keys(PERMISSION_MODULE_NAMES) as Array<
    keyof typeof PERMISSION_MODULE_NAMES
  >;
  const [newPermission, setNewPermission] = useState('');
  const [newModule, setNewModule] = useState<keyof typeof PERMISSION_MODULE_NAMES>(moduleKeys[0]);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  useEffect(() => {
    setPermissionList(permissions);
  }, [permissions]);

  const filtered = useMemo(
    () =>
      permissionList.filter(
        (p) =>
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.module.toLowerCase().includes(search.toLowerCase())
      ),
    [permissionList, search]
  );

  const grouped = useMemo(() => {
    return filtered.reduce(
      (acc, p) => {
        (acc[p.module] ||= []).push(p);
        return acc;
      },
      {} as Record<string, Permission[]>
    );
  }, [filtered]);

  const [openModules, setOpenModules] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setOpenModules((prev) => {
      const state = { ...prev };
      let changed = false;
      Object.keys(grouped).forEach((key) => {
        if (state[key] === undefined) {
          state[key] = true;
          changed = true;
        }
      });
      return changed ? state : prev;
    });
  }, [grouped]);

  const handleToggleModule = (module: string) => {
    setOpenModules((prev) => ({ ...prev, [module]: !prev[module] }));
  };

  const handleCreate = () => {
    router.post(
      route('permissions.store'),
      { name: newPermission, module: newModule, _token: csrfToken },
      {
        onSuccess: () => {
          toast.success(__('pages/permissions.add_permission'));
          setOpenAdd(false);
          setNewPermission('');
          setNewModule(moduleKeys[0]);
          router.reload({ only: ['permissions'] });
        },
      }
    );
  };

  const handleDelete = () => {
    if (deleteId === null) return;
    router.delete(route('permissions.destroy', deleteId), {
      data: { _token: csrfToken },
      onSuccess: () => {
        toast.success(__('pages/permissions.delete_success'));
        setDeleteId(null);
        router.reload({ only: ['permissions'] });
      },
    });
  };

  const handleToggleRole = (permission: Permission, roleId: number, checked: boolean) => {
    const roleIds = checked
      ? permission.roles.filter((r) => r.id !== roleId).map((r) => r.id)
      : [...permission.roles.map((r) => r.id), roleId];

    router.patch(
      route('permissions.update', permission.id),
      { roles: roleIds, _token: csrfToken },
      {
        onSuccess: () => {
          setPermissionList((prev) =>
            prev.map((p) =>
              p.id === permission.id
                ? {
                    ...p,
                    roles: checked
                      ? p.roles.filter((r) => r.id !== roleId)
                      : [...p.roles, roles.find((r) => r.id === roleId)!],
                  }
                : p
            )
          );
        },
      }
    );
  };

  return (
    <>
      <title>{metadata.title}</title>
      <DashboardLayout>
        <DashboardContent maxWidth="xl">
          <CustomBreadcrumbs
            heading={__('pages/permissions.breadcrumbs.permissions')}
            links={[
              { name: __('pages/permissions.breadcrumbs.dashboard'), href: paths.dashboard.root },
              { name: __('pages/permissions.breadcrumbs.permissions') },
            ]}
            action={
              <Can permission="PERMISSIONS_CREATE">
                <Button
                  variant="contained"
                  startIcon={<Iconify icon="mingcute:add-line" />}
                  onClick={() => setOpenAdd(true)}
                >
                  {__('pages/permissions.add_permission')}
                </Button>
              </Can>
            }
            sx={{ mb: { xs: 3, md: 5 } }}
          />

          <Card>
            <Stack spacing={2} direction={{ xs: 'column', sm: 'row' }} sx={{ p: 2 }}>
              <TextField
                size="small"
                value={search}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  setSearch(e.target.value);
                }}
                placeholder={__('pages/permissions.search')}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Iconify icon="solar:magnifer-linear" width={24} />
                    </InputAdornment>
                  ),
                }}
              />
            </Stack>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>{__('pages/permissions.table.name')}</TableCell>
                    {roles.map((role) => (
                      <TableCell key={role.id} align="center">
                        {ROLE_NAMES[role.name as keyof typeof ROLE_NAMES]
                          ? __(ROLE_NAMES[role.name as keyof typeof ROLE_NAMES])
                          : role.name}
                      </TableCell>
                    ))}
                    <TableCell align="center">{__('pages/permissions.table.actions')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Object.entries(grouped).map(([module, perms]) => (
                    <Fragment key={module}>
                      <TableRow>
                        <TableCell
                          colSpan={roles.length + 2}
                          onClick={() => handleToggleModule(module)}
                          sx={{
                            fontWeight: 'bold',
                            bgcolor: 'background.neutral',
                            cursor: 'pointer',
                          }}
                        >
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <Iconify
                              width={16}
                              icon={
                                openModules[module]
                                  ? 'eva:arrow-ios-downward-fill'
                                  : 'eva:arrow-ios-forward-fill'
                              }
                            />
                            {PERMISSION_MODULE_NAMES[module as keyof typeof PERMISSION_MODULE_NAMES]
                              ? __(
                                  PERMISSION_MODULE_NAMES[
                                    module as keyof typeof PERMISSION_MODULE_NAMES
                                  ]
                                )
                              : module}
                          </Stack>
                        </TableCell>
                      </TableRow>
                      {openModules[module] &&
                        perms.map((permission) => (
                          <TableRow key={permission.id} hover>
                            <TableCell>
                              {PERMISSION_NAMES[permission.name as keyof typeof PERMISSION_NAMES]
                                ? __(
                                    PERMISSION_NAMES[
                                      permission.name as keyof typeof PERMISSION_NAMES
                                    ]
                                  )
                                : permission.name}
                            </TableCell>
                            {roles.map((role) => {
                              const checked = permission.roles.some((pr) => pr.id === role.id);
                              return (
                                <TableCell key={role.id} align="center">
                                  <Checkbox
                                    checked={checked}
                                    onChange={() => handleToggleRole(permission, role.id, checked)}
                                    disabled={!canEdit}
                                  />
                                </TableCell>
                              );
                            })}
                            <TableCell align="center">
                              {canDelete && (
                                <IconButton color="error" onClick={() => setDeleteId(permission.id)}>
                                  <Iconify icon="solar:trash-bin-trash-bold" />
                                </IconButton>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                    </Fragment>
                  ))}

                  {filtered.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={roles.length + 2} align="center">
                        {__('pages/permissions.no_data')}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </DashboardContent>
      </DashboardLayout>

      <Can permission="PERMISSIONS_CREATE">
        <Dialog open={openAdd} onClose={() => setOpenAdd(false)} fullWidth maxWidth="xs">
          <DialogTitle>{__('pages/permissions.add_permission')}</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField
                autoFocus
                margin="dense"
                fullWidth
                variant="filled"
                label={__('pages/permissions.table.name')}
                value={newPermission}
                onChange={(e) => setNewPermission(e.target.value)}
              />
              <TextField
                select
                margin="dense"
                fullWidth
                variant="filled"
                label={__('pages/permissions.module')}
                value={newModule}
                onChange={(e) => setNewModule(e.target.value as keyof typeof PERMISSION_MODULE_NAMES)}
              >
                {moduleKeys.map((key) => (
                  <MenuItem key={key} value={key}>
                    {__(PERMISSION_MODULE_NAMES[key])}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenAdd(false)}>{__('pages/permissions.cancel')}</Button>
            <Button variant="contained" onClick={handleCreate} disabled={!newPermission}>
              {__('pages/permissions.add_permission')}
            </Button>
          </DialogActions>
        </Dialog>
      </Can>

      <ConfirmDialog
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        title={__('pages/permissions.delete_permission')}
        content={__('pages/permissions.delete_confirm')}
        action={
          <Button color="error" variant="contained" onClick={handleDelete}>
            {__('pages/permissions.delete')}
          </Button>
        }
      />
    </>
  );
}

import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { router, usePage } from '@inertiajs/react';

import { CONFIG } from 'src/global-config';
import { DashboardContent, DashboardLayout } from 'src/layouts/dashboard';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog/confirm-dialog';
import { toast } from 'src/components/snackbar';
import { useLang } from 'src/hooks/useLang';
import { paths } from 'src/routes/paths';
import { PERMISSION_NAMES, ROLE_NAMES } from 'src/enums/rights';
import { useAuthz } from 'src/lib/authz';
import { Can } from 'src/components/Can';

import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
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
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid';
import type { PageProps } from '@inertiajs/core';

// ----------------------------------------------------------------------

type Permission = {
  id: number;
  name: string;
};

type Role = {
  id: number;
  name: string;
  created_at: string;
  permissions: Permission[];
};

type Props = { roles: Role[]; permissions: Permission[] };

const metadata = { title: `Roles | Dashboard - ${CONFIG.appName}` };

export default function List({ roles, permissions }: Props) {
  const { __ } = useLang();
  const { props } = usePage<PageProps>();
  const csrfToken = props.csrf_token;
  const { can } = useAuthz();
  const canEdit = can('ROLES_EDIT');
  const canDelete = can('ROLES_DELETE');

  const [roleList, setRoleList] = useState<Role[]>(roles);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [search, setSearch] = useState('');
  const [openAdd, setOpenAdd] = useState(false);
  const [newRole, setNewRole] = useState('');
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [viewRole, setViewRole] = useState<Role | null>(null);
  const [editRole, setEditRole] = useState<{ id: number; permissions: number[] } | null>(null);

  useEffect(() => {
    setRoleList(roles);
  }, [roles]);

  const filtered = useMemo(
    () => roleList.filter((r) => r.name.toLowerCase().includes(search.toLowerCase())),
    [roleList, search]
  );

  const paginated = useMemo(
    () => filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [filtered, page, rowsPerPage]
  );

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleCreate = () => {
    router.post(
      route('roles.store'),
      { name: newRole, _token: csrfToken },
      {
        onSuccess: () => {
          toast.success(__('pages/roles.add_role'));
          setOpenAdd(false);
          setNewRole('');
          router.reload({ only: ['roles'] });
        },
      }
    );
  };

  const handleDelete = () => {
    if (deleteId === null) return;
    router.delete(route('roles.destroy', deleteId), {
      data: { _token: csrfToken },
      onSuccess: () => {
        toast.success(__('pages/roles.delete_success'));
        setDeleteId(null);
        router.reload({ only: ['roles'] });
      },
    });
  };

  return (
    <>
      <title>{metadata.title}</title>
      <DashboardLayout>
        <DashboardContent maxWidth="xl">
          <CustomBreadcrumbs
            heading={__('pages/roles.breadcrumbs.roles')}
            links={[
              { name: __('pages/roles.breadcrumbs.dashboard'), href: paths.dashboard.root },
              { name: __('pages/roles.breadcrumbs.roles') },
            ]}
            action={
              <Can permission="ROLES_CREATE">
                <Button
                  variant="contained"
                  startIcon={<Iconify icon="mingcute:add-line" />}
                  onClick={() => setOpenAdd(true)}
                >
                  {__('pages/roles.add_role')}
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
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(0);
                }}
                placeholder={__('pages/roles.search')}
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
                    <TableCell>{__('pages/roles.table.name')}</TableCell>
                    <TableCell>{__('pages/roles.table.display')}</TableCell>
                    <TableCell>{__('pages/roles.table.created')}</TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginated.map((role) => (
                    <TableRow key={role.id} hover>
                      <TableCell>{role.name}</TableCell>
                      <TableCell>
                        {ROLE_NAMES[role.name as keyof typeof ROLE_NAMES]
                          ? __(ROLE_NAMES[role.name as keyof typeof ROLE_NAMES])
                          : role.name}
                      </TableCell>
                      <TableCell>{role.created_at}</TableCell>
                      <TableCell align="right">
                        <IconButton color="primary" onClick={() => setViewRole(role)}>
                          <Iconify icon="solar:eye-bold" />
                        </IconButton>
                        {canEdit && (
                          <IconButton
                            color="warning"
                            onClick={() =>
                              setEditRole({
                                id: role.id,
                                permissions: role.permissions.map((p) => p.id),
                              })
                            }
                          >
                            <Iconify icon="solar:pen-bold" />
                          </IconButton>
                        )}
                        {canDelete && (
                          <IconButton color="error" onClick={() => setDeleteId(role.id)}>
                            <Iconify icon="solar:trash-bin-trash-bold" />
                          </IconButton>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}

                  {paginated.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        {__('pages/roles.no_data')}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              component="div"
              count={filtered.length}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 25]}
            />
          </Card>
        </DashboardContent>
      </DashboardLayout>

      <Can permission="ROLES_CREATE">
        <Dialog open={openAdd} onClose={() => setOpenAdd(false)} fullWidth maxWidth="xs">
          <DialogTitle>{__('pages/roles.add_role')}</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label={__('pages/roles.add_role_placeholder')}
              size="small"
              fullWidth
              variant="filled"
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenAdd(false)}>{__('pages/roles.cancel')}</Button>
            <Button variant="contained" onClick={handleCreate} disabled={!newRole}>
              {__('pages/roles.add_role')}
            </Button>
          </DialogActions>
        </Dialog>
      </Can>

      <Dialog open={viewRole !== null} onClose={() => setViewRole(null)} fullWidth maxWidth="sm">
        <DialogTitle>{__('pages/roles.permissions')}</DialogTitle>
        <DialogContent>
          <Stack spacing={1} sx={{ mt: 1 }}>
            {viewRole?.permissions.map((p) => (
              <div key={p.id}>
                {PERMISSION_NAMES[p.name as keyof typeof PERMISSION_NAMES]
                  ? __(PERMISSION_NAMES[p.name as keyof typeof PERMISSION_NAMES])
                  : p.name}
              </div>
            ))}
            {viewRole && viewRole.permissions.length === 0 && (
              <div>{__('pages/roles.no_permissions')}</div>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewRole(null)}>{__('pages/roles.cancel')}</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={editRole !== null} onClose={() => setEditRole(null)} fullWidth maxWidth="sm">
        <DialogTitle>{__('pages/roles.permissions')}</DialogTitle>
        <DialogContent>
          <Grid container spacing={1} sx={{ mt: 1 }}>
            {permissions.map((permission) => {
              const checked = editRole?.permissions.includes(permission.id) ?? false;
              return (
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={checked}
                      onChange={() =>
                        setEditRole((prev) =>
                          prev
                            ? {
                                ...prev,
                                permissions: checked
                                  ? prev.permissions.filter((id) => id !== permission.id)
                                  : [...prev.permissions, permission.id],
                              }
                            : prev
                        )
                      }
                    />
                  }
                  label={
                    PERMISSION_NAMES[permission.name as keyof typeof PERMISSION_NAMES]
                      ? __(PERMISSION_NAMES[permission.name as keyof typeof PERMISSION_NAMES])
                      : permission.name
                  }
                />
              );
            })}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditRole(null)}>{__('pages/roles.cancel')}</Button>
          <Button
            variant="contained"
            onClick={() => {
              if (!editRole) return;
              router.patch(
                route('roles.update', editRole.id),
                { permissions: editRole.permissions, _token: csrfToken },
                {
                  onSuccess: () => {
                    toast.success(__('pages/roles.permissions'));
                    setEditRole(null);
                    router.reload({ only: ['roles'] });
                  },
                }
              );
            }}
          >
            {__('pages/roles.save')}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        title={__('pages/roles.delete_role')}
        content={__('pages/roles.delete_confirm')}
        action={
          <Button color="error" variant="contained" onClick={handleDelete}>
            {__('pages/roles.delete')}
          </Button>
        }
      />
    </>
  );
}

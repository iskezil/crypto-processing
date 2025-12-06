import { type ChangeEvent, type SyntheticEvent, useEffect, useMemo, useState } from 'react';
import { router, usePage } from '@inertiajs/react';

import { CONFIG } from 'src/global-config';
import { DashboardContent, DashboardLayout } from 'src/layouts/dashboard';
import { Iconify } from 'src/components/iconify';
import { useLang } from 'src/hooks/useLang';
import { paths } from 'src/routes/paths';
import { route } from 'src/routes/route';
import { RouterLink } from 'src/routes/components';
import { toast } from 'src/components/snackbar';
import { useAuthz } from 'src/lib/authz';
import { Can } from 'src/components/Can';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Checkbox from '@mui/material/Checkbox';
import ListItemText from '@mui/material/ListItemText';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import { Label } from 'src/components/label';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { FilledInput } from '@mui/material';
import type { PageProps } from '@inertiajs/core';

import type { StatusTab } from './components/user-status-tabs';
import { UserStatusTabs } from './components/user-status-tabs';
import { UserTableToolbar } from './components/user-table-toolbar';
import { UserTableFiltersResult } from './components/user-table-filters-result';
import { UserDeleteDialog } from './components/user-delete-dialog';
import type { Filters, Role, User } from './types';

// ----------------------------------------------------------------------

interface Props {
  users: User[];
  roles: Role[];
}

const metadata = { title: `Users | Dashboard - ${CONFIG.appName}` };

// ----------------------------------------------------------------------

export default function List({ users, roles }: Props) {
  const { __ } = useLang();
  const { props } = usePage<PageProps>();
  const csrfToken = props.csrf_token;
  console.log('props.auth.user', props.auth.user);
  const authUserId = (props.auth.user as any)?.id as number | undefined;
  const { can } = useAuthz();
  const canEdit = can('USERS_EDIT');
  const canDelete = can('USERS_DELETE');

  const [userList, setUserList] = useState<User[]>(users);
  const [filters, setFilters] = useState<Filters>({ keyword: '', role: null, status: 'all' });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [editing, setEditing] = useState<{ id: number | null; field: string | null }>({
    id: null,
    field: null,
  });
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const handleFilters = (name: keyof Filters, value: string | number | null) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
    setPage(0);
  };

  const handleResetFilters = () => {
    setFilters({ keyword: '', role: null, status: 'all' });
    setPage(0);
  };

  const handleEditChange = (id: number, field: keyof User, value: any) => {
    setUserList((prev) => prev.map((u) => (u.id === id ? { ...u, [field]: value } : u)));
  };

  const handleSave = (id: number, field: keyof User, value?: any) => {
    const updated = userList.find((u) => u.id === id);
    const original = users.find((u) => u.id === id);
    if (!updated || !original) return;
    const data: Record<string, any> = { _token: csrfToken };
    let changed = false;
    const revert = () => setUserList((prev) => prev.map((u) => (u.id === id ? original : u)));
    if (field === 'roles') {
      const newRoles = (value ?? updated.roles) as number[];
      const currentRoles = [...original.roles];
      newRoles.sort();
      currentRoles.sort();
      changed =
        newRoles.length !== currentRoles.length ||
        newRoles.some((role, idx) => role !== currentRoles[idx]);
      if (changed) {
        data.roles = newRoles;
      }
    } else if (field === 'status') {
      const newStatus = value ?? updated.status;
      changed = newStatus !== original.status;
      if (changed) {
        data.status = newStatus;
      }
    } else {
      const newValue = value ?? (updated as any)[field];
      const originalValue = (original as any)[field];
      changed = newValue !== originalValue;
      if (changed) {
        data[field] = newValue;
      }
    }
    if (!changed) {
      setEditing({ id: null, field: null });
      revert();
      return;
    }
    router.patch(route('users.update', id), data, {
      onSuccess: () => {
        toast.success(__('pages/users.update_success'));
      },
      onError: (errors: Record<string, string>) => {
        toast.error(errors.roles ?? __('pages/users.update_error'));
      },
    });
    setEditing({ id: null, field: null });
  };

  const STATUS_TABS: StatusTab[] = [
    { value: 'all', label: __('pages/users.tabs.all') },
    { value: 'active', label: __('pages/users.tabs.active') },
    { value: 'pending', label: __('pages/users.tabs.pending') },
    { value: 'banned', label: __('pages/users.tabs.banned') },
  ];

  const STATUS_OPTIONS = [
    { value: 'active', label: __('pages/users.statuses.active') },
    { value: 'pending', label: __('pages/users.statuses.pending') },
    { value: 'banned', label: __('pages/users.statuses.banned') },
  ];

  const filteredUsers = useMemo(
    () =>
      userList.filter(
        (user) =>
          (user.name.toLowerCase().includes(filters.keyword.toLowerCase()) ||
            user.email.toLowerCase().includes(filters.keyword.toLowerCase())) &&
          (!filters.role || user.roles.includes(filters.role)) &&
          (filters.status === 'all' || user.status === filters.status)
      ),
    [userList, filters]
  );

  const paginatedUsers = useMemo(
    () => filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [filteredUsers, page, rowsPerPage]
  );

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleChangeStatus = (_: SyntheticEvent, newValue: string) => {
    handleFilters('status', newValue);
  };

  const getStatusCount = (value: string) =>
    value === 'all' ? userList.length : userList.filter((user) => user.status === value).length;

  const translateRole = (id: number) => {
    const role = roles.find((r) => r.id === id);
    return role ? __(`pages/users.roles.${role.name.toLowerCase()}`) : '';
  };

  const handleCopy = async (text: string) => {
    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        toast.success(__('pages/users.copy_success'));
        return;
      } catch (error) {
        // fall back to older copy method
      }
    }
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    try {
      document.execCommand('copy');
      toast.success(__('pages/users.copy_success'));
    } finally {
      document.body.removeChild(textarea);
    }
  };

  const hoverSx = {
    '& .action-icons': {
      display: 'inline-flex',
      opacity: 0,
      visibility: 'hidden',
      pointerEvents: 'none',
      transition: 'opacity 0.2s',
    },
    '&:hover .action-icons': {
      opacity: 1,
      visibility: 'visible',
      pointerEvents: 'auto',
    },
  };

  useEffect(() => {
    setUserList(users);
  }, [users]);

  const handleDelete = () => {
    if (deleteId === null) return;
    router.delete(route('users.destroy', deleteId), {
      data: { _token: csrfToken },
      onSuccess: () => {
        toast.success(__('pages/users.delete_success'));
        setDeleteId(null);
        router.reload({ only: ['users'] });
      },
      onError: (errors: Record<string, string>) => {
        toast.error(errors.user ?? __('pages/users.delete_error'));
        setDeleteId(null);
      },
    });
  };

  return (
    <>
      <title>{metadata.title}</title>
      <DashboardLayout>
        <DashboardContent maxWidth="xl">
          <CustomBreadcrumbs
            heading={__('pages/users.breadcrumbs.users')}
            links={[
              { name: __('pages/users.breadcrumbs.dashboard'), href: paths.dashboard.root },
              { name: __('pages/users.breadcrumbs.users') },
            ]}
            action={
              <Can permission="USERS_CREATE">
                <Button
                  component={RouterLink}
                  href={route('users.create')}
                  variant="contained"
                  startIcon={<Iconify icon="mingcute:add-line" />}
                >
                  {__('pages/users.add_user')}
                </Button>
              </Can>
            }
            sx={{ mb: { xs: 3, md: 5 } }}
          />

          <Card>
            <UserStatusTabs
              value={filters.status}
              onChange={handleChangeStatus}
              tabs={STATUS_TABS}
              getCount={getStatusCount}
            />

            <UserTableToolbar filters={filters} onFilters={handleFilters} roles={roles} />

            <UserTableFiltersResult
              filters={filters}
              onFilters={handleFilters}
              onResetFilters={handleResetFilters}
              results={filteredUsers.length}
              roles={roles}
            />

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>{__('pages/users.table.name')}</TableCell>
                    <TableCell>{__('pages/users.table.email')}</TableCell>
                    <TableCell>{__('pages/users.table.status')}</TableCell>
                    <TableCell>{__('pages/users.table.role')}</TableCell>
                    <TableCell>{__('pages/users.table.created')}</TableCell>
                    <TableCell align="center">{__('pages/users.table.actions')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedUsers.map((user) => {
                    const rolesText = user.roles.length
                      ? user.roles.map(translateRole).join(', ')
                      : '-';
                    const statusText = __(`pages/users.statuses.${user.status}`);
                    return (
                      <TableRow key={user.id} hover>
                        <TableCell>
                          {editing.id === user.id && editing.field === 'name' ? (
                            <FilledInput
                              value={user.name}
                              size="small"
                              hiddenLabel
                              autoFocus
                              onChange={(e) => handleEditChange(user.id, 'name', e.target.value)}
                              onBlur={() => handleSave(user.id, 'name')}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSave(user.id, 'name');
                              }}
                            />
                          ) : (
                            <Stack direction="row" spacing={0.5} alignItems="center" sx={hoverSx}>
                              {user.name}
                              {canEdit && (
                                <IconButton
                                  className="action-icons"
                                  size="small"
                                  onClick={() => setEditing({ id: user.id, field: 'name' })}
                                >
                                  <Iconify icon="solar:pen-bold" width={16} />
                                </IconButton>
                              )}
                              <IconButton
                                className="action-icons"
                                size="small"
                                onClick={() => handleCopy(user.name)}
                              >
                                <Iconify icon="solar:copy-bold" width={16} />
                              </IconButton>
                            </Stack>
                          )}
                        </TableCell>
                        <TableCell>
                          {editing.id === user.id && editing.field === 'email' ? (
                            <FilledInput
                              value={user.email}
                              size="small"
                              hiddenLabel
                              autoFocus
                              onChange={(e) => handleEditChange(user.id, 'email', e.target.value)}
                              onBlur={() => handleSave(user.id, 'email')}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSave(user.id, 'email');
                              }}
                            />
                          ) : (
                            <Stack direction="row" spacing={0.5} alignItems="center" sx={hoverSx}>
                              {user.email}
                              {canEdit && (
                                <IconButton
                                  className="action-icons"
                                  size="small"
                                  onClick={() => setEditing({ id: user.id, field: 'email' })}
                                >
                                  <Iconify icon="solar:pen-bold" width={16} />
                                </IconButton>
                              )}
                              <IconButton
                                className="action-icons"
                                size="small"
                                onClick={() => handleCopy(user.email)}
                              >
                                <Iconify icon="solar:copy-bold" width={16} />
                              </IconButton>
                            </Stack>
                          )}
                        </TableCell>
                        <TableCell>
                          {editing.id === user.id && editing.field === 'status' ? (
                            <Select
                              autoFocus
                              open
                              size="small"
                              variant="filled"
                              hiddenLabel
                              value={user.status}
                              onChange={(e) => {
                                const value = e.target.value;
                                handleEditChange(user.id, 'status', value);
                                handleSave(user.id, 'status', value);
                              }}
                              onClose={() => setEditing({ id: null, field: null })}
                            >
                              {STATUS_OPTIONS.map((o) => (
                                <MenuItem key={o.value} value={o.value}>
                                  {o.label}
                                </MenuItem>
                              ))}
                            </Select>
                          ) : (
                            <Stack direction="row" spacing={0.5} alignItems="center" sx={hoverSx}>
                              <Label
                                color={
                                  (user.status === 'active' && 'success') ||
                                  (user.status === 'pending' && 'warning') ||
                                  (user.status === 'banned' && 'error') ||
                                  'default'
                                }
                              >
                                {statusText}
                              </Label>
                              {canEdit && (
                                <IconButton
                                  className="action-icons"
                                  size="small"
                                  onClick={() => setEditing({ id: user.id, field: 'status' })}
                                >
                                  <Iconify icon="solar:pen-bold" width={16} />
                                </IconButton>
                              )}
                              <IconButton
                                className="action-icons"
                                size="small"
                                onClick={() => handleCopy(statusText)}
                              >
                                <Iconify icon="solar:copy-bold" width={16} />
                              </IconButton>
                            </Stack>
                          )}
                        </TableCell>
                        <TableCell>
                          {editing.id === user.id && editing.field === 'roles' ? (
                            <Select
                              autoFocus
                              open
                              multiple
                              size="small"
                              variant="filled"
                              hiddenLabel
                              value={user.roles}
                              onChange={(e) => {
                                const value = e.target.value as number[];
                                handleEditChange(user.id, 'roles', value);
                              }}
                              renderValue={(selected) =>
                                (selected as number[]).map(translateRole).join(', ')
                              }
                              onClose={() => handleSave(user.id, 'roles')}
                            >
                              {roles.map((r) => {
                                const key = r.name.toLowerCase();
                                return (
                                  <MenuItem key={r.id} value={r.id}>
                                    <Checkbox checked={user.roles.includes(r.id)} />
                                    <ListItemText primary={__(`pages/users.roles.${key}`)} />
                                  </MenuItem>
                                );
                              })}
                            </Select>
                          ) : (
                            <Stack direction="row" spacing={0.5} alignItems="center" sx={hoverSx}>
                              {rolesText}
                              {canEdit && (
                                <IconButton
                                  className="action-icons"
                                  size="small"
                                  onClick={() => setEditing({ id: user.id, field: 'roles' })}
                                >
                                  <Iconify icon="solar:pen-bold" width={16} />
                                </IconButton>
                              )}
                              <IconButton
                                className="action-icons"
                                size="small"
                                onClick={() => handleCopy(rolesText)}
                              >
                                <Iconify icon="solar:copy-bold" width={16} />
                              </IconButton>
                            </Stack>
                          )}
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={0.5} alignItems="center" sx={hoverSx}>
                            {user.created_at}
                            <IconButton
                              className="action-icons"
                              size="small"
                              onClick={() => handleCopy(user.created_at)}
                            >
                              <Iconify icon="solar:copy-bold" width={16} />
                            </IconButton>
                          </Stack>
                        </TableCell>
                        <TableCell align="center">
                          <Stack direction="row" spacing={1} justifyContent="center">
                            <IconButton size="small">
                              <Iconify icon="solar:eye-bold" />
                            </IconButton>
                            {canEdit && (
                              <IconButton
                                component={RouterLink}
                                href={route('users.edit', user.id)}
                                size="small"
                                color="primary"
                              >
                                <Iconify icon="solar:pen-bold" />
                              </IconButton>
                            )}
                            {canDelete && (
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => {
                                  if (user.id === authUserId) {
                                    toast.error(__('pages/users.self_delete_error'));
                                  } else {
                                    setDeleteId(user.id);
                                  }
                                }}
                              >
                                <Iconify icon="solar:trash-bin-trash-bold" />
                              </IconButton>
                            )}
                          </Stack>
                        </TableCell>
                      </TableRow>
                    );
                  })}

                  {paginatedUsers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        {__('pages/users.no_data')}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              component="div"
              count={filteredUsers.length}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 25]}
            />
          </Card>
        </DashboardContent>
      </DashboardLayout>

      <UserDeleteDialog
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onDelete={handleDelete}
      />
    </>
  );
}

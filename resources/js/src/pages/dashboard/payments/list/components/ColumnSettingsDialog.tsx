import { useRef } from 'react';
import type React from 'react';

import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';

import { Iconify } from 'src/components/iconify';
import { useLang } from 'src/hooks/useLang';

import type { ColumnKey, ColumnSetting } from '../../types';

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  columns: ColumnSetting[];
  onChange: (columns: ColumnSetting[]) => void;
  onClose: () => void;
  onSave: () => void;
};

export function ColumnSettingsDialog({ open, columns, onChange, onClose, onSave }: Props) {
  const { __ } = useLang();
  const dragKeyRef = useRef<ColumnKey | null>(null);

  const toggleColumnVisibility = (key: ColumnKey) => {
    onChange(columns.map((column) => (column.key === key ? { ...column, visible: !column.visible } : column)));
  };

  const startDrag = (event: React.DragEvent<HTMLDivElement>, key: ColumnKey) => {
    event.dataTransfer?.setData('text/plain', key);
    event.dataTransfer.effectAllowed = 'move';
    dragKeyRef.current = key;
  };

  const handleDragEnter = (event: React.DragEvent<HTMLDivElement>, targetKey: ColumnKey) => {
    event.preventDefault();
    const dragKey = dragKeyRef.current;
    if (!dragKey || dragKey === targetKey) return;

    const currentIndex = columns.findIndex((col) => col.key === dragKey);
    const targetIndex = columns.findIndex((col) => col.key === targetKey);
    if (currentIndex === -1 || targetIndex === -1) return;

    const updated = [...columns];
    const [moved] = updated.splice(currentIndex, 1);
    updated.splice(targetIndex, 0, moved);
    dragKeyRef.current = targetKey;
    onChange(updated);
  };

  const handleDragEnd = () => {
    dragKeyRef.current = null;
  };

  const handleSave = () => {
    const visibleColumns = columns.some((column) => column.visible);
    if (!visibleColumns) return;
    onSave();
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{__('pages/payments.settings')}</DialogTitle>
      <DialogContent>
        <List dense>
          {columns.map((column) => (
            <ListItem
              key={column.key}
              disableGutters
              draggable
              onDragStart={(event) => startDrag(event, column.key)}
              onDragEnter={(event) => handleDragEnter(event, column.key)}
              onDragOver={(event) => event.preventDefault()}
              onDragEnd={handleDragEnd}
              secondaryAction={
                <Checkbox
                  edge="end"
                  checked={column.visible}
                  onChange={() => toggleColumnVisibility(column.key)}
                  onClick={(event) => event.stopPropagation()}
                  inputProps={{ 'aria-label': column.label }}
                />
              }
            >
              <ListItemIcon sx={{ minWidth: 32 }}>
                <Iconify icon="solar:menu-dots-bold" />
              </ListItemIcon>
              <ListItemText primary={column.label} />
            </ListItem>
          ))}
        </List>
      </DialogContent>
      <DialogActions>
        <Button color="inherit" onClick={onClose}>
          {__('pages/payments.close')}
        </Button>
        <Button variant="contained" onClick={handleSave}>
          {__('pages/payments.save')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

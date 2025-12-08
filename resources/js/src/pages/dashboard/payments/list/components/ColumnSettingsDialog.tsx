import { useMemo, useState } from 'react';

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
import Box from '@mui/material/Box';

import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  arrayMove,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

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

type SortableRowProps = {
  column: ColumnSetting;
  onToggle: (key: ColumnKey) => void;
};

function SortableRow({ column, onToggle }: SortableRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: column.key });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <ListItem
      ref={setNodeRef}
      style={style}
      disableGutters
      sx={{
        px: 1,
        borderRadius: 1,
        bgcolor: isDragging ? 'action.selected' : 'transparent',
        userSelect: 'none',
      }}
    >
      {/* Drag handle — только он таскается */}
      <Box
        {...attributes}
        {...listeners}
        sx={{
          display: 'flex',
          alignItems: 'center',
          cursor: isDragging ? 'grabbing' : 'grab',
          pr: 1,
          touchAction: 'none', // важно для pointer-sensor
        }}
      >
        <ListItemIcon sx={{ minWidth: 32 }}>
          <Iconify icon="solar:menu-dots-bold" />
        </ListItemIcon>
      </Box>

      {/* Клик по тексту тоже переключает visible */}
      <ListItemText
        primary={column.label}
        onClick={() => onToggle(column.key)}
        sx={{ cursor: 'pointer' }}
      />

      <Checkbox
        edge="end"
        checked={column.visible}
        onChange={() => onToggle(column.key)}
        onClick={(e) => e.stopPropagation()}
        inputProps={{ 'aria-label': column.label }}
      />
    </ListItem>
  );
}

export function ColumnSettingsDialog({
                                       open,
                                       columns,
                                       onChange,
                                       onClose,
                                       onSave,
                                     }: Props) {
  const { __ } = useLang();

  // sensors: мышь/тач + клавиатура
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor)
  );

  const ids = useMemo(() => columns.map((c) => c.key), [columns]);

  const toggleColumnVisibility = (key: ColumnKey) => {
    onChange(
      columns.map((c) => (c.key === key ? { ...c, visible: !c.visible } : c))
    );
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = columns.findIndex((c) => c.key === active.id);
    const newIndex = columns.findIndex((c) => c.key === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const updated = arrayMove(columns, oldIndex, newIndex);
    onChange(updated);
  };

  const handleSave = () => {
    if (!columns.some((c) => c.visible)) return;
    onSave();
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{__('pages/payments.settings')}</DialogTitle>

      <DialogContent>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={ids} strategy={verticalListSortingStrategy}>
            <List dense>
              {columns.map((column) => (
                <SortableRow
                  key={column.key}
                  column={column}
                  onToggle={toggleColumnVisibility}
                />
              ))}
            </List>
          </SortableContext>
        </DndContext>
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

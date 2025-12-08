import {useMemo, useState} from 'react';

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
  DragOverlay,
  defaultDropAnimationSideEffects,
  type DragEndEvent,
  type DragStartEvent,
  type DragCancelEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  arrayMove,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {CSS} from '@dnd-kit/utilities';

import {Iconify} from 'src/components/iconify';
import {useLang} from 'src/hooks/useLang';

import type {ColumnKey, ColumnSetting} from '../../types';

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
  overlayMode?: boolean;
};

function SortableRow({column, onToggle, overlayMode = false}: SortableRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({id: column.key});

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: transition ?? 'transform 180ms cubic-bezier(0.2, 0.8, 0.2, 1)',
    opacity: isDragging && !overlayMode ? 0.6 : 1,
    boxShadow: overlayMode ? '0 8px 24px rgba(0,0,0,0.18)' : undefined,
    transformOrigin: '0 0',
  };

  return (
    <ListItem
      ref={setNodeRef}
      style={style}
      disableGutters
      sx={{
        px: 1,
        borderRadius: 1,
        bgcolor: overlayMode
          ? 'background.paper'
          : isDragging
            ? 'action.selected'
            : 'transparent',
        userSelect: 'none',

        // эффект "тусклой" строки, если колонка скрыта
        opacity: column.visible ? 1 : 0.5,
        filter: column.visible ? 'none' : 'grayscale(0.2)',

        transition: (theme) =>
          theme.transitions.create(['background-color', 'transform', 'box-shadow', 'opacity'], {
            duration: theme.transitions.duration.shortest,
          }),

        // лёгкий hover "оживляет" список
        '&:hover': !overlayMode
          ? {
            bgcolor: 'action.hover',
            transform: 'translateX(2px)',
          }
          : undefined,
      }}
    >
      {/* Drag handle — только он таскается */}
      <Box
        ref={setActivatorNodeRef}
        {...attributes}
        {...listeners}
        sx={{
          display: 'flex',
          alignItems: 'center',
          cursor: isDragging ? 'grabbing' : 'grab',
          pr: 1,
          touchAction: 'none', // важно для pointer-sensor

          color: 'text.secondary',
          transition: (theme) =>
            theme.transitions.create(['color', 'transform'], {
              duration: theme.transitions.duration.shortest,
            }),
          '&:hover': {
            color: 'text.primary',
            transform: 'scale(1.05)',
          },
        }}
      >
        <ListItemIcon sx={{minWidth: 32}}>
          <Iconify icon="lucide:grip-vertical"/>
        </ListItemIcon>
      </Box>

      {/* Клик по тексту тоже переключает visible */}
      <ListItemText
        primary={column.label}
        onClick={() => onToggle(column.key)}
        onPointerDown={(e) => e.stopPropagation()}
        sx={{cursor: 'pointer'}}
      />

      <Checkbox
        edge="end"
        checked={column.visible}
        onChange={() => onToggle(column.key)}
        onClick={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
        slotProps={{
          input: {'aria-label': column.label},
        }}
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
  const {__} = useLang();

  const sensors = useSensors(
    useSensor(PointerSensor, {activationConstraint: {distance: 6}}),
    useSensor(KeyboardSensor)
  );

  const ids = useMemo(() => columns.map((c) => c.key), [columns]);

  const [activeId, setActiveId] = useState<ColumnKey | null>(null);
  const activeColumn = activeId ? columns.find((c) => c.key === activeId) ?? null : null;

  const dropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: {
        active: {opacity: '0.5'},
      },
    }),
  };

  const toggleColumnVisibility = (key: ColumnKey) => {
    onChange(
      columns.map((c) => (c.key === key ? {...c, visible: !c.visible} : c))
    );
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as ColumnKey);
  };

  const handleDragCancel = (_event: DragCancelEvent) => {
    setActiveId(null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);

    const {active, over} = event;
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
          onDragStart={handleDragStart}
          onDragCancel={handleDragCancel}
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

          {/* “Плавающая карточка” во время перетаскивания */}
          <DragOverlay dropAnimation={dropAnimation}>
            {activeColumn ? (
              <SortableRow
                column={activeColumn}
                onToggle={() => {
                }}
                overlayMode
              />
            ) : null}
          </DragOverlay>
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

import Button from '@mui/material/Button';
import { ConfirmDialog } from 'src/components/custom-dialog/confirm-dialog';
import { useLang } from 'src/hooks/useLang';

// ----------------------------------------------------------------------

interface Props {
  open: boolean;
  onClose: () => void;
  onDelete: () => void;
}

export function UserDeleteDialog({ open, onClose, onDelete }: Props) {
  const { __ } = useLang();

  return (
    <ConfirmDialog
      open={open}
      onClose={onClose}
      title={__('pages/users.delete_user')}
      content={__('pages/users.delete_confirm')}
      action={
        <Button color="error" variant="contained" onClick={onDelete}>
          {__('pages/users.delete')}
        </Button>
      }
    />
  );
}

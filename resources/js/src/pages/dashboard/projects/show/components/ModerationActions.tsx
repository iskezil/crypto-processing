import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';

import type { ReactNode } from 'react';

import type { Project } from '../../types';

type ModerationActionsProps = {
  canModerate: boolean;
  status: Project['status'];
  moderationComment: string;
  onChangeComment: (value: string) => void;
  onModerate: (action: 'approve' | 'reject' | 'to_pending') => void;
  labels: {
    comment: string;
    approve: string;
    reject: string;
    backToModeration: string;
  };
};

export function ModerationActions({
  canModerate,
  status,
  moderationComment,
  onChangeComment,
  onModerate,
  labels,
}: ModerationActionsProps) {
  if (!canModerate) {
    return null;
  }

  return (
    <Card sx={styles.card}>
      <Stack spacing={2} sx={styles.content}>
        <TextField
          label={labels.comment}
          multiline
          minRows={2}
          fullWidth
          margin="dense"
          size="small"
          variant="filled"
          value={moderationComment}
          onChange={(event) => onChangeComment(event.target.value)}
        />

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
          {status === 'pending' && (
            <>
              <Button variant="contained" color="success" onClick={() => onModerate('approve')} sx={styles.button}>
                {labels.approve}
              </Button>
              <Button variant="contained" color="error" onClick={() => onModerate('reject')} sx={styles.button}>
                {labels.reject}
              </Button>
            </>
          )}

          {status === 'rejected' && (
            <>
              <Button
                variant="outlined"
                color="warning"
                onClick={() => onModerate('to_pending')}
                sx={styles.button}
              >
                {labels.backToModeration}
              </Button>
              <Button variant="contained" color="success" onClick={() => onModerate('approve')} sx={styles.button}>
                {labels.approve}
              </Button>
            </>
          )}

          {status === 'approved' && (
            <>
              <Button
                variant="outlined"
                color="warning"
                onClick={() => onModerate('to_pending')}
                sx={styles.button}
              >
                {labels.backToModeration}
              </Button>
              <Button variant="contained" color="error" onClick={() => onModerate('reject')} sx={styles.button}>
                {labels.reject}
              </Button>
            </>
          )}
        </Stack>
      </Stack>
    </Card>
  );
}

ModerationActions.PendingAlert = function PendingAlert({ children }: { children: ReactNode }) {
  return <Alert severity="warning" sx={styles.alert}>{children}</Alert>;
};

const styles = {
  card: { p: 3, mb: 3 },
  content: { mt: 3 },
  button: { flexGrow: 1 },
  alert: { mb: 2 },
};

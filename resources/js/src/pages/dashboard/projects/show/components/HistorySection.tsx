import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Timeline from '@mui/lab/Timeline';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';

import type { ModerationLog, ProjectApiKey } from '../../types';

type HistorySectionProps = {
  __: (key: string, replaces?: Record<string, string | number> | string) => string;
  moderationLogs: ModerationLog[];
  statusColors: Record<string, 'warning' | 'success' | 'error'>;
};

export function HistorySection({ __, moderationLogs, statusColors }: HistorySectionProps) {
  if (!moderationLogs.length) {
    return <Alert severity="info">{__('pages/projects.integration.history_empty')}</Alert>;
  }

  return (
    <Stack spacing={2}>
      <Timeline sx={styles.timeline}>
        {moderationLogs.map((log, index) => {
          const color = statusColors[log.status] || 'warning';
          const hasMore = index < moderationLogs.length - 1;

          return (
            <TimelineItem key={log.id}>
              <TimelineSeparator>
                <TimelineDot color={color} />
                {hasMore && <TimelineConnector />}
              </TimelineSeparator>
              <TimelineContent>
                <Stack spacing={0.5}>
                  <Typography variant="subtitle2">{__(`pages/projects.status.${log.status}`)}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {log.created_at}
                  </Typography>
                  {log.moderator && (
                    <Typography variant="body2">
                      {__('pages/projects.integration.moderator', { name: log.moderator.name })}
                    </Typography>
                  )}
                  {log.comment && (
                    <Typography variant="body2" color="text.secondary">
                      {log.comment}
                    </Typography>
                  )}
                </Stack>
              </TimelineContent>
            </TimelineItem>
          );
        })}
      </Timeline>
    </Stack>
  );
}

type RevokedKeysAccordionProps = {
  __: (key: string, replaces?: Record<string, string | number> | string) => string;
  revokedKeys: ProjectApiKey[];
};

export function RevokedKeysAccordion({ __, revokedKeys }: RevokedKeysAccordionProps) {
  if (!revokedKeys.length) return null;

  return (
    <Accordion>
      <AccordionSummary expandIcon={<Iconify icon="solar:alt-arrow-down-linear" width={18} />}>
        <Typography variant="subtitle2">{__('pages/projects.integration.revoked_keys')}</Typography>
      </AccordionSummary>

      <AccordionDetails>
        <Timeline sx={styles.timeline}>
          {revokedKeys.map((key, index) => {
            const hasMore = index < revokedKeys.length - 1;
            const secretValue = key.secret ?? key.plain_text_token ?? '—';

            return (
              <TimelineItem key={key.id}>
                <TimelineSeparator>
                  <TimelineDot color="info" />
                  {hasMore && <TimelineConnector />}
                </TimelineSeparator>
                <TimelineContent>
                  <Stack spacing={0.5}>
                    <Typography variant="subtitle2">
                      {__('pages/projects.integration.revoked_key_item', {
                        date: key.revoked_at ?? key.created_at,
                      })}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {__('pages/projects.integration.generated_at', { date: key.created_at })}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {__('pages/projects.integration.key', { key: secretValue })}
                    </Typography>
                  </Stack>
                </TimelineContent>
              </TimelineItem>
            );
          })}
        </Timeline>
      </AccordionDetails>
    </Accordion>
  );
}

const styles = {
  timeline: { p: 0 },
};

export type ModerationLog = {
  id: number;
  status: string;
  comment: string | null;
  moderator?: { id: number; name: string; email: string } | null;
  created_at: string;
};

export type ProjectApiKey = {
  id: number;
  plain_text_token?: string | null;
  secret?: string | null;
  status: 'moderation' | 'active' | 'rejected' | 'revoked';
  revoked_at?: string | null;
  created_at: string;
};

export type TokenNetwork = {
  id: number;
  full_code: string;
  stable_coin?: boolean;
  token?: { name?: string; code?: string; icon_path?: string; icon_url?: string };
  network?: { name?: string; code?: string; icon_path?: string; icon_url?: string; network?: string };
};

export type BreadcrumbLink = { name: string; href?: string };

export type Project = {
  id: number;
  ulid: string;
  name: string;
  status: 'pending' | 'approved' | 'rejected';
  activity_type?: string;
  description?: string | null;
  platform?: 'website' | 'telegram_bot' | 'vk_bot' | 'other';
  project_url?: string | null;
  success_url?: string | null;
  fail_url?: string | null;
  notify_url?: string | null;
  logo?: string | null;
  moderation_logs?: ModerationLog[];
  token_networks?: TokenNetwork[];
  api_keys?: ProjectApiKey[];
  service_fee?: number | null;
};

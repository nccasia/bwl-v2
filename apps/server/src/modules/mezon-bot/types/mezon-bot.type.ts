export interface MezonMessageEvent {
  channel_id?: string;
  channel_private?: number;
  sender_id?: string;
  user_id?: string;
  username?: string;
  display_name?: string;
  avatar?: string;
  message_id?: string;
  id?: string;
  content?: { t?: string } | unknown;
  attachments?: Array<{ filetype?: string; url?: string }>;
}

export interface MezonChannelEvent {
  channel_id?: string;
  id?: string;
  channel_label?: string;
  name?: string;
  channel_private?: boolean | number;
}

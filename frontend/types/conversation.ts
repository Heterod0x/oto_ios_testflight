export type ConversationStatus =
  | 'not_started'
  | 'processing'
  | 'completed'
  | 'failed';

export type ConversationDTO = {
  id: string;
  analysis_status: string;
  available_duration: string | null;
  contribution_status: string;
  created_at: string;
  estimated_points: number;
  file_name: string;
  file_path: string;
  inner_status: string;
  language: string | null;
  location: string | null;
  mime_type: string;
  place: string | null;
  points: number;
  situation: string | null;
  status: ConversationStatus;
  time: string | null;
  updated_at: string;
  user_id: string;
  verification_status: string;
};

export type ConversationAudioUrlDTO = {
  signed_url: string;
  file_name: string;
  mime_type: string;
  expires_in_minutes: number;
};

export type ConversationAudioFileListDTO = {
  [key: string]: { id: string; title: string; localTimezoneDate: string }[];
};

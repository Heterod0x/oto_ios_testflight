import { Audio } from 'expo-av';
import {
  ConversationAudioFileListDTO,
  ConversationDTO,
} from '@/types/conversation';
import * as Localization from 'expo-localization';

export const formatDuration = (durationMs: number) => {
  const seconds = Math.floor(durationMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds
    .toString()
    .padStart(2, '0')}`;
};

export const getAudioStatus = async (uri: string) => {
  const { sound } = await Audio.Sound.createAsync({ uri });
  const status = await sound.getStatusAsync();
  await sound.unloadAsync();
  return status;
};

export const formatDateByCurrentTimezone = (date: string) => {
  const dateObj = new Date(date);

  return new Intl.DateTimeFormat(Localization.getLocales()[0].regionCode, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(dateObj);
};

export const convertAudioFileList = (
  conversations: ConversationDTO[]
): ConversationAudioFileListDTO => {
  const audioLabelList = {};
  conversations.forEach((conversation) => {
    const formattedDate = formatDateByCurrentTimezone(conversation.created_at);

    audioLabelList[formattedDate] = [
      ...(audioLabelList[formattedDate] || []),
      {
        id: conversation.id,
        title: conversation.file_name,
        localTimezoneDate: formattedDate,
      },
    ];
  });
  return audioLabelList;
};

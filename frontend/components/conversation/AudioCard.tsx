import { TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { Card, CardBody } from '@/components/ui/card';
import PlayIcon from '@/assets/images/play.svg';
import PauseIcon from '@/assets/images/pause.svg';
import { Waveform } from '@/components/ui/wave-form';
import useGlobalAudioPlayer from '@/hooks/useGlobalAudioPlayer';
import { ConversationAudioFileListDTO } from '@/types/conversation';
import { fetchConversationAudioUrl } from '@/services/api';
import { useAuth } from '@/lib/oto-auth';

let auidoUrlStorage = '';

export default function AudioCard({
  conversation,
}: {
  conversation: ConversationAudioFileListDTO[keyof ConversationAudioFileListDTO][number];
}) {
  const { user, getAccessToken } = useAuth();
  const router = useRouter();

  const {
    isLoading: audioLoading,
    loadAndPlayAudio,
    playPause,
    stop,
    isCurrentPlaying,
  } = useGlobalAudioPlayer();

  const handleNavigateToRecording = (conversationId: string) => {
    if (isCurrentPlaying(conversationId)) {
      stop();
    }
    router.push({
      pathname: '/(tabs)/recording',
      params: { conversationId, mode: 'edit' },
    });
  };

  const handlePlayPause = async (id: string) => {
    if (isCurrentPlaying(id)) {
      await playPause();
    } else {
      if (auidoUrlStorage) {
        await loadAndPlayAudio(conversation.id, auidoUrlStorage);
        return;
      }
      const token = (await getAccessToken()) || '';
      const audioData = await fetchConversationAudioUrl(
        conversation.id,
        user.id,
        token
      );

      if (!audioData) return;
      if (audioLoading) {
        await stop();
      }
      // Load and play this conversation
      if (audioData?.signed_url) {
        auidoUrlStorage = audioData.signed_url;
        await loadAndPlayAudio(conversation.id, audioData.signed_url);
      }
    }
  };

  return (
    <TouchableOpacity
      onPress={() => handleNavigateToRecording(conversation.id)}
    >
      <Card
        variant="outline"
        size="sm"
        className="bg-gray-200 border-gray-200 mb-3"
      >
        <CardBody>
          <Box className="flex-row items-center justify-between">
            {/* Play Button */}
            <TouchableOpacity
              className="mr-4"
              onPress={async () => await handlePlayPause(conversation.id)}
              disabled={audioLoading}
            >
              <Box className="w-12 h-12 bg-black rounded-full items-center justify-center">
                {isCurrentPlaying(conversation.id) ? (
                  <PauseIcon color="#ffffff" size={18} width={18} height={18} />
                ) : (
                  <PlayIcon color="#ffffff" size={18} width={18} height={18} />
                )}
              </Box>
            </TouchableOpacity>

            {/* Title and Date */}
            <Box className="flex-1">
              <Text
                size="md"
                weight="semibold"
                className="text-gray-800 mb-1"
                style={{ width: 150 }}
                numberOfLines={1}
              >
                {conversation.title}
              </Text>
              <Text
                size="sm"
                weight="normal"
                className="text-gray-600 font-body"
              >
                {conversation.localTimezoneDate}
              </Text>
            </Box>

            {/* Waveform */}
            <Box style={{ flexShrink: 0 }}>
              <Waveform />
            </Box>
          </Box>
        </CardBody>
      </Card>
    </TouchableOpacity>
  );
}

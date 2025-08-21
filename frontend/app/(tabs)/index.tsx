import { SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import useConversations from '@/hooks/useConversations';
import { convertAudioFileList, formatDateByCurrentTimezone } from '@/lib/audio';
import AudioCard from '@/components/conversation/AudioCard';

export default function HomeScreen() {
  // TODO: ログインしていない場合はログイン画面に遷移する
  // TODO: today以外の日付を確認
  const today = formatDateByCurrentTimezone(new Date().toISOString());
  const { data: conversations, loading, error } = useConversations();

  // TODO: Edge case: No audio files.
  if (!conversations) return null;
  const convertedConversations = convertAudioFileList(conversations);

  const whiteBackground = '#ffffff';

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: whiteBackground }}
    >
      {/* Header */}
      <Box className="flex-row items-center justify-center py-4 px-4 mb-4">
        <TouchableOpacity className="flex-row items-center">
          <Text size="xl" weight="semibold" className="text-gray-800">
            Today
          </Text>
          <Box className="ml-2">
            <Ionicons name="chevron-forward" size={14} color="#6b7280" />
          </Box>
        </TouchableOpacity>
      </Box>

      {/* Audio Recordings List */}
      <ScrollView
        className="flex-1 px-4"
        showsVerticalScrollIndicator={false}
        style={{ backgroundColor: whiteBackground }}
      >
        <Box>
          {convertedConversations[today]?.map((conversation) => (
            <AudioCard key={conversation.id} conversation={conversation} />
          ))}
        </Box>
      </ScrollView>
    </SafeAreaView>
  );
}

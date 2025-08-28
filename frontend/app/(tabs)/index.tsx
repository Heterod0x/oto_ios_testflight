import { SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import useConversations from '@/hooks/useConversations';
import { convertAudioFileList, formatDateByCurrentTimezone } from '@/lib/audio';
import AudioCard from '@/components/conversation/AudioCard';

export default function HomeScreen() {
  const pastOneWeekDate = [];
  // 一週間分を表示
  for (let i = 0; i < 7; i++) {
    pastOneWeekDate.push(
      formatDateByCurrentTimezone(
        new Date(new Date().setDate(new Date().getDate() - i)).toISOString()
      )
    );
  }

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
            Recents
          </Text>
          {/* <Box className="ml-2">
            <Ionicons name="chevron-forward" size={14} color="#6b7280" />
          </Box> */}
        </TouchableOpacity>
      </Box>

      {/* Audio Recordings List */}
      <ScrollView
        className="flex-1 px-4"
        showsVerticalScrollIndicator={false}
        style={{ backgroundColor: whiteBackground }}
      >
        <Box>
          {pastOneWeekDate.map((date) =>
            convertedConversations[date]?.map((conversation, i) => (
              <Box key={`box-${conversation.id}-${date}`} className="mb-4">
                {i === 0 && (
                  <Text
                    key={`text-${conversation.id}-${date}`}
                    className="mb-2 text-center text-typography-600"
                  >
                    {date}
                  </Text>
                )}
                <AudioCard key={conversation.id} conversation={conversation} />
              </Box>
            ))
          )}
        </Box>
      </ScrollView>
    </SafeAreaView>
  );
}

import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { TouchableOpacity } from 'react-native';
import { formatDuration } from '@/lib/audio';
import { Card, CardBody } from '@/components/ui/card';
import useConversation from '@/hooks/useConversation';
import PlayIcon from '@/assets/images/play.svg';
import PauseIcon from '@/assets/images/pause.svg';
import ForwardIcon from '@/assets/images/forward.svg';
import BackwardIcon from '@/assets/images/backward.svg';
import useAudioSignedUrl from '@/hooks/useAudioSignedUrl';
import useGlobalAudioPlayer from '@/hooks/useGlobalAudioPlayer';
import WriteIcon from '@/assets/images/write.svg';
import { useEffect } from 'react';

export default function RecordingCompleteScreen({
  handleDiscardRecording,
  contributeRecording,
  moveToClaimPage,
  conversationId,
}: {
  handleDiscardRecording: () => void;
  contributeRecording: (conversationId: string) => void;
  moveToClaimPage: () => void;
  conversationId: string;
}) {
  const {
    data: conversation,
    loading,
    error,
  } = useConversation(conversationId);

  const {
    data: audioData,
    loading: audioDataLoading,
    error: audioDataError,
  } = useAudioSignedUrl(conversationId);

  const {
    isPlaying,
    playbackPosition,
    playbackDuration,
    isLoading: audioLoading,
    initLoadAudio,
    playPause,
    forward,
    backward,
  } = useGlobalAudioPlayer();

  // Load audio when audioData is available
  useEffect(() => {
    if (audioData?.signed_url) {
      initLoadAudio(audioData.signed_url);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioData?.signed_url]);

  if (loading || audioDataLoading || audioLoading)
    return <Text>Loading...</Text>;
  if (error || audioDataError) return <Text>Error: {error}</Text>;
  if (!conversation) return <Text>No conversation found</Text>;
  if (!audioData) return <Text>No audio data found</Text>;
  // TODO: Error handling on UI
  if (conversation.verification_status !== 'accepted') {
    // handleDiscardRecording();
  }

  return (
    <>
      <Card
        variant="outline"
        size="sm"
        className="w-full mb-4 p-6 bg-gray-100 rounded-2xl flex-1"
      >
        <CardBody className="flex flex-col justify-between items-center h-full pt-4 pb-4">
          <Box className="">
            <Text
              size="md"
              weight="semibold"
              className="text-center font-inter"
            >
              {conversation.file_name}
            </Text>
            <Text
              size="sm"
              weight="medium"
              className="text-typography-600 text-center font-body mt-2"
            >
              Earn {conversation.estimated_points} points
            </Text>
          </Box>
          <Box className="flex flex-row justify-center items-center h-1/2 w-full">
            <Text
              size="sm"
              weight="medium"
              className="text-typography-600  text-center font-body"
            >
              Waveform here...
            </Text>
          </Box>

          {/* Playback Controls - at bottom of card */}
          <Box className="flex flex-col items-center mt-4">
            <Box className="flex flex-row gap-2 mb-2">
              <Text
                size="sm"
                weight="medium"
                className="text-typography-600 text-center font-body"
              >
                {formatDuration(playbackPosition)} /{' '}
                {formatDuration(playbackDuration)}
              </Text>
            </Box>
            <Box className="flex flex-row gap-8 mt-3 ">
              <TouchableOpacity
                className="flex flex-row justify-center items-center"
                onPress={() => backward(10)}
                activeOpacity={0.8}
              >
                <BackwardIcon height={20} color="#000000" />
              </TouchableOpacity>
              <TouchableOpacity
                className="flex flex-row justify-center items-center"
                onPress={playPause}
                activeOpacity={0.8}
              >
                {isPlaying ? (
                  <PauseIcon height={20} color="#000000" />
                ) : (
                  <PlayIcon height={20} color="#000000" />
                )}
              </TouchableOpacity>
              <TouchableOpacity
                className="flex flex-row justify-center items-center"
                onPress={() => forward(10)}
                activeOpacity={0.8}
              >
                <ForwardIcon height={20} color="#000000" />
              </TouchableOpacity>
            </Box>
          </Box>
        </CardBody>
      </Card>

      {/* Bottom buttons section */}
      <Box className="w-full flex flex-col items-center">
        <Card variant="outline" size="sm" className="px-4 w-full mb-4">
          <CardBody>
            <Box className="flex flex-row gap-2">
              <Text size="sm" weight="semibold" className="font-inter">
                Provided recordings
              </Text>
            </Box>
            <Box className="flex flex-row gap-2">
              <Text
                size="sm"
                weight="medium"
                className="text-typography-600 text-center font-body"
              >
                Earn {conversation.estimated_points} points
              </Text>
            </Box>
          </CardBody>
        </Card>
        <Box className="flex flex-row gap-2 w-full pb-24">
          <TouchableOpacity
            className={`flex flex-row justify-center items-center bg-outline-100 px-4 py-3 flex-1 rounded-full`}
            onPress={handleDiscardRecording}
            activeOpacity={0.8}
          >
            <Text size="lg" weight="semibold" className="font-inter">
              Not now
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex flex-row justify-center items-center bg-background-dark px-4 py-3 flex-1 rounded-full gap-2`}
            onPress={() => {
              if (conversation.contribution_status === 'contributed') {
                moveToClaimPage();
              } else {
                contributeRecording(conversationId);
              }
            }}
            activeOpacity={0.8}
          >
            <WriteIcon height={19} width={19} color="#ffffff" />
            <Text size="lg" weight="semibold" className="text-white font-inter">
              Contribute
            </Text>
          </TouchableOpacity>
        </Box>
      </Box>
    </>
  );
}

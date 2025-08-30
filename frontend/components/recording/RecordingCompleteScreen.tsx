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
import { useEffect, useState, useRef } from 'react';
import { useLoading } from '@/contexts/LoadingContext';
import { Toggle } from '@/components/ui/toggle';
import UploadIcon from '@/assets/images/upload.svg';
import PlayWaveform from '@/lib/play-waveform';
import { navigateToTabs } from '@/lib/session';
import FlashMessage, { showMessage } from 'react-native-flash-message';

export default function RecordingCompleteScreen({
  handleDiscardRecording,
  contributeRecording,
  moveToClaimPage,
  conversationId,
  setErrorStatus,
}: {
  handleDiscardRecording: () => void;
  contributeRecording: (conversationId: string) => void;
  moveToClaimPage: () => void;
  conversationId: string;
  setErrorStatus: (status: { message: string; isRedirect: boolean }) => void;
}) {
  const { showLoading, hideLoading, setActionClickHandler } = useLoading();
  const [isProvidingRecordings, setIsProvidingRecordings] = useState(false);
  const refetchCount = useRef(0);

  const {
    data: conversation,
    loading,
    error,
    refetch,
  } = useConversation(conversationId);

  useEffect(() => {
    if (conversation && conversation.status !== 'completed') {
      // Check status every 3 seconds for 60 seconds.
      const interval = setInterval(() => {
        refetch();
        refetchCount.current++;
      }, 3000);

      if (refetchCount.current > 20) {
        setErrorStatus({
          message: 'Analysis timed out. Please try again.',
          isRedirect: true,
        });

        clearInterval(interval);
        return;
      }
      showLoading('Analysis in progress...', {
        text: 'Back to Home',
        variant: 'outline',
      });

      // キャンセルボタンのハンドラーを設定
      setActionClickHandler(() => {
        hideLoading();
        navigateToTabs('/');
      });

      return () => {
        clearInterval(interval);
        hideLoading();
      };
    } else if (refetchCount.current > 0) {
      showMessage({
        message: 'Analysis completed',
        description: 'You can now contribute your recording',
        type: 'success',
      });
      hideLoading();
    }
  }, [conversation, refetch]);

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
    audioLevels,
  } = useGlobalAudioPlayer();

  // Hide loading when audio finishes loading
  useEffect(() => {
    if (
      !audioLoading &&
      playbackDuration &&
      conversation.status === 'completed'
    ) {
      hideLoading();
    }
  }, [audioLoading, playbackDuration, conversation]);

  // Load audio when audioData is available
  useEffect(() => {
    if (audioData?.signed_url) {
      initLoadAudio(audioData.signed_url);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioData?.signed_url]);

  if (error || audioDataError) return <Text>Error: {error}</Text>;
  if (!conversation) return <Text>No conversation found</Text>;
  if (!audioData) return <Text>No audio data found</Text>;

  return (
    <>
      <FlashMessage position="center" duration={3000} />
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
            <PlayWaveform levels={audioLevels} isPlaying={isPlaying} />
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
            <Box className="flex flex-row items-center justify-between w-full">
              <Box className="flex flex-row items-center gap-3">
                <UploadIcon height={19} width={19} color="#6b7280" />
                <Box>
                  <Text
                    size="sm"
                    weight="semibold"
                    className="font-inter text-gray-900"
                  >
                    Provide recordings
                  </Text>
                  <Text
                    size="sm"
                    weight="medium"
                    className="text-gray-500 font-body"
                  >
                    Earn {conversation.estimated_points} points
                  </Text>
                </Box>
              </Box>
              <Toggle
                value={isProvidingRecordings}
                onValueChange={setIsProvidingRecordings}
                size="lg"
              />
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
            className={`flex flex-row justify-center items-center px-4 py-3 flex-1 rounded-full gap-2 ${
              isProvidingRecordings ? 'bg-background-dark' : 'bg-gray-300'
            }`}
            onPress={() => {
              if (!isProvidingRecordings) return; // Don't do anything if toggle is off

              if (conversation.contribution_status === 'contributed') {
                moveToClaimPage();
              } else {
                contributeRecording(conversationId);
              }
            }}
            activeOpacity={isProvidingRecordings ? 0.8 : 1}
            disabled={!isProvidingRecordings}
          >
            <WriteIcon
              height={19}
              width={19}
              color={isProvidingRecordings ? '#ffffff' : '#9ca3af'}
            />
            <Text
              size="lg"
              weight="semibold"
              className={`font-inter ${
                isProvidingRecordings ? 'text-white' : 'text-gray-400'
              }`}
            >
              Contribute
            </Text>
          </TouchableOpacity>
        </Box>
      </Box>
    </>
  );
}

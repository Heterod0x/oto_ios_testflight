import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { TouchableOpacity } from 'react-native';
import { formatDuration } from '@/lib/audio';
import PauseIcon from '@/assets/images/pause.svg';
import PlayIcon from '@/assets/images/play.svg';
import SaveIcon from '@/assets/images/save.svg';
import TrashIcon from '@/assets/images/trash.svg';
import { useState } from 'react';

export default function RecordingInProgressScreen({
  handleStopRecording,
  handleDiscardRecording,
  uploading,
  uploadProgress,
  uploadLastRecording,
  duration,
}: {
  handleStopRecording: () => Promise<void>;
  handleDiscardRecording: () => void;
  uploading: boolean;
  uploadProgress: number;
  uploadLastRecording: () => Promise<void>;
  duration: number;
}) {
  const [isPlaying, setIsPlaying] = useState(true);

  return (
    <>
      <Box className="flex flex-col gap-3 justify-center items-center">
        <Text size="xl" weight="bold" className="font-inter">
          New Recording
        </Text>
        <Text
          size="lg"
          weight="medium"
          className="text-typography-600 text-center"
        >
          {formatDuration(duration)}
        </Text>
      </Box>
      {/* Main content area - takes up available space */}
      <Box className="flex-1 flex justify-center items-center w-full">
        {/* Add your wave content here if needed */}
      </Box>

      {/* Bottom buttons section */}
      <Box className="w-full flex flex-col items-center">
        <TouchableOpacity
          className={`flex justify-center items-center border-2 border-outline-700 w-32 px-4 py-5 rounded-full mb-6`}
          onPress={() => {
            setIsPlaying((prev) => !prev);
            handleStopRecording(); // TODO: 再録音できるようにするか仕様確認
          }}
          activeOpacity={0.8}
        >
          {isPlaying ? (
            <PauseIcon height={28} color="#000000" />
          ) : (
            <PlayIcon height={28} color="#000000" />
          )}
        </TouchableOpacity>
        <Box className="flex flex-row gap-2 w-full px-4 pb-24">
          <TouchableOpacity
            className={`flex flex-row justify-center items-center bg-error-100 px-4 py-4 flex-1 rounded-full`}
            onPress={handleDiscardRecording}
            activeOpacity={0.8}
          >
            <TrashIcon height={24} color="#f02d2d" />
            <Text
              size="xl"
              weight="bold"
              className="text-error-600 font-inter ml-2"
            >
              Delete
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex flex-row justify-center items-center px-4 py-4 flex-1 rounded-full ${
              isPlaying ? 'bg-gray-300' : 'bg-background-dark'
            }`}
            onPress={isPlaying ? undefined : uploadLastRecording}
            activeOpacity={isPlaying ? 1 : 0.8}
            disabled={isPlaying}
          >
            <SaveIcon height={24} color={isPlaying ? '#9ca3af' : '#ffffff'} />
            <Text
              size="xl"
              weight="bold"
              className={`font-inter ml-2 ${
                isPlaying ? 'text-gray-400' : 'text-white'
              }`}
            >
              {uploading ? `${uploadProgress}%` : 'Save'}
            </Text>
          </TouchableOpacity>
        </Box>
      </Box>
    </>
  );
}

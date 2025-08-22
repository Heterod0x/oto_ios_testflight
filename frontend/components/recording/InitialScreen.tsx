import { Box } from '@/components/ui/box';
import { Heading, Text } from '@/components/ui/text';
import MicIcon from '@/assets/images/mic.svg';
import { TouchableOpacity } from 'react-native';

export default function InitialScreen({
  recording,
  handleStartRecording,
}: {
  recording: boolean;
  handleStartRecording: () => void;
}) {
  return (
    <Box className="flex-1 justify-center items-center px-4 mb-6">
      <Box className="items-center">
        <Heading
          size="lg"
          weight="bold"
          className="text-primary-900 mb-1 tracking-tight"
        >
          Start recording with OTO
        </Heading>
        <Text
          size="sm"
          className="text-typography-600 text-center mb-2 font-body"
        >
          Just allow access to your microphone.
        </Text>
      </Box>
      <Box className="mb-0 mt-3">
        <TouchableOpacity
          className={`flex flex-row justify-center justify-center items-center bg-background-dark px-6 py-2 rounded-full shadow-lg ${
            recording
              ? 'bg-error-600 scale-95'
              : 'bg-background-0 border-3 border-primary-600'
          }`}
          onPress={handleStartRecording}
          activeOpacity={0.8}
        >
          <MicIcon width={24} height={24} color="#FFFFFF" />
          <Text
            size="lg"
            weight="bold"
            className="text-white font-inter tracking-wider ml-2 py-2"
          >
            Allow
          </Text>
        </TouchableOpacity>
      </Box>
    </Box>
  );
}

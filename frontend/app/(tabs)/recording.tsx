import { SafeAreaView, ScrollView } from 'react-native';
import RecordingControls from '@/components/recording/RecordingControls';
import { Box } from '@/components/ui/box';
import { useLogin } from '@privy-io/expo/ui';
import { useAuth } from '@/lib/oto-auth';
import { useLocalSearchParams } from 'expo-router';
import { Button, ButtonText } from '@/components/ui/button';
import { Text } from '@/components/ui/text';

export default function RecordingScreen() {
  const { user, isReady, loginWithSolana } = useAuth();
  const { login } = useLogin();
  // Access navigation parameters
  const params = useLocalSearchParams<{
    conversationId?: string;
    mode?: string;
  }>();
  const conversationId = Array.isArray(params.conversationId)
    ? params.conversationId[0]
    : params.conversationId;
  const mode = Array.isArray(params.mode) ? params.mode[0] : params.mode;

  const handleConnectWallet = async () => {
    try {
      await loginWithSolana();
    } catch (error) {
      console.error(error);
    }
  };

  const whiteBackground = '#ffffff';

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: whiteBackground }}
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        style={{ backgroundColor: whiteBackground }}
      >
        {/* <Text className="text-typography-900 mb-4 text-md">Login with:</Text>
        <Button
          onPress={() => login({ loginMethods: ['email'] })}
          className="w-32 bg-transparent border-primary-600 border-[1px]"
        >
          <ButtonText className="text-primary-600 text-md">Email</ButtonText>
        </Button> */}
        {/* Recording Section */}
        {user && isReady && (
          <Box className="justify-center items-center">
            <RecordingControls
              conversationId={mode !== 'edit' ? null : conversationId}
            />
          </Box>
        )}

        {/* </Box> */}
      </ScrollView>
    </SafeAreaView>
  );
}

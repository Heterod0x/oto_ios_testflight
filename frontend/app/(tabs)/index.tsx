import { ActivityIndicator, SafeAreaView, ScrollView } from 'react-native';
import RecordingControls from '@/components/recording/RecordingControls';
import { Box } from '@/components/ui/box';
import { Text, Heading } from '@/components/ui/text';
import { Card, CardBody } from '@/components/ui/card';
import { Ionicons } from '@expo/vector-icons';
import usePointBalance from '@/hooks/usePointBalance';
import { useState } from 'react';
import LoginScreen from '@/components/LoginScreen';
import { useLogin } from '@privy-io/expo/ui';
import { Button, ButtonText } from "@/components/ui/button";
import { useAuth } from '@/lib/oto-auth';

export default function HomeScreen() {
  const { data: balance } = usePointBalance();
  const [isRecording, setIsRecording] = useState(false);
  const { user, isReady, loginWithSolana } = useAuth();
  const { login } = useLogin();

  const handleConnectWallet = async () => {
    try{
      await loginWithSolana();
    }catch(error){
      console.error(error);
    }
  };

  const whiteBackground = '#ffffff'
  

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: whiteBackground }}>
      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        style={{ backgroundColor: whiteBackground }}
      >
        <Box className="flex-1 mt-24 justify-center items-center px-5 py-8 pt-4 pb-12 bg-gradient-to-b from-background-0 to-background-50">
          {/* Header Section */}
          <Box className="items-center">
            <Heading size="lg" weight="bold" className="text-primary-900 mb-1 tracking-tight">
             Start recording with OTO
            </Heading>
            <Text size="sm" className="text-typography-600 text-center mb-2 font-body">
              Just allow access to your microphone.
            </Text>
            {/* <Box className="flex-row items-center mt-2">
              <Box className="w-2 h-2 bg-success-500 rounded-full mr-2" />
              <Text size="sm" className={`text-success-600 font-medium ${isRecording ? 'hidden' : ''}`}>
                Ready to record
              </Text>
              <Text size="sm" className={`text-error-600 font-medium ${isRecording ? '' : 'hidden'}`}>
                Recording...
            </Text>
          </Box> */}
          </Box>

          {/* {!isReady && <Box className="justify-center items-center h-64">
            <ActivityIndicator size="large" color="#0000ff" />
          </Box>} */}

          {/* Recording Section */}
          {user && isReady && <Box className="justify-center items-center">
            <RecordingControls isRecording={isRecording} setRecording={setIsRecording} />
          </Box>}

        </Box>
      </ScrollView>
    </SafeAreaView>
  );
}

// Temporary screen for hackathon
import ClaimScreenComponent from '@/components/recording/ClaimScreen';
import { SafeAreaView, ScrollView } from 'react-native';
import { Box } from '@/components/ui/box';
import { useState } from 'react';
import { ErrorModal } from '@/components/ui/ErrorModal';
import { navigateToTabs } from '@/lib/session';

export default function ClaimScreen() {
  const whiteBackground = '#ffffff';
  const [errorStatus, setErrorStatus] = useState<{
    message: string;
    isRedirect: boolean;
  } | null>(null);

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
        <ErrorModal
          isOpen={!!errorStatus?.message}
          onClose={async () => {
            if (errorStatus?.isRedirect) {
              navigateToTabs('/(tabs)');
            }
            setErrorStatus(null);
          }}
          message={errorStatus?.message || ''}
          title="Error"
          buttonText="OK"
        />
        <Box className="justify-center items-center">
          <Box className="h-full flex flex-col justify-end items-center w-full px-4">
            <Box className="w-full h-20" />
            <ClaimScreenComponent
              handleClaimComplete={() => {}}
              setErrorStatus={setErrorStatus}
            />
          </Box>
        </Box>
      </ScrollView>
    </SafeAreaView>
  );
}

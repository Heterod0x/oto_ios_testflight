// Temporary screen for hackathon
import ClaimScreenComponent from '@/components/recording/ClaimScreen';
import { SafeAreaView, ScrollView } from 'react-native';
import { Box } from '@/components/ui/box';

export default function ClaimScreen() {
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
        <Box className="justify-center items-center">
          <Box className="h-full flex flex-col justify-end items-center w-full px-4">
            <Box className="w-full h-20" />
            <ClaimScreenComponent
              handleClaimComplete={() => {}}
              setErrorStatus={() => {}}
            />
          </Box>
        </Box>
      </ScrollView>
    </SafeAreaView>
  );
}

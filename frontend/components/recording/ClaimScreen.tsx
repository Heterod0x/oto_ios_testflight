import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { Card, CardBody } from '@/components/ui/card';
import usePointBalance from '@/hooks/usePointBalance';
import { TouchableOpacity } from 'react-native';
import ClaimIcon from '@/assets/images/claim.svg';
import { claimPoints } from '@/services/api';
import { useAuth } from '@/lib/oto-auth';

export default function ClaimScreen({
  handleClaimComplete,
  setErrorStatus,
}: {
  handleClaimComplete: () => void;
  setErrorStatus: (status: { message: string; isRedirect: boolean }) => void;
}) {
  const {
    data: pointBalance,
    loading: pointBalanceLoading,
    error: pointBalanceError,
  } = usePointBalance();
  const { user, getAccessToken } = useAuth();

  const handleClaimPoints = async () => {
    if (!user) return;
    const token = (await getAccessToken()) || '';
    try {
      const res = await claimPoints('tx..', user.id, token);
      handleClaimComplete();
    } catch (err) {
      setErrorStatus({
        message: `Claiming points failed: ${
          err instanceof Error ? err.message : String(err)
        }`,
        isRedirect: false,
      });
      console.error('Error claiming points:', err);
    }
  };

  if (pointBalanceLoading) return <Text>Loading...</Text>;
  if (pointBalanceError) return <Text>Error: {pointBalanceError}</Text>;
  if (!pointBalance) return <Text>No point balance found</Text>;

  return (
    <>
      {/* Main Earnings Card */}
      <Card
        variant="outline"
        size="sm"
        className="w-full mb-6 p-6 bg-gray-100 rounded-2xl flex-1"
      >
        <CardBody className="flex flex-col justify-center items-center gap-4 h-full">
          {/* Earnings Title */}
          <Text size="lg" weight="bold" className="font-inter text-center mb-8">
            Earnings
          </Text>

          {/* White Circle Placeholder */}
          <Box className="w-20 h-20 bg-white rounded-full mb-4" />

          {/* Points Display */}
          <Box className="flex flex-col items-center">
            <Text size="6xl" weight="bold" className="font-inter">
              {pointBalance.points}
            </Text>
            <Text size="lg" weight="semibold" className="font-inter">
              pts
            </Text>
          </Box>
        </CardBody>
      </Card>

      {/* Available to Claim */}
      <Box className="w-full flex flex-row justify-between items-center mb-3">
        <Box className="flex flex-row items-center gap-3">
          <Box className="w-3 h-3 bg-green-200 rounded-full" />
          <Text size="md" weight="medium" className="font-body">
            Available to Claim
          </Text>
        </Box>
        <Text size="md" weight="medium" className="font-inter">
          {pointBalance.points} pts
        </Text>
      </Box>

      {/* Total Claimed */}
      <Box className="w-full flex flex-row justify-between items-center mb-8">
        <Box className="flex flex-row items-center gap-3">
          <Box className="w-3 h-3 bg-blue-500 rounded-full" />
          <Text size="md" weight="medium" className="font-body">
            Total Claimed
          </Text>
        </Box>
        <Text size="md" weight="medium" className="font-inter">
          {pointBalance.points_claimed} pts
        </Text>
      </Box>

      {/* Claim Points Button */}
      <Box className="w-full flex flex-row gap-2 pb-24">
        <TouchableOpacity
          className={`flex flex-row justify-center items-center bg-black px-4 py-3 flex-1 rounded-full`}
          onPress={handleClaimPoints}
          activeOpacity={0.8}
        >
          <ClaimIcon height={20} width={20} />
          <Text size="lg" weight="bold" className="text-white font-inter ml-2">
            Claim Points
          </Text>
        </TouchableOpacity>
      </Box>
    </>
    // </Box>
  );
}

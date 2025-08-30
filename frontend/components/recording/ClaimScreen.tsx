import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { Card, CardBody } from '@/components/ui/card';
import usePointBalance from '@/hooks/usePointBalance';
import { TouchableOpacity } from 'react-native';
import ClaimIcon from '@/assets/images/claim.svg';
import { useAuth } from '@/lib/oto-auth';
import { useBaseContract } from '@/hooks/useBaseContract';
import { useCallback, useEffect, useState } from 'react';
import FlashMessage, {
  showMessage,
  hideMessage,
} from 'react-native-flash-message'; // TODO: Consider aggregating to @/components/ui/ErrorModal
import { useLoading } from '@/contexts/LoadingContext';
import { useFocusEffect } from 'expo-router';
import { syncPointsOnServerSide } from '@/lib/point';
import { navigateToTabs } from '@/lib/session';

export default function ClaimScreen({
  handleClaimComplete,
  setErrorStatus,
}: {
  handleClaimComplete: () => void;
  setErrorStatus: (status: { message: string; isRedirect: boolean }) => void;
}) {
  const { showLoading, hideLoading } = useLoading();

  const [isPointsSynced, setIsPointsSynced] = useState(false);
  const [claimedPoints, setClaimedPoints] = useState<number>(0);
  const [availablePoints, setAvailablePoints] = useState<number>(0);

  const { user, getAccessToken } = useAuth();

  useFocusEffect(
    useCallback(() => {
      showLoading();
      hideMessage();

      (async () => {
        if (isPointsSynced) return;
        const token = (await getAccessToken()) || '';
        try {
          const isSuccess = await syncPointsOnServerSide(user?.id || '', token);
          setIsPointsSynced(isSuccess);
        } catch (err) {
          if (err.includes('Failed to sync points')) {
            console.log('you are here...');
            setErrorStatus({
              message: 'Failed to sync points. Please try again.',
              isRedirect: true,
            });
          } else {
            setErrorStatus({
              message: err.message,
              isRedirect: false,
            });
          }
          hideLoading();
          navigateToTabs('/(tabs)');
        }
      })();

      return () => {
        hideLoading();
        hideMessage();
        setIsPointsSynced(false);
      };
    }, [])
  );

  const {
    data: pointBalance,
    loading: pointBalanceLoading,
    error: pointBalanceError,
  } = usePointBalance(isPointsSynced);

  useEffect(() => {
    if (pointBalanceError) {
      setErrorStatus({
        message: pointBalanceError,
        isRedirect: true,
      });
    }
    if (isPointsSynced && !pointBalanceLoading) {
      setAvailablePoints(pointBalance?.points || 0);
      setClaimedPoints(pointBalance?.points_claimed || 0);
      hideLoading();
    }
  }, [isPointsSynced, pointBalanceLoading, pointBalanceError, pointBalance]);

  const { claimUSDC } = useBaseContract();

  const handleClaimPoints = async (points: number) => {
    if (!user) return;

    if (points <= 0) {
      setErrorStatus({
        message: 'Points to claim must be greater than 0',
        isRedirect: false,
      });
      return;
    }

    const token = (await getAccessToken()) || '';
    try {
      showLoading('Processing...');
      const txHash = await claimUSDC(points);
      console.log('txHash...', txHash);
      if (txHash) {
        const isSuccess = await syncPointsOnServerSide(user?.id || '', token);
        hideLoading();
        if (!isSuccess) return;
        setAvailablePoints(availablePoints - points);
        setClaimedPoints(claimedPoints + points);
        showMessage({
          message: 'Point Claim Success',
          description: 'Your points have been claimed successfully',
          type: 'success',
        });
        handleClaimComplete();
      } else {
        throw new Error('Failed to claim points');
      }
    } catch (err) {
      setErrorStatus({
        message: `Claiming points failed: ${
          err instanceof Error ? err.message : String(err)
        }`,
        isRedirect: false,
      });
      console.error('Error claiming points:', err);
    } finally {
      hideLoading();
    }
  };

  return (
    <>
      <FlashMessage position="center" duration={3000} />

      {/* Main Earnings Card */}
      <Card
        variant="outline"
        size="sm"
        className="w-full mb-6 p-8 bg-gray-100 rounded-2xl flex-1"
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
              {availablePoints}
            </Text>
            <Text size="lg" weight="semibold" className="font-inter">
              pts
            </Text>
          </Box>
        </CardBody>
      </Card>

      {/* Available to Claim */}
      <Box className="w-full flex flex-row justify-between items-center">
        <Box className="flex flex-row items-center gap-3">
          <Box className="w-3 h-3 bg-green-200 rounded-full" />
          <Text size="md" weight="medium" className="font-body">
            Available to Claim
          </Text>
        </Box>
        <Text size="md" weight="medium" className="font-inter">
          {availablePoints} pts
        </Text>
      </Box>

      {/* Total Claimed */}
      <Box className="w-full flex flex-row justify-between items-center mt-4">
        <Box className="flex flex-row items-center gap-3">
          <Box className="w-3 h-3 bg-blue-500 rounded-full" />
          <Text size="md" weight="medium" className="font-body">
            Total Claimed
          </Text>
        </Box>
        <Text size="md" weight="medium" className="font-inter">
          {claimedPoints} pts
        </Text>
      </Box>

      {/* Claim Points Button */}
      <Box className="w-full flex flex-row pb-14 mt-4">
        <TouchableOpacity
          className={`flex flex-row justify-center items-center bg-black px-4 py-4 flex-1 rounded-full`}
          onPress={() => {
            handleClaimPoints(availablePoints);
          }}
          activeOpacity={0.8}
        >
          <ClaimIcon height={20} width={20} />
          <Text size="lg" weight="bold" className="text-white font-inter ml-2">
            Claim Points
          </Text>
        </TouchableOpacity>
      </Box>

      {/* Version */}
      <Text size="sm" weight="medium" className="font-inter text-center">
        v0.0.1-build.3
      </Text>
    </>
  );
}

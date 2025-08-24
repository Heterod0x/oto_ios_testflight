import useAudioRecorder from '@/hooks/useAudioRecorder';
import { contributeConversation, uploadAudio } from '@/services/api';
import { useAuth } from '@/lib/oto-auth';
import React, { useCallback, useState } from 'react';
import { Box } from '@/components/ui/box';
import { ErrorModal } from '@/components/ui/ErrorModal';
import InitialScreen from './InitialScreen';
import RecordingInProgressScreen from './RecordingInProgressScreen';
import RecordingCompleteScreen from './RecordingCompleteScreen';
import ClaimScreen from './ClaimScreen';
import { useFocusEffect } from 'expo-router';

export interface RecordingControlsProps {
  conversationId?: string;
}

enum PAGE {
  INITIAL = 'initial',
  RECORDING = 'recording',
  COMPLETE = 'complete',
  CLAIM = 'claim',
}

export default function RecordingControls({
  conversationId: givenConversationId,
}: RecordingControlsProps) {
  const {
    recording,
    startRecording,
    stopRecording,
    lastRecordingUri,
    duration,
    setLastRecordingUri,
    discardRecording,
  } = useAudioRecorder();
  const { user, getAccessToken } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [conversationId, setConversationId] = useState<string | null>(
    givenConversationId || null
  );
  const [page, setPage] = useState<string>(
    givenConversationId ? PAGE.COMPLETE : PAGE.INITIAL
  );
  const [errorStatus, setErrorStatus] = useState<{
    message: string;
    isRedirect: boolean;
  } | null>(null);

  useFocusEffect(
    useCallback(() => {
      if (givenConversationId) {
        setConversationId(givenConversationId);
        setPage(PAGE.COMPLETE);
      }
      return () => {
        setPage(PAGE.INITIAL);
      };
    }, [givenConversationId])
  );

  const moveToClaimPage = () => {
    setPage(PAGE.CLAIM);
  };

  const contributeRecording = async (conversationId: string) => {
    if (!user || !conversationId) return;
    const token = (await getAccessToken()) || '';
    try {
      await contributeConversation(conversationId, user.id, token);
      setPage(PAGE.CLAIM);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Failed to contribute conversation';

      const customMessage = message.includes('Conversation is not accepted')
        ? 'Conversation is not qualified for contribution. Please record a new conversation.'
        : `Contribution failed: ${message}`;
      setErrorStatus({
        message: `${customMessage}`,
        isRedirect: false,
      });
      console.error('Error contributing conversation:', err);
    }
  };

  const uploadLastRecording = async () => {
    if (!lastRecordingUri || !user) return;
    setUploading(true);

    try {
      const token = (await getAccessToken()) || '';
      const res = await uploadAudio(
        lastRecordingUri,
        user.id,
        token,
        setUploadProgress
      );
      setConversationId(res.id);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Upload failed';
      setErrorStatus({
        message: `Upload failed: ${message}`,
        isRedirect: true,
      });
    } finally {
      setUploading(false);
      setPage(PAGE.COMPLETE);
    }
  };

  const handleStartRecording = () => {
    startRecording();
    setPage(PAGE.RECORDING);
  };

  const handleStopRecording = async () => {
    await stopRecording();
  };

  const handleDiscardRecording = async () => {
    try {
      await handleStopRecording();
      await discardRecording();
      setPage(PAGE.INITIAL);
      setLastRecordingUri(null);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to discard recording';
      setErrorStatus({
        message: `Discard failed: ${message}`,
        isRedirect: true,
      });
      console.error('Error discarding recording:', error);
    }
  };

  const handleClaimComplete = async () => {
    setUploading(false);
    setUploadProgress(0);
    setLastRecordingUri(null);
    setConversationId(null);
  };

  const handleRecordingScreen = (recording) => {
    if (page === PAGE.INITIAL) {
      return (
        <InitialScreen
          recording={recording}
          handleStartRecording={handleStartRecording}
        />
      );
    }
    if (page === PAGE.RECORDING) {
      return (
        <RecordingInProgressScreen
          handleStopRecording={handleStopRecording}
          handleDiscardRecording={handleDiscardRecording}
          uploading={uploading}
          uploadProgress={uploadProgress}
          uploadLastRecording={uploadLastRecording}
          duration={duration}
          recording={recording}
        />
      );
    }
    if (page === PAGE.COMPLETE) {
      return (
        <RecordingCompleteScreen
          handleDiscardRecording={handleDiscardRecording}
          contributeRecording={contributeRecording}
          moveToClaimPage={moveToClaimPage}
          conversationId={conversationId}
        />
      );
    }
    if (page === PAGE.CLAIM) {
      return (
        <ClaimScreen
          handleClaimComplete={handleClaimComplete}
          setErrorStatus={setErrorStatus}
        />
      );
    }
  };

  return (
    <Box className="h-full flex flex-col justify-end items-center w-full px-4">
      <ErrorModal
        isOpen={!!errorStatus?.message}
        onClose={async () => {
          if (errorStatus?.isRedirect) {
            await handleDiscardRecording();
          }
          setErrorStatus(null);
        }}
        message={errorStatus?.message || ''}
        title="Error"
        buttonText="OK"
      />
      {/* Blank Header */}
      <Box className="w-full h-20" />
      {handleRecordingScreen(recording)}
    </Box>
  );
}

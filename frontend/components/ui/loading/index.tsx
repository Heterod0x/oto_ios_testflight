import React from 'react';
import { LoadingOverlay } from '../loading-overlay';
import { useLoading } from '../../../contexts/LoadingContext';

export const Loading: React.FC = () => {
  const { isLoading, loadingMessage, actionButton, onActionClick } =
    useLoading();

  return (
    <LoadingOverlay
      visible={isLoading}
      message={loadingMessage}
      actionButton={actionButton}
      onActionClick={onActionClick}
    />
  );
};

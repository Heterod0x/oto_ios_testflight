import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Spinner } from '../spinner';
import { Text } from '../text';
import { Button, ButtonText } from '../button';

interface ActionButton {
  text: string;
  variant?:
    | 'default'
    | 'destructive'
    | 'outline'
    | 'secondary'
    | 'ghost'
    | 'link';
}

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
  spinnerColor?: string;
  zIndex?: number;
  actionButton?: ActionButton;
  onActionClick?: () => void;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  visible,
  message = 'Loading...',
  spinnerColor = '#3b82f6',
  zIndex = 9999,
  actionButton,
  onActionClick,
}) => {
  if (!visible) return null;

  // variantのマッピング
  const mapVariant = (variant?: string) => {
    switch (variant) {
      case 'default':
        return 'solid';
      case 'destructive':
        return 'solid';
      case 'secondary':
        return 'outline';
      case 'link':
        return 'ghost';
      default:
        return (variant as 'solid' | 'outline' | 'ghost') || 'outline';
    }
  };

  return (
    <View style={[styles.overlay, { zIndex }]}>
      <View style={styles.content}>
        <Spinner size="large" color={spinnerColor} />
        {message && (
          <Text style={styles.message} size="md">
            {message}
          </Text>
        )}
        {actionButton && onActionClick && (
          <View style={styles.buttonContainer}>
            <Button
              variant={mapVariant(actionButton.variant)}
              size="md"
              onPress={onActionClick}
              className="min-w-[120px]"
            >
              <ButtonText variant={mapVariant(actionButton.variant)} size="md">
                {actionButton.text}
              </ButtonText>
            </Button>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 9999, // For Android
  },
  content: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    minWidth: 200,
  },
  message: {
    marginTop: 16,
    textAlign: 'center',
    color: '#374151',
    marginBottom: 8,
  },
  buttonContainer: {
    marginTop: 16,
    width: '100%',
    alignItems: 'center',
  },
});

export { LoadingOverlay };

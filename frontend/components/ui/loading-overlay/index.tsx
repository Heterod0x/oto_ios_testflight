import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Spinner } from '../spinner';
import { Text } from '../text';

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
  spinnerColor?: string;
  zIndex?: number;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  visible,
  message = 'Loading...',
  spinnerColor = '#3b82f6',
  zIndex = 9999,
}) => {
  if (!visible) return null;

  return (
    <View style={[styles.overlay, { zIndex }]}>
      <View style={styles.content}>
        <Spinner size="large" color={spinnerColor} />
        {message && (
          <Text style={styles.message} size="md">
            {message}
          </Text>
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
  },
  message: {
    marginTop: 16,
    textAlign: 'center',
    color: '#374151',
  },
});

export { LoadingOverlay };

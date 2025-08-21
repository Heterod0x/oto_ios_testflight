import React from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter } from './modal';
import { Text } from './text';
import { Button, ButtonText } from './button';
import { Ionicons } from '@expo/vector-icons';
import { Box } from './box';

interface ErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
  buttonText?: string;
  title?: string;
}

export function ErrorModal({
  isOpen,
  onClose,
  message,
  buttonText = 'OK',
  title = 'Error',
}: ErrorModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalHeader>
        <Box className="flex-row items-center gap-3">
          <Box className="w-8 h-8 rounded-full bg-error-100 items-center justify-center">
            <Ionicons name="alert-circle" size={20} color="#DC2626" />
          </Box>
          <Text size="lg" weight="semibold" className="text-error-700">
            {title}
          </Text>
        </Box>
      </ModalHeader>

      <ModalBody>
        <Text size="md" className="text-gray-700 leading-6">
          {message}
        </Text>
      </ModalBody>

      <ModalFooter>
        <Button
          variant="solid"
          size="md"
          className="flex-1 bg-error-600"
          onPress={onClose}
        >
          <ButtonText className="text-white font-medium">
            {buttonText}
          </ButtonText>
        </Button>
      </ModalFooter>
    </Modal>
  );
}

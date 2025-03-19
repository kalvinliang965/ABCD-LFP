import React, { ReactNode } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  Box,
  Divider,
  useColorModeValue,
} from "@chakra-ui/react";

export interface DetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: string;
  primaryButtonText?: string;
  secondaryButtonText?: string;
  onPrimaryButtonClick?: () => void;
  onSecondaryButtonClick?: () => void;
  showFooter?: boolean;
}

const DetailModal: React.FC<DetailModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = "lg",
  primaryButtonText = "Close",
  secondaryButtonText,
  onPrimaryButtonClick,
  onSecondaryButtonClick,
  showFooter = true,
}) => {
  // Color mode values
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const highlightColor = useColorModeValue("blue.500", "blue.300");

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size={size}
      scrollBehavior="inside"
      closeOnOverlayClick={true}
      isCentered
    >
      <ModalOverlay />
      <ModalContent bg={bgColor} borderColor={borderColor} borderRadius="lg">
        <ModalHeader
          color={highlightColor}
          fontWeight="bold"
          pb={2}
          pt={4}
          px={5}
        >
          {title}
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody px={5} py={3}>
          {children}
        </ModalBody>

        {showFooter && (
          <ModalFooter px={5} py={4}>
            {secondaryButtonText && onSecondaryButtonClick && (
              <Button
                variant="outline"
                mr={3}
                onClick={onSecondaryButtonClick}
                size="md"
                borderRadius="md"
              >
                {secondaryButtonText}
              </Button>
            )}
            <Button
              colorScheme="blue"
              onClick={onPrimaryButtonClick || onClose}
              size="md"
              borderRadius="md"
            >
              {primaryButtonText}
            </Button>
          </ModalFooter>
        )}
      </ModalContent>
    </Modal>
  );
};

export default DetailModal;

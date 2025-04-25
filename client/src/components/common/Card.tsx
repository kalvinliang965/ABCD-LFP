import {
  Card as ChakraCard,
  Flex,
  Text,
  Badge,
  Divider,
  useColorModeValue,
  Box,
  Spacer,
  CardProps as ChakraCardProps,
} from '@chakra-ui/react';
import React, { ReactNode } from 'react';

/**
 * AI prompt :take out the card component and make it a reusable component
 */
export interface BadgeInfo {
  text: string;
  colorScheme?: string;
  variant?: string;
}

export interface CardProps extends Omit<ChakraCardProps, 'title'> {
  title?: string;
  subtitle?: string;
  description?: string;
  onClick?: () => void;
  leftBadge?: BadgeInfo;
  rightBadge?: BadgeInfo;
  children?: ReactNode;
  minHeight?: string;
  contentPadding?: number | string;
  footerPadding?: number | string;
  footerHeight?: string;
  dashed?: boolean;
}

const truncateText = (text: string, maxLength: number) => {
  return text && text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
};

const CommonCard: React.FC<CardProps> = ({
  title,
  subtitle,
  description,
  onClick,
  leftBadge,
  rightBadge,
  children,
  minHeight = '200px',
  contentPadding = 4,
  footerPadding = 3,
  footerHeight = '45px',
  dashed = true,
  ...restProps
}) => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const highlightColor = useColorModeValue('blue.500', 'blue.300');
  const subtitleColor = useColorModeValue('gray.500', 'gray.400');

  return (
    <ChakraCard
      bg={cardBg}
      boxShadow="md"
      borderRadius="md"
      borderWidth="1px"
      borderColor={borderColor}
      borderStyle={dashed ? 'dashed' : 'solid'}
      overflow="hidden"
      transition="all 0.3s"
      _hover={{ transform: 'translateY(-5px)', boxShadow: 'lg' }}
      cursor={onClick ? 'pointer' : 'default'}
      height="100%"
      minHeight={minHeight}
      display="flex"
      flexDirection="column"
      onClick={onClick}
      {...restProps}
    >
      {/* Card content area */}
      <Box p={contentPadding} flex="1" display="flex" flexDirection="column">
        {/* Title */}
        {title && (
          <Text fontWeight="bold" fontSize="md" color={highlightColor} noOfLines={1} mb={2}>
            {title}
          </Text>
        )}

        {/* Subtitle */}
        {subtitle && (
          <Text fontSize="xs" color={subtitleColor} mb={3}>
            {subtitle}
          </Text>
        )}

        {/* Description */}
        {description && (
          <Box flex="1">
            <Text color={textColor} fontSize="sm" noOfLines={3}>
              {truncateText(description, 120)}
            </Text>
          </Box>
        )}

        {/* Custom content */}
        {children && <Box flex="1">{children}</Box>}

        <Spacer />
      </Box>

      {/* Card footer - only render if badges are provided */}
      {(leftBadge || rightBadge) && (
        <Box>
          <Divider />
          <Box p={footerPadding} height={footerHeight}>
            <Flex justify="space-between" alignItems="center">
              {leftBadge && (
                <Badge
                  colorScheme={leftBadge.colorScheme}
                  variant={leftBadge.variant || 'solid'}
                  px={2}
                  py={0.5}
                  borderRadius="md"
                  textAlign="center"
                  fontSize="2xs"
                  textTransform="uppercase"
                  fontWeight="bold"
                >
                  {leftBadge.text}
                </Badge>
              )}

              {rightBadge && (
                <Badge
                  colorScheme={rightBadge.colorScheme}
                  variant={rightBadge.variant || 'outline'}
                  px={2}
                  py={0.5}
                  borderRadius="md"
                  textAlign="center"
                  fontSize="2xs"
                  textTransform="uppercase"
                  fontWeight="bold"
                >
                  {rightBadge.text}
                </Badge>
              )}
            </Flex>
          </Box>
        </Box>
      )}
    </ChakraCard>
  );
};

export default CommonCard;

import React from "react";
import {
  Card,
  Flex,
  Text,
  Badge,
  Divider,
  useColorModeValue,
  Box,
  Spacer,
} from "@chakra-ui/react";
import { type InvestmentCardProps } from "../../types/investment";

const InvestmentCard: React.FC<InvestmentCardProps> = ({
  investment,
  onClick,
}) => {
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const textColor = useColorModeValue("gray.600", "gray.300");
  const highlightColor = useColorModeValue("blue.500", "blue.300");
  const dateColor = useColorModeValue("gray.500", "gray.400");

  // Truncate text function
  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
  };

  return (
    <Card
      bg={cardBg}
      boxShadow="md"
      borderRadius="md"
      borderWidth="1px"
      borderColor={borderColor}
      borderStyle="dashed"
      overflow="hidden"
      transition="all 0.3s"
      _hover={{ transform: "translateY(-5px)", boxShadow: "lg" }}
      cursor="pointer"
      height="100%"
      minHeight="200px"
      display="flex"
      flexDirection="column"
      onClick={onClick}
    >
      {/* Card content area */}
      <Box p={4} flex="1" display="flex" flexDirection="column">
        {/* Investment name */}
        <Text
          fontWeight="bold"
          fontSize="md"
          color={highlightColor}
          noOfLines={1}
          mb={2}
        >
          {investment.name}
        </Text>

        {/* Update date */}
        <Text fontSize="xs" color={dateColor} mb={3}>
          Updated: {investment.lastUpdated || investment.date}
        </Text>

        {/* Description */}
        <Box flex="1">
          <Text color={textColor} fontSize="sm" noOfLines={3}>
            {truncateText(investment.description, 120)}
          </Text>
        </Box>

        <Spacer />
      </Box>

      {/* Card footer - always at the bottom */}
      <Box>
        <Divider />
        <Box p={3} height="45px">
          <Flex justify="space-between" alignItems="center">
            <Badge
              colorScheme={
                investment.taxability === "taxable" ? "red" : "green"
              }
              px={2}
              py={0.5}
              borderRadius="md"
              textAlign="center"
              fontSize="2xs"
              textTransform="uppercase"
              fontWeight="bold"
            >
              {investment.taxability === "taxable" ? "Taxable" : "Tax-exempt"}
            </Badge>

            <Badge
              px={2}
              py={0.5}
              borderRadius="md"
              variant="outline"
              textAlign="center"
              fontSize="2xs"
              textTransform="uppercase"
              fontWeight="bold"
            >
              {investment.returnType}
            </Badge>
          </Flex>
        </Box>
      </Box>
    </Card>
  );
};

export default InvestmentCard;

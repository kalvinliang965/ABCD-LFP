import React from "react";
import { Box, Flex, Text, Icon, useColorModeValue } from "@chakra-ui/react";
import { FaPlus } from "react-icons/fa";

interface AddInvestmentCardProps {
  onClick: () => void;
}

const AddInvestmentCard: React.FC<AddInvestmentCardProps> = ({ onClick }) => {
  const bg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("blue.100", "blue.700");
  const hoverBg = useColorModeValue("blue.50", "blue.900");
  const textColor = useColorModeValue("blue.600", "blue.300");
  const iconBg = useColorModeValue("blue.100", "blue.700");

  return (
    <Box
      as="button"
      onClick={onClick}
      height="100%"
      minH="200px"
      w="100%"
      p={5}
      borderRadius="lg"
      borderWidth="2px"
      borderStyle="dashed"
      borderColor={borderColor}
      bg={bg}
      _hover={{
        bg: hoverBg,
        transform: "translateY(-5px)",
        boxShadow: "lg",
      }}
      transition="all 0.3s ease"
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      cursor="pointer"
    >
      <Flex
        w="50px"
        h="50px"
        borderRadius="full"
        bg={iconBg}
        align="center"
        justify="center"
        mb={4}
      >
        <Icon as={FaPlus} boxSize={5} color={textColor} />
      </Flex>
      <Text fontSize="lg" fontWeight="bold" color={textColor}>
        Add New Investment
      </Text>
      <Text fontSize="sm" color="gray.500" mt={2} textAlign="center">
        Create a new investment to track in your portfolio
      </Text>
    </Box>
  );
};

export default AddInvestmentCard;

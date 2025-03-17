import React from "react";
import { Card, Icon, Text, useColorModeValue, Flex } from "@chakra-ui/react";
import { FaPlus } from "react-icons/fa";

interface AddInvestmentCardProps {
  onClick: () => void;
}

const AddInvestmentCard: React.FC<AddInvestmentCardProps> = ({ onClick }) => {
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const hoverBg = useColorModeValue("gray.50", "gray.700");

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
      _hover={{ bg: hoverBg, transform: "translateY(-5px)", boxShadow: "lg" }}
      cursor="pointer"
      height="100%"
      minHeight="220px"
      display="flex"
      flexDirection="column"
      onClick={onClick}
    >
      <Flex
        direction="column"
        align="center"
        justify="center"
        height="100%"
        width="100%"
        p={4}
      >
        <Icon as={FaPlus} boxSize={10} color="gray.400" />
        <Text color="gray.500" fontWeight="medium" mt={3}>
          Add New Investment
        </Text>
      </Flex>
    </Card>
  );
};

export default AddInvestmentCard;

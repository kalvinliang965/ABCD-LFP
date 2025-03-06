// AddInvestmentCard.tsx
import React from 'react';
import { Card, Icon, Text, useColorModeValue } from '@chakra-ui/react';
import { FaPlus } from 'react-icons/fa';

interface AddInvestmentCardProps {
  onAdd: () => void;
}

const AddInvestmentCard: React.FC<AddInvestmentCardProps> = ({ onAdd }) => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

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
      _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}
      cursor="pointer"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      py={10}
      onClick={onAdd}
    >
      <Icon as={FaPlus} boxSize={10} mb={3} color="gray.400" />
      <Text color="gray.500">Add New Investment</Text>
    </Card>
  );
};

export default AddInvestmentCard;

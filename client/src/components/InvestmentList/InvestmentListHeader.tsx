import React from 'react';
import { Flex, Heading, Button, Icon } from '@chakra-ui/react';
import { FaPlus } from 'react-icons/fa';

/*
    investment list Header
    like the divider 
*/ 
interface InvestmentListHeaderProps {
  onAdd: () => void;
}

const InvestmentListHeader: React.FC<InvestmentListHeaderProps> = ({ onAdd }) => (
  <Flex justifyContent="space-between"  mb={5}>
    <Heading size="md">Investments</Heading>
    <Button leftIcon={<Icon as={FaPlus} />} colorScheme="blue" size="sm" onClick={onAdd}>
      Add Investment
    </Button>
  </Flex>
);

export default InvestmentListHeader;
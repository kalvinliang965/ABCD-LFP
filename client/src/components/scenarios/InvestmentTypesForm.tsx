// AI-generated code
// Create a more modern, beautiful and interactive component for managing investment types

import { AddIcon, DeleteIcon, InfoIcon, EditIcon } from '@chakra-ui/icons';
import {
  Box,
  Button,
  Card,
  CardHeader,
  CardBody,
  Container,
  Flex,
  Heading,
  HStack,
  VStack,
  Icon,
  SimpleGrid,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  useColorModeValue,
  useDisclosure,
  useToast,
  Badge,
  IconButton,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Tooltip,
  useBreakpointValue,
  chakra,
  Input,
  InputGroup,
  InputLeftElement,
  Tag,
  TagLabel,
  Stat,
  StatLabel,
  StatNumber,
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import React, { useState, useEffect } from 'react';
import {
  FiChevronLeft,
  FiChevronRight,
  FiList,
  FiInfo,
  FiPackage,
  FiDollarSign,
  FiPlus,
  FiSearch,
  FiShield,
} from 'react-icons/fi';

import { investmentTypeStorage } from '../../services/investmentTypeStorage';
import { InvestmentTypeRaw } from '../../types/Scenarios';
import AddInvestmentTypeModal from '../investment/AddInvestmentTypeModal';

// Creating motion components by wrapping Chakra components
const MotionBox = motion(Box);
const MotionCard = motion(Card);
const MotionStat = motion(Stat);
const MotionHeading = motion(Heading);
const MotionText = motion(Text);

interface InvestmentTypesFormProps {
  onBack: () => void;
  onContinue: () => void;
}

export const InvestmentTypesForm: React.FC<InvestmentTypesFormProps> = ({ onBack, onContinue }) => {
  const [investmentTypes, set_investment_types] = useState<InvestmentTypeRaw[]>([]);
  const [typeToDelete, set_type_to_delete] = useState<string | null>(null);
  const [typeToEdit, set_type_to_edit] = useState<InvestmentTypeRaw | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [newItemAdded, setNewItemAdded] = useState<string | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const cancelRef = React.useRef<any>();
  const toast = useToast();

  // Responsive values
  const isMobile = useBreakpointValue({ base: true, md: false });
  const cardMaxWidth = useBreakpointValue({ base: '100%', md: '7xl' });

  // UI colors - enhanced for more vibrancy and better contrast
  const bg = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const hoverBg = useColorModeValue('blue.50', 'blue.900');
  const accentColor = useColorModeValue('blue.500', 'blue.300');
  const headerBg = useColorModeValue('blue.50', 'blue.900');
  const badgeColorTaxable = useColorModeValue('green.100', 'green.800');
  const badgeColorExempt = useColorModeValue('purple.100', 'purple.800');
  const badgeTextTaxable = useColorModeValue('green.800', 'green.100');
  const badgeTextExempt = useColorModeValue('purple.800', 'purple.100');
  const emptyStateIconColor = useColorModeValue('blue.300', 'blue.500');
  const buttonHoverBg = useColorModeValue('blue.600', 'blue.400');
  const highlightColor = useColorModeValue('yellow.100', 'yellow.800');
  const gradientEnd = useColorModeValue('white', 'gray.800');

  // Animation variants - enhanced for more fluidity
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const statVariants = {
    hidden: { scale: 0.9, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: { type: 'spring', stiffness: 150, delay: 0.3 },
    },
  };

  // Load investment types on component mount
  useEffect(() => {
    load_investment_types();
  }, []);

  const load_investment_types = () => {
    const types = investmentTypeStorage.get_all();
    set_investment_types(types);
  };

  const handle_save_investment_type = (investmentType: InvestmentTypeRaw) => {
    if (typeToEdit && typeToEdit.name) {
      // Update existing investment type
      investmentTypeStorage.update(typeToEdit.name, investmentType);

      console.log('investmentType from handle_save_investment_type', investmentType);

      toast({
        title: 'Investment Type Updated',
        description: `${investmentType.name} has been updated.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top-right',
        variant: 'subtle',
      });

      set_type_to_edit(null);
      onEditClose();
    } else {
      // Create new investment type
      investmentTypeStorage.create(investmentType);
      setNewItemAdded(investmentType.name || null);

      // Reset the highlight after animation completes
      setTimeout(() => {
        setNewItemAdded(null);
      }, 2000);

      toast({
        title: 'Investment Type Created',
        description: `${investmentType.name} has been added to your investment types.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top-right',
        variant: 'subtle',
      });
      onClose();
    }

    load_investment_types();
  };

  const handle_add_click = () => {
    // Ensure edit state is cleared when adding new type
    set_type_to_edit(null);
    onOpen();
  };

  const handle_edit_click = (name: string) => {
    // Get the latest data directly from storage instead of the local state
    const typeFromStorage = investmentTypeStorage.get_by_name(name);

    if (typeFromStorage) {
      console.log('Found investment type to edit from storage:', typeFromStorage);

      // Ensure typeToEdit has valid returnDistribution and incomeDistribution arrays
      const editableType = {
        ...typeFromStorage,
        returnDistribution:
          Array.isArray(typeFromStorage.returnDistribution) &&
          typeFromStorage.returnDistribution.length > 0
            ? typeFromStorage.returnDistribution
            : [{ type: 'fixed', value: 0 }],
        incomeDistribution:
          Array.isArray(typeFromStorage.incomeDistribution) &&
          typeFromStorage.incomeDistribution.length > 0
            ? typeFromStorage.incomeDistribution
            : [{ type: 'fixed', value: 0 }],
      };

      console.log('Prepared investment type for editing:', editableType);
      set_type_to_edit(editableType);
      onEditOpen();
    } else {
      toast({
        title: 'Error',
        description: `Could not find investment type: ${name}`,
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top-right',
      });
    }
  };

  const handle_delete_click = (name: string) => {
    set_type_to_delete(name);
    onDeleteOpen();
  };

  const handle_confirm_delete = () => {
    if (!typeToDelete) return;

    const typeToDeleteName = investmentTypes.find(type => type.name === typeToDelete)?.name;

    if (investmentTypeStorage.delete(typeToDelete)) {
      toast({
        title: 'Investment Type Deleted',
        description: `${typeToDeleteName || 'Investment type'} has been removed.`,
        status: 'info',
        duration: 3000,
        isClosable: true,
        position: 'top-right',
        variant: 'subtle',
      });
    }

    load_investment_types();
    onDeleteClose();
    set_type_to_delete(null);
  };

  const handle_modal_close = () => {
    // Clear edit state when modal is closed
    set_type_to_edit(null);
    onClose();
  };

  const handle_edit_modal_close = () => {
    // Clear edit state when edit modal is closed
    set_type_to_edit(null);
    onEditClose();
  };

  const handle_search_change = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const has_cash_investment_type = () => {
    return investmentTypes.some(type => type.name.toLowerCase() === 'cash');
  };

  const get_distribution_display = (distribution: Array<{ [key: string]: any }>) => {
    if (distribution && distribution.length > 0) {
      return distribution[0].type;
    }
    return '';
  };

  const format_percent = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  const can_continue = investmentTypes.length > 0 && has_cash_investment_type();

  const handle_continue_click = () => {
    if (!has_cash_investment_type()) {
      toast({
        title: 'Cash Investment Type Required',
        description: 'You must have Cash as investment type',
        status: 'warning',
        duration: 5000,
        isClosable: true,
        position: 'top-right',
      });
      return;
    }
    onContinue();
  };

  // Filter investment types based on search query
  const filtered_investment_types = investmentTypes.filter(type =>
    type.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate stats
  const totalInvestmentTypes = investmentTypes.length;
  const taxableCount = investmentTypes.filter(type => type.taxability).length;
  const taxExemptCount = investmentTypes.filter(type => !type.taxability).length;

  return (
    <Box minH="100vh" bg={bg} py={8}>
      <Container maxW={cardMaxWidth} px={4}>
        <MotionCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          rounded="xl"
          shadow="xl"
          overflow="hidden"
          borderWidth="1px"
          borderColor={borderColor}
          bg={cardBg}
          mb={8}
        >
          {/* Enhanced Header with Gradient */}
          <CardHeader
            py={6}
            px={8}
            borderBottomWidth="1px"
            borderBottomColor={borderColor}
            bgGradient={`linear(to-r, ${headerBg}, ${gradientEnd})`}
          >
            <Flex justify="space-between" align="center">
              <HStack spacing={4}>
                <MotionBox
                  initial={{ rotate: -10, scale: 0.9 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <Icon as={FiList} boxSize={6} color={accentColor} />
                </MotionBox>
                <VStack align="start" spacing={0}>
                  <MotionHeading
                    size="lg"
                    fontWeight="bold"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    Investment Types
                  </MotionHeading>
                  <MotionText
                    color="gray.500"
                    fontSize="sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    Define your investment options
                  </MotionText>
                </VStack>
              </HStack>
              <Button
                variant="outline"
                colorScheme="blue"
                onClick={onBack}
                leftIcon={<Icon as={FiChevronLeft} />}
                size="md"
                _hover={{ bg: 'blue.50' }}
              >
                Back
              </Button>
            </Flex>
          </CardHeader>

          <CardBody p={6}>
            <VStack spacing={8} align="stretch">
              {/* Stats Overview */}
              {investmentTypes.length > 0 && (
                <MotionBox variants={containerVariants} initial="hidden" animate="visible">
                  <SimpleGrid columns={3} spacing={4} mb={6}>
                    <MotionStat
                      variants={statVariants}
                      px={5}
                      py={4}
                      bg={cardBg}
                      rounded="lg"
                      shadow="md"
                      borderWidth="1px"
                      borderColor={borderColor}
                    >
                      <StatLabel color="gray.500" fontSize="sm">
                        Total Types
                      </StatLabel>
                      <Flex align="center">
                        <Icon as={FiPackage} color={accentColor} mr={2} />
                        <StatNumber>{totalInvestmentTypes}</StatNumber>
                      </Flex>
                    </MotionStat>

                    <MotionStat
                      variants={statVariants}
                      px={5}
                      py={4}
                      bg={cardBg}
                      rounded="lg"
                      shadow="md"
                      borderWidth="1px"
                      borderColor={borderColor}
                    >
                      <StatLabel color="gray.500" fontSize="sm">
                        Taxable
                      </StatLabel>
                      <Flex align="center">
                        <Icon as={FiDollarSign} color="green.500" mr={2} />
                        <StatNumber>{taxableCount}</StatNumber>
                      </Flex>
                    </MotionStat>

                    <MotionStat
                      variants={statVariants}
                      px={5}
                      py={4}
                      bg={cardBg}
                      rounded="lg"
                      shadow="md"
                      borderWidth="1px"
                      borderColor={borderColor}
                    >
                      <StatLabel color="gray.500" fontSize="sm">
                        Tax-Exempt
                      </StatLabel>
                      <Flex align="center">
                        <Icon as={FiShield} color="purple.500" mr={2} />
                        <StatNumber>{taxExemptCount}</StatNumber>
                      </Flex>
                    </MotionStat>
                  </SimpleGrid>
                </MotionBox>
              )}

              {/* Main content header */}
              <Flex
                direction={isMobile ? 'column' : 'row'}
                justifyContent="space-between"
                alignItems={isMobile ? 'flex-start' : 'center'}
                gap={4}
                mb={5}
              >
                <Flex
                  direction={isMobile ? 'column' : 'row'}
                  alignItems={isMobile ? 'flex-start' : 'center'}
                  width="100%"
                  justifyContent="space-between"
                >
                  {/* Left side with search */}
                  <Box>
                    {investmentTypes.length > 0 && (
                      <InputGroup maxW="220px">
                        <InputLeftElement pointerEvents="none">
                          <Icon as={FiSearch} color="gray.400" />
                        </InputLeftElement>
                        <Input
                          placeholder="Search types..."
                          value={searchQuery}
                          onChange={handle_search_change}
                          borderRadius="md"
                        />
                      </InputGroup>
                    )}
                  </Box>

                  {/* Right side with add button */}
                  <Box>
                    <Button
                      leftIcon={<AddIcon />}
                      colorScheme="blue"
                      onClick={handle_add_click}
                      size="md"
                      shadow="md"
                      _hover={{
                        transform: 'translateY(-2px)',
                        shadow: 'lg',
                        bg: buttonHoverBg,
                      }}
                      transition="all 0.3s"
                      borderRadius="md"
                    >
                      Add Investment Type
                    </Button>
                  </Box>
                </Flex>
              </Flex>
              {/* Investment Types Table */}
              <AnimatePresence>
                <Box
                  overflowX="auto"
                  as={motion.div}
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  rounded="lg"
                  shadow="md"
                  borderWidth="1px"
                  borderColor={borderColor}
                >
                  <Table variant="simple" colorScheme="blue">
                    <Thead bg={headerBg}>
                      <Tr>
                        <Th>Name</Th>
                        <Th>Return</Th>
                        <Th>Expense Ratio</Th>
                        <Th>Taxability</Th>
                        <Th width="100px">Actions</Th>
                      </Tr>
                    </Thead>
                    {filtered_investment_types.length > 0 ? (
                      <Tbody>
                        {filtered_investment_types.map(type => (
                          <Tr
                            key={type.name}
                            _hover={{ bg: hoverBg }}
                            transition="background 0.2s"
                            bg={newItemAdded === type.name ? highlightColor : undefined}
                          >
                            <Td>
                              <chakra.div maxW="300px">
                                <Text fontWeight="semibold">{type.name}</Text>
                                {type.description && (
                                  <Text fontSize="sm" color="gray.500" noOfLines={1}>
                                    {type.description}
                                  </Text>
                                )}
                              </chakra.div>
                            </Td>
                            <Td>
                              <Tag
                                size="md"
                                variant="subtle"
                                colorScheme="blue"
                                borderRadius="full"
                              >
                                <TagLabel>
                                  {get_distribution_display(type.returnDistribution)}
                                  {type.returnAmtOrPct === 'percent' ? '%' : ''}
                                </TagLabel>
                              </Tag>
                            </Td>
                            <Td>{format_percent(type.expenseRatio * 100)}</Td>
                            <Td>
                              <Badge
                                px={2}
                                py={1}
                                borderRadius="full"
                                textTransform="capitalize"
                                bg={type.taxability ? badgeColorTaxable : badgeColorExempt}
                                color={type.taxability ? badgeTextTaxable : badgeTextExempt}
                              >
                                <Flex align="center">
                                  <Icon
                                    as={type.taxability ? FiDollarSign : FiShield}
                                    mr={1}
                                    boxSize={3}
                                  />
                                  {type.taxability ? 'Taxable' : 'Tax-exempt'}
                                </Flex>
                              </Badge>
                            </Td>
                            <Td>
                              <HStack spacing={2}>
                                <Tooltip label="Edit" placement="top">
                                  <IconButton
                                    icon={<EditIcon />}
                                    variant="ghost"
                                    colorScheme="blue"
                                    aria-label="Edit investment type"
                                    onClick={() => handle_edit_click(type.name || '')}
                                    isDisabled={!type.name}
                                    size="sm"
                                  />
                                </Tooltip>
                                <Tooltip label="Delete" placement="top">
                                  <IconButton
                                    icon={<DeleteIcon />}
                                    variant="ghost"
                                    colorScheme="red"
                                    aria-label="Delete investment type"
                                    onClick={() => handle_delete_click(type.name || '')}
                                    isDisabled={!type.name}
                                    size="sm"
                                  />
                                </Tooltip>
                              </HStack>
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    ) : investmentTypes.length > 0 ? (
                      <Tbody>
                        <Tr>
                          <Td colSpan={5}>
                            <Box p={8} textAlign="center">
                              <MotionBox
                                initial={{ scale: 0.9 }}
                                animate={{ scale: 1 }}
                                transition={{ duration: 0.5 }}
                              >
                                <Icon
                                  as={FiSearch}
                                  boxSize={10}
                                  color={emptyStateIconColor}
                                  mb={4}
                                />
                              </MotionBox>
                              <Heading size="sm" mb={2}>
                                No matching investment types
                              </Heading>
                              <Text color="gray.500" fontSize="sm">
                                Try adjusting your search criteria
                              </Text>
                            </Box>
                          </Td>
                        </Tr>
                      </Tbody>
                    ) : (
                      <Tbody>
                        <Tr>
                          <Td colSpan={5}>
                            <Box p={8} textAlign="center">
                              <MotionBox
                                initial={{ scale: 0.8 }}
                                animate={{ scale: 1 }}
                                transition={{
                                  repeat: Infinity,
                                  repeatType: 'reverse',
                                  duration: 2,
                                }}
                                display="inline-block"
                                mb={5}
                              >
                                <Icon as={FiInfo} boxSize={14} color={emptyStateIconColor} />
                              </MotionBox>
                              <Heading size="md" color={accentColor} fontWeight="medium" mb={3}>
                                No investment types created yet
                              </Heading>
                              <Text
                                color="gray.500"
                                fontSize="md"
                                maxW="md"
                                mx="auto"
                                mt={2}
                                mb={6}
                              >
                                Add your first investment type to get started. You'll need at least
                                one investment type to continue.
                              </Text>
                              <Button
                                leftIcon={<FiPlus />}
                                colorScheme="blue"
                                onClick={handle_add_click}
                                size="lg"
                                shadow="lg"
                                _hover={{ transform: 'translateY(-2px)' }}
                                transition="all 0.3s"
                                borderRadius="md"
                              >
                                Add Your First Investment Type
                              </Button>
                            </Box>
                          </Td>
                        </Tr>
                      </Tbody>
                    )}
                  </Table>
                </Box>
              </AnimatePresence>

              {/* Continue Button */}
              <Flex justify="flex-end" mt={8} display="flex" gap={4}>
                <Button
                  rightIcon={<Icon as={FiChevronRight} />}
                  colorScheme="blue"
                  onClick={handle_continue_click}
                  isDisabled={!can_continue}
                  size="lg"
                  shadow="md"
                  _hover={{
                    transform: can_continue ? 'translateY(-2px)' : 'none',
                    shadow: 'lg',
                    bg: can_continue ? buttonHoverBg : undefined,
                  }}
                  transition="all 0.3s"
                  borderRadius="md"
                >
                  Continue to Investments
                </Button>
                {import.meta.env.MODE === 'development' && (
                  <Button
                    rightIcon={<Icon as={FiChevronRight} />}
                    colorScheme="blue"
                    onClick={onContinue}
                    size="lg"
                    shadow="md"
                    _hover={{
                      transform: can_continue ? 'translateY(-2px)' : 'none',
                      shadow: 'lg',
                      bg: can_continue ? buttonHoverBg : undefined,
                    }}
                    transition="all 0.3s"
                    borderRadius="md"
                  >
                    Skip to Investments
                  </Button>
                )}
              </Flex>
            </VStack>
          </CardBody>
        </MotionCard>

        {/* Quick Tips Card */}
        {investmentTypes.length > 0 && (
          <MotionCard
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            rounded="xl"
            shadow="md"
            borderWidth="1px"
            borderColor={borderColor}
            bg={cardBg}
            p={5}
            mb={4}
          >
            <Flex align="center" mb={2}>
              <Icon as={InfoIcon} color={accentColor} mr={2} />
              <Heading size="sm">Tips for Investment Types</Heading>
            </Flex>
            <Text fontSize="sm" color="gray.600" mb={2}>
              Create different investment types with varied risk profiles. Consider adding
              tax-exempt options for retirement accounts and taxable options for brokerage accounts.
            </Text>
            <Text
              fontSize="sm"
              fontWeight="medium"
              color={!has_cash_investment_type() ? 'red.500' : 'blue.500'}
            >
              Note: You must have a "Cash" investment type to proceed to the next step.
            </Text>
          </MotionCard>
        )}
      </Container>

      {/* Add Investment Type Modal */}
      <AddInvestmentTypeModal
        isOpen={isOpen}
        onClose={handle_modal_close}
        onSave={handle_save_investment_type}
        existingTypes={investmentTypes}
      />

      {/* Edit Investment Type Modal */}
      <AddInvestmentTypeModal
        isOpen={isEditOpen}
        onClose={handle_edit_modal_close}
        onSave={handle_save_investment_type}
        initialData={typeToEdit || undefined}
        isEditMode={true}
        existingTypes={investmentTypes}
      />

      {/* Confirmation Dialog for Delete */}
      <AlertDialog
        isOpen={isDeleteOpen}
        leastDestructiveRef={cancelRef}
        onClose={onDeleteClose}
        motionPreset="slideInBottom"
      >
        <AlertDialogOverlay>
          <AlertDialogContent borderRadius="xl" shadow="xl">
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Investment Type
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure? This will permanently delete this investment type.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onDeleteClose}>
                Cancel
              </Button>
              <Button
                colorScheme="red"
                onClick={handle_confirm_delete}
                ml={3}
                leftIcon={<DeleteIcon />}
              >
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

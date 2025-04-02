// AI-generated code
// Create a more modern, beautiful and interactive component for managing investment types

import React, { useState, useEffect } from "react";
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
  Divider,
  useBreakpointValue,
  chakra,
  Grid,
  GridItem,
  Image,
  useColorMode,
  Input,
  InputGroup,
  InputLeftElement,
  Tag,
  TagLabel,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  StatGroup,
} from "@chakra-ui/react";
import {
  AddIcon,
  DeleteIcon,
  InfoIcon,
} from "@chakra-ui/icons";
import {
  FiChevronLeft,
  FiChevronRight,
  FiList,
  FiInfo,
  FiPackage,
  FiDollarSign,
  FiPercent,
  FiTrendingUp,
  FiPlus,
  FiSearch,
  FiGrid,
  FiShield,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { InvestmentTypeRaw } from "../../types/Scenarios";
import { investmentTypeStorage } from "../../services/investmentTypeStorage";
import AddInvestmentTypeModal from "../investment/AddInvestmentTypeModal";

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

export const InvestmentTypesForm: React.FC<InvestmentTypesFormProps> = ({
  onBack,
  onContinue,
}) => {
  const [investmentTypes, set_investment_types] = useState<InvestmentTypeRaw[]>(
    []
  );
  const [typeToDelete, set_type_to_delete] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [newItemAdded, setNewItemAdded] = useState<string | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();
  const cancelRef = React.useRef<any>();
  const toast = useToast();

  // Responsive values
  const isMobile = useBreakpointValue({ base: true, md: false });
  const cardMaxWidth = useBreakpointValue({ base: "100%", md: "7xl" });
  const [viewMode, setViewMode] = useState<"cards" | "table">(
    useBreakpointValue({ base: "cards", md: "table" }) as "cards" | "table"
  );

  // UI colors - enhanced for more vibrancy and better contrast
  const bg = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const hoverBg = useColorModeValue("blue.50", "blue.900");
  const accentColor = useColorModeValue("blue.500", "blue.300");
  const headerBg = useColorModeValue("blue.50", "blue.900");
  const badgeColorTaxable = useColorModeValue("green.100", "green.800");
  const badgeColorExempt = useColorModeValue("purple.100", "purple.800");
  const badgeTextTaxable = useColorModeValue("green.800", "green.100");
  const badgeTextExempt = useColorModeValue("purple.800", "purple.100");
  const emptyStateIconColor = useColorModeValue("blue.300", "blue.500");
  const emptyBorderColor = useColorModeValue("blue.200", "blue.600");
  const cardShadow = "lg";
  const buttonHoverBg = useColorModeValue("blue.600", "blue.400");
  const highlightColor = useColorModeValue("yellow.100", "yellow.800");
  const gradientStart = useColorModeValue("blue.50", "blue.900");
  const gradientEnd = useColorModeValue("white", "gray.800");

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

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 },
    },
  };

  const statVariants = {
    hidden: { scale: 0.9, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: { type: "spring", stiffness: 150, delay: 0.3 },
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
    investmentTypeStorage.create(investmentType);
    load_investment_types();
    setNewItemAdded(investmentType.id || null);

    // Reset the highlight after animation completes
    setTimeout(() => {
      setNewItemAdded(null);
    }, 2000);

    toast({
      title: "Investment Type Created",
      description: `${investmentType.name} has been added to your investment types.`,
      status: "success",
      duration: 3000,
      isClosable: true,
      position: "top-right",
      variant: "subtle",
    });
    onClose();
  };

  const handle_delete_click = (id: string) => {
    set_type_to_delete(id);
    onDeleteOpen();
  };

  const handle_confirm_delete = () => {
    if (!typeToDelete) return;

    const typeToDeleteName = investmentTypes.find(
      (type) => type.id === typeToDelete
    )?.name;

    if (investmentTypeStorage.delete(typeToDelete)) {
      toast({
        title: "Investment Type Deleted",
        description: `${
          typeToDeleteName || "Investment type"
        } has been removed.`,
        status: "info",
        duration: 3000,
        isClosable: true,
        position: "top-right",
        variant: "subtle",
      });
    }

    load_investment_types();
    onDeleteClose();
    set_type_to_delete(null);
  };

  const handle_search_change = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const get_distribution_display = (distribution: Map<string, any>) => {
    console.log(distribution);
    const type = distribution.get("type");
    return type;
  };

  const format_percent = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  const can_continue = investmentTypes.length > 0;

  // Filter investment types based on search query
  const filtered_investment_types = investmentTypes.filter((type) =>
    type.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate stats
  const totalInvestmentTypes = investmentTypes.length;
  const taxableCount = investmentTypes.filter((type) => type.taxability).length;
  const taxExemptCount = investmentTypes.filter(
    (type) => !type.taxability
  ).length;
  const avgExpenseRatio = investmentTypes.length
    ? investmentTypes.reduce((sum, type) => sum + type.expenseRatio, 0) /
      investmentTypes.length
    : 0;

  // Card design for investment types when in mobile view
  const InvestmentTypeCard = ({ type }: { type: InvestmentTypeRaw }) => (
    <MotionCard
      variants={itemVariants}
      borderWidth="1px"
      borderRadius="xl"
      shadow={cardShadow}
      p={5}
      bg={newItemAdded === type.id ? highlightColor : cardBg}
      style={{ transition: "all 0.3s" }}
      _hover={{ transform: "translateY(-4px)", shadow: "xl" }}
      position="relative"
      overflow="hidden"
      animate={
        newItemAdded === type.id
          ? {
              scale: [1, 1.03, 1],
              backgroundColor: [cardBg, highlightColor, cardBg],
            }
          : {}
      }
      transition={{ duration: 1.5 }}
    >
      <Box
        position="absolute"
        top="0"
        left="0"
        right="0"
        height="6px"
        bgGradient={`linear(to-r, ${accentColor}, ${
          type.taxability ? "green.400" : "purple.400"
        })`}
      />

      <VStack align="stretch" spacing={4}>
        <Flex justifyContent="space-between" alignItems="center">
          <HStack spacing={3}>
            <Icon as={FiPackage} color={accentColor} boxSize={5} />
            <Heading size="md">{type.name}</Heading>
          </HStack>
          <Tooltip label="Delete" placement="top">
            <IconButton
              icon={<DeleteIcon />}
              variant="ghost"
              colorScheme="red"
              aria-label="Delete investment type"
              onClick={() => handle_delete_click(type.id || "")}
              isDisabled={!type.id}
              size="sm"
            />
          </Tooltip>
        </Flex>

        {type.description && (
          <Text fontSize="sm" color="gray.500" noOfLines={2}>
            {type.description}
          </Text>
        )}

        <Divider />

        <HStack spacing={4}>
          <VStack align="start" spacing={2} flex="1">
            <HStack>
              <Icon as={FiTrendingUp} color={accentColor} boxSize={4} />
              <Text fontWeight="medium" fontSize="sm">
                Return:
              </Text>
            </HStack>
            <Text fontSize="sm" fontWeight="bold">
              {get_distribution_display(type.returnDistribution)}
              {type.returnAmtOrPct === "percent" ? "%" : ""}
            </Text>
          </VStack>

          <VStack align="start" spacing={2} flex="1">
            <HStack>
              <Icon as={FiPercent} color={accentColor} boxSize={4} />
              <Text fontWeight="medium" fontSize="sm">
                Expense Ratio:
              </Text>
            </HStack>
            <Text fontSize="sm" fontWeight="bold">
              {format_percent(type.expenseRatio)}
            </Text>
          </VStack>
        </HStack>

        <Badge
          px={3}
          py={1.5}
          borderRadius="full"
          textTransform="capitalize"
          bg={type.taxability ? badgeColorTaxable : badgeColorExempt}
          color={type.taxability ? badgeTextTaxable : badgeTextExempt}
          alignSelf="flex-start"
          fontSize="xs"
          fontWeight="medium"
          display="flex"
          alignItems="center"
        >
          <Icon
            as={type.taxability ? FiDollarSign : FiShield}
            mr={1}
            boxSize={3}
          />
          {type.taxability ? "Taxable" : "Tax-exempt"}
        </Badge>
      </VStack>
    </MotionCard>
  );

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
                _hover={{ bg: "blue.50" }}
              >
                Back
              </Button>
            </Flex>
          </CardHeader>

          <CardBody p={6}>
            <VStack spacing={8} align="stretch">
              {/* Stats Overview */}
              {investmentTypes.length > 0 && (
                <MotionBox
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} mb={6}>
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
                        Avg Expense Ratio
                      </StatLabel>
                      <Flex align="center">
                        <Icon as={FiPercent} color={accentColor} mr={2} />
                        <StatNumber>{avgExpenseRatio.toFixed(2)}%</StatNumber>
                      </Flex>
                    </MotionStat>
                  </SimpleGrid>
                </MotionBox>
              )}

              {/* Main content header */}
              <Flex
                direction={isMobile ? "column" : "row"}
                justifyContent="space-between"
                alignItems={isMobile ? "flex-start" : "center"}
                gap={4}
                mb={2}
              >
                <Box maxW="600px">
                  <MotionText
                    mb={2}
                    fontSize="lg"
                    fontWeight="medium"
                    color={accentColor}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    Define Your Investment Options
                  </MotionText>
                  <MotionText
                    color={useColorModeValue("gray.600", "gray.400")}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                  >
                    Create investment types before adding them to your
                    portfolio. You'll use these types when building your
                    investment portfolio in the next step.
                  </MotionText>
                </Box>

                <HStack spacing={4}>
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

                  {investmentTypes.length > 0 && (
                    <HStack
                      spacing={1}
                      bg={headerBg}
                      p={1}
                      borderRadius="md"
                      shadow="sm"
                    >
                      <Tooltip label="Table View">
                        <IconButton
                          icon={<FiList />}
                          size="sm"
                          aria-label="Table View"
                          colorScheme="blue"
                          variant={viewMode === "table" ? "solid" : "ghost"}
                          onClick={() => setViewMode("table")}
                        />
                      </Tooltip>
                      <Tooltip label="Card View">
                        <IconButton
                          icon={<FiGrid />}
                          size="sm"
                          aria-label="Card View"
                          colorScheme="blue"
                          variant={viewMode === "cards" ? "solid" : "ghost"}
                          onClick={() => setViewMode("cards")}
                        />
                      </Tooltip>
                    </HStack>
                  )}

                  <Button
                    leftIcon={<AddIcon />}
                    colorScheme="blue"
                    onClick={onOpen}
                    size="md"
                    shadow="md"
                    _hover={{
                      transform: "translateY(-2px)",
                      shadow: "lg",
                      bg: buttonHoverBg,
                    }}
                    transition="all 0.3s"
                    borderRadius="md"
                  >
                    Add Investment Type
                  </Button>
                </HStack>
              </Flex>

              {/* Investment Types List */}
              <AnimatePresence>
                {investmentTypes.length > 0 ? (
                  viewMode === "table" ? (
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
                        <Tbody>
                          {filtered_investment_types.map((type) => (
                            console.log(type),
                            <Tr
                              key={type.id}
                              _hover={{ bg: hoverBg }}
                              transition="background 0.2s"
                              bg={
                                newItemAdded === type.id
                                  ? highlightColor
                                  : undefined
                              }
                            >
                              <Td>
                                <chakra.div maxW="300px">
                                  <Text fontWeight="semibold">{type.name}</Text>
                                  {type.description && (
                                    <Text
                                      fontSize="sm"
                                      color="gray.500"
                                      noOfLines={1}
                                    >
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
                                    {get_distribution_display(
                                      type.returnDistribution
                                    )}
                                    {type.returnAmtOrPct === "percent"
                                      ? "%"
                                      : ""}
                                  </TagLabel>
                                </Tag>
                              </Td>
                              <Td>{format_percent(type.expenseRatio)}</Td>
                              <Td>
                                <Badge
                                  px={2}
                                  py={1}
                                  borderRadius="full"
                                  textTransform="capitalize"
                                  bg={
                                    type.taxability
                                      ? badgeColorTaxable
                                      : badgeColorExempt
                                  }
                                  color={
                                    type.taxability
                                      ? badgeTextTaxable
                                      : badgeTextExempt
                                  }
                                >
                                  <Flex align="center">
                                    <Icon
                                      as={
                                        type.taxability
                                          ? FiDollarSign
                                          : FiShield
                                      }
                                      mr={1}
                                      boxSize={3}
                                    />
                                    {type.taxability ? "Taxable" : "Tax-exempt"}
                                  </Flex>
                                </Badge>
                              </Td>
                              <Td>
                                <Tooltip label="Delete" placement="top">
                                  <IconButton
                                    icon={<DeleteIcon />}
                                    variant="ghost"
                                    colorScheme="red"
                                    aria-label="Delete investment type"
                                    onClick={() =>
                                      handle_delete_click(type.id || "")
                                    }
                                    isDisabled={!type.id}
                                    size="sm"
                                  />
                                </Tooltip>
                              </Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>

                      {filtered_investment_types.length === 0 &&
                        investmentTypes.length > 0 && (
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
                        )}
                    </Box>
                  ) : (
                    <Box
                      as={motion.div}
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                    >
                      <SimpleGrid
                        columns={{ base: 1, sm: 2, lg: 3 }}
                        spacing={6}
                      >
                        {filtered_investment_types.map((type) => (
                          <InvestmentTypeCard key={type.id} type={type} />
                        ))}
                      </SimpleGrid>

                      {filtered_investment_types.length === 0 &&
                        investmentTypes.length > 0 && (
                          <Box
                            p={8}
                            textAlign="center"
                            borderWidth="1px"
                            borderStyle="dashed"
                            borderColor={borderColor}
                            borderRadius="lg"
                            bg={cardBg}
                            mt={4}
                          >
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
                        )}
                    </Box>
                  )
                ) : (
                  <MotionBox
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    p={10}
                    textAlign="center"
                    borderWidth="2px"
                    borderRadius="xl"
                    borderStyle="dashed"
                    borderColor={emptyBorderColor}
                    bgGradient={`linear(to-b, ${gradientStart}, ${gradientEnd})`}
                  >
                    <MotionBox
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      transition={{
                        repeat: Infinity,
                        repeatType: "reverse",
                        duration: 2,
                      }}
                      display="inline-block"
                      mb={5}
                    >
                      <Icon
                        as={FiInfo}
                        boxSize={14}
                        color={emptyStateIconColor}
                      />
                    </MotionBox>
                    <Heading
                      size="md"
                      color={accentColor}
                      fontWeight="medium"
                      mb={3}
                    >
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
                      Add your first investment type to get started. You'll need
                      at least one investment type to continue.
                    </Text>
                    <Button
                      leftIcon={<FiPlus />}
                      colorScheme="blue"
                      onClick={onOpen}
                      size="lg"
                      shadow="lg"
                      _hover={{ transform: "translateY(-2px)" }}
                      transition="all 0.3s"
                      borderRadius="md"
                    >
                      Add Your First Investment Type
                    </Button>
                  </MotionBox>
                )}
              </AnimatePresence>

              {/* Continue Button */}
              <Flex justify="flex-end" mt={8}>
                <Button
                  rightIcon={<Icon as={FiChevronRight} />}
                  colorScheme="blue"
                  onClick={onContinue}
                  isDisabled={!can_continue}
                  size="lg"
                  shadow="md"
                  _hover={{
                    transform: can_continue ? "translateY(-2px)" : "none",
                    shadow: "lg",
                    bg: can_continue ? buttonHoverBg : undefined,
                  }}
                  transition="all 0.3s"
                  borderRadius="md"
                >
                  Continue to Investments
                </Button>
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
            <Text fontSize="sm" color="gray.600">
              Create different investment types with varied risk profiles.
              Consider adding tax-exempt options for retirement accounts and
              taxable options for brokerage accounts.
            </Text>
          </MotionCard>
        )}
      </Container>

      {/* Add Investment Type Modal */}
      <AddInvestmentTypeModal
        isOpen={isOpen}
        onClose={onClose}
        onSave={handle_save_investment_type}
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

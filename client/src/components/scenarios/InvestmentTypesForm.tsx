// AI-generated code
// Create a component for managing investment types before creating an investment portfolio

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
  Icon,
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
} from "@chakra-ui/react";
import { AddIcon, DeleteIcon, EditIcon } from "@chakra-ui/icons";
import { FiChevronLeft, FiChevronRight, FiList, FiInfo } from "react-icons/fi";
import { InvestmentTypeRaw } from "../../types/Scenarios";
import { investmentTypeStorage } from "../../services/investmentTypeStorage";
import AddInvestmentTypeModal from "../investment/AddInvestmentTypeModal";

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
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();
  const cancelRef = React.useRef<any>();
  const toast = useToast();

  // UI colors
  const bg = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const hoverBg = useColorModeValue("gray.50", "gray.700");

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
    toast({
      title: "Investment Type Created",
      description: `${investmentType.name} has been added to your investment types.`,
      status: "success",
      duration: 3000,
      isClosable: true,
      position: "top-right",
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
      });
    }

    load_investment_types();
    onDeleteClose();
    set_type_to_delete(null);
  };

  const get_distribution_display = (distribution: Map<string, any>) => {
    const type = distribution.get("type");
    if (type === "fixed") {
      return `${distribution.get("value")}`;
    } else if (type === "normal") {
      return `${distribution.get("mean")} ± ${distribution.get("stdev")}`;
    }
    return "Unknown";
  };

  const format_percent = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  const can_continue = investmentTypes.length > 0;

  return (
    <Box minH="100vh" bg={bg} py={8}>
      <Container maxW="6xl" px={4}>
        <Card
          rounded="xl"
          shadow="xl"
          overflow="hidden"
          borderWidth="1px"
          borderColor={borderColor}
          bg={cardBg}
          mb={8}
        >
          <CardHeader
            bg={useColorModeValue("blue.50", "blue.900")}
            py={6}
            px={8}
            borderBottomWidth="1px"
            borderBottomColor={borderColor}
          >
            <Flex justify="space-between" align="center">
              <HStack spacing={3}>
                <Icon as={FiList} boxSize={6} color="blue.500" />
                <Heading size="lg" fontWeight="bold">
                  Investment Types
                </Heading>
              </HStack>
              <Button
                variant="ghost"
                colorScheme="blue"
                onClick={onBack}
                leftIcon={<Icon as={FiChevronLeft} />}
                size="md"
              >
                Back
              </Button>
            </Flex>
          </CardHeader>

          <CardBody p={6}>
            <Text mb={4} color={useColorModeValue("gray.600", "gray.400")}>
              Create investment types before adding them to your portfolio.
              You'll use these types when building your investment portfolio in
              the next step.
            </Text>

            <Button
              leftIcon={<AddIcon />}
              colorScheme="blue"
              onClick={onOpen}
              mb={6}
            >
              Add Investment Type
            </Button>

            {investmentTypes.length > 0 ? (
              <Box overflowX="auto">
                <Table variant="simple" colorScheme="blue">
                  <Thead>
                    <Tr>
                      <Th>Name</Th>
                      <Th>Return</Th>
                      <Th>Expense Ratio</Th>
                      <Th>Taxability</Th>
                      <Th>Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {investmentTypes.map((type) => (
                      <Tr key={type.id}>
                        <Td>
                          <Text fontWeight="semibold">{type.name}</Text>
                          <Text fontSize="sm" color="gray.500">
                            {type.description}
                          </Text>
                        </Td>
                        <Td>
                          {get_distribution_display(type.returnDistribution)}
                          {type.returnAmtOrPct === "percent" ? "%" : ""}
                        </Td>
                        <Td>{format_percent(type.expenseRatio)}</Td>
                        <Td>
                          <Badge
                            colorScheme={type.taxability ? "green" : "purple"}
                          >
                            {type.taxability ? "Taxable" : "Tax-exempt"}
                          </Badge>
                        </Td>
                        <Td>
                          <IconButton
                            icon={<DeleteIcon />}
                            variant="ghost"
                            colorScheme="red"
                            aria-label="Delete investment type"
                            onClick={() => handle_delete_click(type.id || "")}
                            isDisabled={!type.id}
                          />
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            ) : (
              <Box
                p={8}
                textAlign="center"
                borderWidth="1px"
                borderRadius="lg"
                borderStyle="dashed"
              >
                <Icon as={FiInfo} boxSize={10} color="gray.400" mb={3} />
                <Text color="gray.500" fontWeight="medium">
                  No investment types created yet
                </Text>
                <Text color="gray.400" fontSize="sm" maxW="md" mx="auto" mt={2}>
                  Add your first investment type to get started. You'll need at
                  least one investment type to continue.
                </Text>
              </Box>
            )}

            <Flex justify="flex-end" mt={6}>
              <Button
                rightIcon={<Icon as={FiChevronRight} />}
                colorScheme="blue"
                onClick={onContinue}
                isDisabled={!can_continue}
              >
                Continue to Investments
              </Button>
            </Flex>
          </CardBody>
        </Card>
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
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
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
              <Button colorScheme="red" onClick={handle_confirm_delete} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

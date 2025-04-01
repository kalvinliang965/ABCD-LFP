/* AI-generated code
Prompt: Create a more visually appealing component for importing a scenario from a YAML file
*/

import React, { useState } from "react";
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Text,
  VStack,
  useColorModeValue,
  useToast,
  Flex,
  Icon,
  FormHelperText,
  Card,
  CardHeader,
  CardBody,
  HStack,
  Divider,
  SimpleGrid,
} from "@chakra-ui/react";
import {
  Upload,
  ArrowLeft,
  FileUp,
  FilePlus,
  CheckCircle2,
} from "lucide-react";
import { motion } from "framer-motion";

export interface YamlImportFormProps {
  onImportComplete: (data: any) => void;
  onBack: () => void;
}

const MotionBox = motion(Box);
const MotionFlex = motion(Flex);

const YamlImportForm: React.FC<YamlImportFormProps> = ({
  onImportComplete,
  onBack,
}) => {
  const [file, set_file] = useState<File | null>(null);
  const [is_loading, set_is_loading] = useState(false);
  const [drag_active, set_drag_active] = useState(false);
  const toast = useToast();

  const headerBg = useColorModeValue("blue.50", "blue.900");
  const headerTextColor = useColorModeValue("blue.800", "blue.100");
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const boxShadow = useColorModeValue(
    "0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)",
    "0 4px 6px rgba(0, 0, 0, 0.4), 0 1px 3px rgba(0, 0, 0, 0.3)"
  );
  const dragBorderColor = useColorModeValue("purple.400", "purple.400");
  const dragBg = useColorModeValue("purple.50", "purple.900");

  const handle_file_change = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const selected_file = event.target.files[0];

      // Check if file is YAML
      if (
        !selected_file.name.endsWith(".yaml") &&
        !selected_file.name.endsWith(".yml")
      ) {
        toast({
          title: "Invalid file format",
          description: "Please upload a YAML file (.yaml or .yml)",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      set_file(selected_file);
    }
  };

  const handle_drag_over = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    set_drag_active(true);
  };

  const handle_drag_leave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    set_drag_active(false);
  };

  const handle_drop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    set_drag_active(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const dropped_file = e.dataTransfer.files[0];

      // Check if file is YAML
      if (
        !dropped_file.name.endsWith(".yaml") &&
        !dropped_file.name.endsWith(".yml")
      ) {
        toast({
          title: "Invalid file format",
          description: "Please upload a YAML file (.yaml or .yml)",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      set_file(dropped_file);
    }
  };

  const handle_import = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a YAML file to import",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    set_is_loading(true);

    try {
      // Here you would implement the actual file parsing and API call
      // For now, we'll just simulate a successful import
      const reader = new FileReader();

      reader.onload = (event) => {
        if (event.target?.result) {
          // In a real implementation, you would parse the YAML and validate it
          // For now, just simulate successful import
          setTimeout(() => {
            onImportComplete({
              success: true,
              message: "File imported successfully",
              // Mock imported data
              data: {
                name: file.name.replace(/\.(yaml|yml)$/, ""),
                // Other mock data would go here
              },
            });

            set_is_loading(false);
          }, 1000);
        }
      };

      reader.onerror = () => {
        throw new Error("Error reading file");
      };

      reader.readAsText(file);
    } catch (error) {
      console.error("Import error:", error);
      toast({
        title: "Import failed",
        description: "There was an error importing your scenario file",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      set_is_loading(false);
    }
  };

  return (
    <Container maxW="container.lg" py={10}>
      <Card
        rounded="lg"
        shadow="xl"
        overflow="hidden"
        borderWidth="1px"
        borderColor={borderColor}
        bg={cardBg}
      >
        <CardHeader bg={headerBg} py={5} px={6}>
          <Flex justify="space-between" align="center">
            <Heading as="h1" size="lg" color={headerTextColor}>
              Import Scenario from YAML
            </Heading>
          </Flex>
        </CardHeader>

        <CardBody p={6}>
          <VStack spacing={8} align="stretch">
            <Text color="gray.600" fontSize="md">
              Upload a YAML file to import an existing scenario configuration.
              This will allow you to quickly set up your financial scenario
              without having to configure everything manually.
            </Text>

            <Button
              leftIcon={<Icon as={ArrowLeft} />}
              variant="outline"
              width="fit-content"
              onClick={onBack}
              mb={2}
            >
              Back to Selection
            </Button>

            <MotionBox
              p={8}
              borderRadius="xl"
              borderWidth="2px"
              borderStyle="dashed"
              borderColor={drag_active ? dragBorderColor : borderColor}
              bg={drag_active ? dragBg : "transparent"}
              transition={{ duration: 0.2 }}
              onDragOver={handle_drag_over}
              onDragLeave={handle_drag_leave}
              onDrop={handle_drop}
              whileHover={{ borderColor: dragBorderColor }}
            >
              <VStack spacing={6}>
                <MotionBox
                  animate={{
                    y: [0, -5, 0],
                  }}
                  transition={{
                    duration: 2,
                    ease: "easeInOut",
                    repeat: Infinity,
                    repeatType: "loop",
                  }}
                >
                  <Icon
                    as={FileUp}
                    boxSize={16}
                    color={useColorModeValue("purple.500", "purple.300")}
                  />
                </MotionBox>

                <VStack spacing={1}>
                  <Heading size="md" textAlign="center">
                    Drag & Drop Your YAML File
                  </Heading>
                  <Text color="gray.500" textAlign="center">
                    or click to browse files
                  </Text>
                </VStack>

                <FormControl>
                  <Input
                    id="yaml-file"
                    type="file"
                    accept=".yaml,.yml"
                    onChange={handle_file_change}
                    height="100%"
                    width="100%"
                    position="absolute"
                    top="0"
                    left="0"
                    opacity="0"
                    aria-hidden="true"
                    cursor="pointer"
                    zIndex={2}
                  />
                </FormControl>

                <Text fontSize="sm" color="gray.500">
                  Supported file types: .yaml, .yml
                </Text>
              </VStack>
            </MotionBox>

            {file && (
              <MotionBox
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Flex
                  bg={useColorModeValue("green.50", "green.900")}
                  p={4}
                  borderRadius="md"
                  borderWidth="1px"
                  borderColor={useColorModeValue("green.200", "green.700")}
                  align="center"
                >
                  <Icon
                    as={CheckCircle2}
                    color="green.500"
                    boxSize={6}
                    mr={3}
                  />
                  <Box flex="1">
                    <Text fontWeight="medium">Selected file:</Text>
                    <Text>{file.name}</Text>
                  </Box>
                </Flex>
              </MotionBox>
            )}

            <Divider my={2} />

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <Box>
                <Heading size="sm" mb={2}>
                  Benefits of YAML Import
                </Heading>
                <VStack align="start" spacing={2}>
                  <HStack>
                    <Icon as={FilePlus} boxSize={4} color="green.500" />
                    <Text fontSize="sm">Quick setup of complex scenarios</Text>
                  </HStack>
                  <HStack>
                    <Icon as={FilePlus} boxSize={4} color="green.500" />
                    <Text fontSize="sm">Easier to share configurations</Text>
                  </HStack>
                  <HStack>
                    <Icon as={FilePlus} boxSize={4} color="green.500" />
                    <Text fontSize="sm">Perfect for advanced users</Text>
                  </HStack>
                </VStack>
              </Box>

              <Flex align="center" justify="center">
                <Button
                  colorScheme="purple"
                  size="lg"
                  isLoading={is_loading}
                  loadingText="Importing..."
                  onClick={handle_import}
                  isDisabled={!file}
                  leftIcon={<Icon as={Upload} />}
                  w={{ base: "full", md: "auto" }}
                >
                  Import Scenario
                </Button>
              </Flex>
            </SimpleGrid>
          </VStack>
        </CardBody>
      </Card>
    </Container>
  );
};

export default YamlImportForm;

// AI-generated code
// Create a component for importing State Tax YAML files with drag-and-drop functionality

import {
  Box,
  Text,
  Button,
  Icon,
  useToast,
  useColorModeValue,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Input,
  FormControl,
  VStack,
  Flex,
  Heading,
  Card,
  CardBody,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import React, { useState, useRef } from 'react';
import { FaUpload } from 'react-icons/fa';
import { FileUp, CheckCircle2 } from 'lucide-react';
import { StateType } from '../../types/Enum';
import stateTaxYAMLService from '../../services/stateTaxYaml';
import { create_state_tax_raw_yaml } from '../../utils/StateYamlParser';

// Motion components
const MotionBox = motion(Box);

interface ImportStateTaxYamlProps {
  state: StateType;
  onImportSuccess: () => void;
  isReupload?: boolean;
}

const ImportStateTaxYaml: React.FC<ImportStateTaxYamlProps> = ({
  state,
  onImportSuccess,
  isReupload = false,
}) => {
  const [tax_file, set_tax_file] = useState<File | null>(null);
  const [is_importing_tax_data, set_is_importing_tax_data] = useState<boolean>(false);
  const [drag_active, set_drag_active] = useState(false);
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection for tax data import
  const handle_file_select = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const selected_file = event.target.files[0];

      // Check if file is YAML
      if (!selected_file.name.endsWith('.yaml') && !selected_file.name.endsWith('.yml')) {
        toast({
          title: 'Invalid file format',
          description: 'Please upload a YAML file (.yaml or .yml)',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      set_tax_file(selected_file);
    }
  };

  // Trigger file input click
  const handle_browse_click = () => {
    fileInputRef.current?.click();
  };

  // Handle drag events
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
      if (!dropped_file.name.endsWith('.yaml') && !dropped_file.name.endsWith('.yml')) {
        toast({
          title: 'Invalid file format',
          description: 'Please upload a YAML file (.yaml or .yml)',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      set_tax_file(dropped_file);
    }
  };

  // Handle import function
  const handle_import_yaml = async () => {
    if (!tax_file) {
      toast({
        title: 'No file selected',
        description: 'Please select a YAML file to import',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      set_is_importing_tax_data(true);

      // Read the file content
      const reader = new FileReader();
      reader.onload = async e => {
        const content = e.target?.result as string;
        try {
          const parsed_content = create_state_tax_raw_yaml(content);
          console.log('parsed_content:', parsed_content);
          console.log('type of parsed_content:', typeof parsed_content);
          try {
            const savedTaxData = await stateTaxYAMLService.create(parsed_content);

            toast({
              title: 'Tax Data Imported',
              description: `Successfully imported tax data for ${state}.`,
              status: 'success',
              duration: 5000,
              isClosable: true,
            });

            // Notify parent component of successful import
            onImportSuccess();

            // Reset the file state
            set_tax_file(null);
          } catch (importError) {
            console.error('Error importing tax data:', importError);
            toast({
              title: 'Import Failed',
              description:
                'There was an error importing the tax data. Please check the file format.',
              status: 'error',
              duration: 5000,
              isClosable: true,
            });
          }
        } catch (parsingError) {
          console.error('Error parsing YAML:', parsingError);

          // Get detailed error message
          const errorMessage =
            parsingError instanceof Error
              ? parsingError.message
              : 'Invalid YAML format. Please check your file structure.';

          // Show detailed error toast with multiline support
          toast({
            title: 'YAML Validation Failed',
            description: (
              <Box whiteSpace="pre-wrap" fontSize="sm">
                {errorMessage}
              </Box>
            ),
            status: 'error',
            duration: 10000,
            isClosable: true,
          });
        }
      };

      reader.readAsText(tax_file);
    } catch (error) {
      console.error('Error reading file:', error);
      toast({
        title: 'File Read Error',
        description: 'Could not read the selected file.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      set_is_importing_tax_data(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return isReupload ? (
    <Card variant="outline" borderColor="purple.200" mb={4}>
      <CardBody>
        <VStack spacing={4} align="stretch">
          <Heading size="sm" textAlign="center">
            Upload New State Tax Data
          </Heading>

          {/* Drag & Drop UI */}
          <MotionBox
            p={4}
            borderRadius="lg"
            borderWidth="2px"
            borderStyle="dashed"
            borderColor={drag_active ? 'purple.400' : useColorModeValue('gray.200', 'gray.700')}
            bg={drag_active ? useColorModeValue('purple.50', 'purple.900') : 'transparent'}
            transition={{ duration: 0.2 }}
            onDragOver={handle_drag_over}
            onDragLeave={handle_drag_leave}
            onDrop={handle_drop}
            whileHover={{ borderColor: 'purple.400' }}
            mb={2}
          >
            <VStack spacing={3}>
              <MotionBox
                animate={{
                  y: [0, -5, 0],
                }}
                transition={{
                  duration: 2,
                  ease: 'easeInOut',
                  repeat: Infinity,
                  repeatType: 'loop',
                }}
              >
                <Icon
                  as={FileUp}
                  boxSize={8}
                  color={useColorModeValue('purple.500', 'purple.300')}
                />
              </MotionBox>

              <VStack spacing={1}>
                <Text fontWeight="medium">Drag & Drop Tax YAML File</Text>
                <Text color="gray.500" fontSize="sm" textAlign="center">
                  or use the button below
                </Text>
              </VStack>

              <FormControl display="flex" justifyContent="center">
                <Input
                  type="file"
                  accept=".yaml,.yml"
                  ref={fileInputRef}
                  onChange={handle_file_select}
                  display="none"
                />
                <Button
                  onClick={handle_browse_click}
                  colorScheme="purple"
                  leftIcon={<Icon as={FileUp} />}
                  size="sm"
                >
                  Browse Files
                </Button>
              </FormControl>

              <Text fontSize="xs" color="gray.500">
                Supported file types: .yaml, .yml
              </Text>
            </VStack>
          </MotionBox>

          {/* Selected File Display */}
          {tax_file && (
            <MotionBox
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              mb={2}
            >
              <Flex
                bg={useColorModeValue('green.50', 'green.900')}
                p={3}
                borderRadius="md"
                borderWidth="1px"
                borderColor={useColorModeValue('green.200', 'green.700')}
                align="center"
              >
                <Icon as={CheckCircle2} color="green.500" boxSize={5} mr={2} />
                <Box flex="1">
                  <Text fontWeight="medium" fontSize="sm">
                    Selected file:
                  </Text>
                  <Text fontSize="sm">{tax_file.name}</Text>
                </Box>
              </Flex>
            </MotionBox>
          )}

          {/* Import Button */}
          <Button
            colorScheme="purple"
            leftIcon={<Icon as={FaUpload} />}
            isLoading={is_importing_tax_data}
            loadingText="Importing..."
            onClick={handle_import_yaml}
            isDisabled={!tax_file}
            size="md"
            width="full"
          >
            Upload Tax Data
          </Button>
        </VStack>
      </CardBody>
    </Card>
  ) : (
    <Alert
      status="warning"
      variant="subtle"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      textAlign="center"
      borderRadius="md"
      p={4}
    >
      <AlertIcon boxSize="24px" mr={0} mb={2} />
      <AlertTitle mb={2}>State Tax Data Missing</AlertTitle>
      <AlertDescription width="100%">
        <Text mb={4}>
          This scenario cannot be used for simulation because tax data for <strong>{state}</strong>{' '}
          is missing.
        </Text>

        {/* Drag & Drop UI */}
        <MotionBox
          p={4}
          borderRadius="lg"
          borderWidth="2px"
          borderStyle="dashed"
          borderColor={drag_active ? 'purple.400' : useColorModeValue('gray.200', 'gray.700')}
          bg={drag_active ? useColorModeValue('purple.50', 'purple.900') : 'transparent'}
          transition={{ duration: 0.2 }}
          onDragOver={handle_drag_over}
          onDragLeave={handle_drag_leave}
          onDrop={handle_drop}
          whileHover={{ borderColor: 'purple.400' }}
          mb={4}
        >
          <VStack spacing={3}>
            <MotionBox
              animate={{
                y: [0, -5, 0],
              }}
              transition={{
                duration: 2,
                ease: 'easeInOut',
                repeat: Infinity,
                repeatType: 'loop',
              }}
            >
              <Icon as={FileUp} boxSize={8} color={useColorModeValue('purple.500', 'purple.300')} />
            </MotionBox>

            <VStack spacing={1}>
              <Heading size="sm" textAlign="center">
                Drag & Drop Tax YAML File
              </Heading>
              <Text color="gray.500" fontSize="sm" textAlign="center">
                or use the button below
              </Text>
            </VStack>

            <FormControl display="flex" justifyContent="center">
              <Input
                type="file"
                accept=".yaml,.yml"
                ref={fileInputRef}
                onChange={handle_file_select}
                display="none"
              />
              <Button
                onClick={handle_browse_click}
                colorScheme="purple"
                leftIcon={<Icon as={FileUp} />}
                size="sm"
              >
                Browse Files
              </Button>
            </FormControl>

            <Text fontSize="xs" color="gray.500">
              Supported file types: .yaml, .yml
            </Text>
          </VStack>
        </MotionBox>

        {/* Selected File Display */}
        {tax_file && (
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            mb={4}
          >
            <Flex
              bg={useColorModeValue('green.50', 'green.900')}
              p={3}
              borderRadius="md"
              borderWidth="1px"
              borderColor={useColorModeValue('green.200', 'green.700')}
              align="center"
            >
              <Icon as={CheckCircle2} color="green.500" boxSize={5} mr={2} />
              <Box flex="1">
                <Text fontWeight="medium" fontSize="sm">
                  Selected file:
                </Text>
                <Text fontSize="sm">{tax_file.name}</Text>
              </Box>
            </Flex>
          </MotionBox>
        )}

        {/* Import Button */}
        <Button
          colorScheme="purple"
          leftIcon={<Icon as={FaUpload} />}
          isLoading={is_importing_tax_data}
          loadingText="Importing..."
          onClick={handle_import_yaml}
          isDisabled={!tax_file}
          size="md"
          width="full"
          mt={2}
        >
          Import Tax Data
        </Button>
      </AlertDescription>
    </Alert>
  );
};

export default ImportStateTaxYaml;

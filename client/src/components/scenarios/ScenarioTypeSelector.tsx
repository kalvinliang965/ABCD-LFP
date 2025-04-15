/* AI-generated code
Prompt: Create a more visually appealing and modern component that asks users whether they want to create a scenario from scratch or import from a YAML file
*/

import {
  Box,
  Heading,
  VStack,
  Text,
  Flex,
  useColorModeValue,
  Container,
  SimpleGrid,
  Icon,
  useBreakpointValue,
  LinkBox,
  Image,
  Badge,
  useTheme,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { PlusCircle, FileUp, ArrowRight, Rocket, FileCode, Zap } from 'lucide-react';
import React from 'react';

export enum ScenarioCreationType {
  FROM_SCRATCH = 'from_scratch',
  IMPORT_YAML = 'import_yaml',
}

export interface ScenarioTypeSelectorProps {
  onTypeSelect: (type: ScenarioCreationType) => void;
}

const MotionBox = motion(Box);
const MotionFlex = motion(Flex);

const ScenarioTypeSelector: React.FC<ScenarioTypeSelectorProps> = ({ onTypeSelect }) => {
  const theme = useTheme();

  // Add debugging function with direct state management for testing
  const handleTypeSelect = (type: ScenarioCreationType) => {
    console.log('ScenarioTypeSelector: Type selected:', type);
    // Call the onTypeSelect prop directly
    try {
      onTypeSelect(type);
      console.log('ScenarioTypeSelector: onTypeSelect called successfully');
    } catch (error) {
      console.error('ScenarioTypeSelector: Error calling onTypeSelect:', error);
    }
  };

  const headerBg = useColorModeValue('blue.50', 'blue.900');
  const headerTextColor = useColorModeValue('blue.800', 'blue.100');
  const cardBg = useColorModeValue('white', 'gray.800');
  const cardBorderColor = useColorModeValue('gray.200', 'gray.700');
  const cardHoverBg = useColorModeValue('gray.50', 'gray.700');
  const boxShadow = useColorModeValue(
    '0 4px 20px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.05)',
    '0 4px 20px rgba(0, 0, 0, 0.4), 0 1px 3px rgba(0, 0, 0, 0.3)'
  );
  const boxShadowHover = useColorModeValue(
    '0 15px 30px rgba(0, 0, 0, 0.1), 0 5px 15px rgba(0, 0, 0, 0.05)',
    '0 15px 30px rgba(0, 0, 0, 0.5), 0 5px 15px rgba(0, 0, 0, 0.3)'
  );

  const is_mobile = useBreakpointValue({ base: true, md: false });
  const card_padding = useBreakpointValue({ base: 6, md: 8 });
  const grid_columns = useBreakpointValue({ base: 1, md: 2 });

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
      } as any,
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 } as any,
    },
  };

  return (
    <MotionBox
      initial="hidden"
      animate="show"
      variants={container}
      minH="100vh"
      bg={useColorModeValue('gray.50', 'gray.900')}
      pt={{ base: 6, md: 12 }}
      pb={{ base: 16, md: 20 }}
      position="relative"
      zIndex={1}
    >
      <Container maxW="container.lg">
        <MotionBox
          variants={item}
          bg={headerBg}
          p={{ base: 6, md: 8 }}
          borderRadius="2xl"
          mb={{ base: 8, md: 12 }}
          boxShadow={boxShadow}
          textAlign="center"
          position="relative"
          overflow="hidden"
        >
          <Box
            position="absolute"
            top={0}
            left={0}
            width="100%"
            height="5px"
            bgGradient="linear(to-r, blue.400, purple.500)"
          />

          <MotionFlex
            position="absolute"
            top="10px"
            right="-15px"
            animate={{
              rotate: [0, 5, 0, -5, 0],
            }}
            transition={
              {
                duration: 5,
                ease: 'easeInOut',
                repeat: Infinity,
              } as any
            }
          >
            <Icon as={Rocket} boxSize={{ base: 8, md: 10 }} color="blue.400" />
          </MotionFlex>

          <Heading
            as="h1"
            size={{ base: 'xl', md: '2xl' }}
            color={headerTextColor}
            mb={4}
            bgGradient="linear(to-r, blue.500, purple.500)"
            bgClip="text"
          >
            Create New Scenario
          </Heading>
          <Text color={headerTextColor} fontSize={{ base: 'md', md: 'xl' }} maxW="3xl" mx="auto">
            Start your financial journey by building a personalized plan that meets your unique
            goals
          </Text>
        </MotionBox>

        <VStack spacing={8} align="stretch">
          <MotionBox variants={item} textAlign="center" mb={{ base: 4, md: 6 }}>
            <Heading
              as="h2"
              size={{ base: 'lg', md: 'xl' }}
              mb={3}
              bgGradient="linear(to-r, blue.400, teal.400)"
              bgClip="text"
            >
              Choose Your Path
            </Heading>
            <Text fontSize={{ base: 'md', md: 'lg' }} color="gray.500" maxW="2xl" mx="auto">
              Select the option that best fits your planning approach
            </Text>
          </MotionBox>

          <SimpleGrid columns={grid_columns} spacing={{ base: 8, md: 10 }} mt={4}>
            {/* Create from Scratch Option */}
            <MotionBox
              variants={item}
              as={LinkBox}
              bg={cardBg}
              borderRadius="2xl"
              borderWidth="1px"
              borderColor={cardBorderColor}
              boxShadow={boxShadow}
              cursor="pointer"
              _hover={{
                boxShadow: boxShadowHover,
                transform: 'translateY(-8px)',
                borderColor: 'green.400',
              }}
              style={{ transition: 'all 0.3s ease' }}
              onClick={() => {
                console.log('Create from Scratch clicked');
                handleTypeSelect(ScenarioCreationType.FROM_SCRATCH);
              }}
              position="relative"
              overflow="hidden"
              h="100%"
              display="flex"
              flexDirection="column"
              zIndex={5}
            >
              <Box
                position="absolute"
                top={0}
                left={0}
                right={0}
                h="6px"
                bgGradient="linear(to-r, green.400, teal.300)"
                borderTopRadius="2xl"
              />

              <Box position="absolute" top={4} right={4} zIndex={1}>
                <Badge
                  colorScheme="green"
                  fontSize="sm"
                  px={3}
                  py={1}
                  borderRadius="full"
                  boxShadow="0 2px 5px rgba(0,0,0,0.1)"
                >
                  Recommended
                </Badge>
              </Box>

              <Flex justify="center" align="center" direction="column" p={card_padding} pt={12}>
                <MotionBox
                  animate={{
                    y: [0, -8, 0],
                  }}
                  transition={
                    {
                      duration: 3,
                      ease: 'easeInOut',
                      repeat: Infinity,
                    } as any
                  }
                  mb={6}
                >
                  <Flex
                    justify="center"
                    align="center"
                    boxSize={{ base: '100px', md: '120px' }}
                    bg="green.50"
                    borderRadius="full"
                    boxShadow="0 4px 12px rgba(0,0,0,0.05)"
                  >
                    <Icon as={PlusCircle} boxSize={{ base: 10, md: 12 }} color="green.400" />
                  </Flex>
                </MotionBox>

                <VStack spacing={4} alignItems="center" textAlign="center">
                  <Heading size="lg" color="green.500">
                    Create from Scratch
                  </Heading>

                  <Text fontSize="md" color="gray.600" maxW="sm">
                    Build your financial scenario step-by-step with our guided process. Customize
                    every detail for a plan tailored to your unique situation.
                  </Text>

                  <VStack mt={6} spacing={3} width="100%">
                    <Flex align="center" width="100%">
                      <Icon as={Zap} color="green.400" mr={3} />
                      <Text fontWeight="medium">Intuitive setup process</Text>
                    </Flex>
                    <Flex align="center" width="100%">
                      <Icon as={Zap} color="green.400" mr={3} />
                      <Text fontWeight="medium">Full customization options</Text>
                    </Flex>
                    <Flex align="center" width="100%">
                      <Icon as={Zap} color="green.400" mr={3} />
                      <Text fontWeight="medium">Perfect for first-time users</Text>
                    </Flex>
                  </VStack>

                  <MotionFlex
                    mt={6}
                    align="center"
                    bg="green.50"
                    color="green.600"
                    fontWeight="semibold"
                    px={4}
                    py={2}
                    borderRadius="full"
                    whileHover={{ scale: 1.05 } as any}
                    width="fit-content"
                  >
                    Get Started <Icon as={ArrowRight} ml={2} />
                  </MotionFlex>
                </VStack>
              </Flex>
            </MotionBox>

            {/* Import YAML Option */}
            <MotionBox
              variants={item}
              as={LinkBox}
              bg={cardBg}
              borderRadius="2xl"
              borderWidth="1px"
              borderColor={cardBorderColor}
              boxShadow={boxShadow}
              cursor="pointer"
              _hover={{
                boxShadow: boxShadowHover,
                transform: 'translateY(-8px)',
                borderColor: 'purple.400',
              }}
              style={{ transition: 'all 0.3s ease' }}
              onClick={() => {
                console.log('Import YAML clicked');
                handleTypeSelect(ScenarioCreationType.IMPORT_YAML);
              }}
              position="relative"
              overflow="hidden"
              h="100%"
              display="flex"
              flexDirection="column"
              zIndex={5}
            >
              <Box
                position="absolute"
                top={0}
                left={0}
                right={0}
                h="6px"
                bgGradient="linear(to-r, purple.400, pink.300)"
                borderTopRadius="2xl"
              />

              <Box position="absolute" top={4} right={4} zIndex={1}>
                <Badge
                  colorScheme="purple"
                  fontSize="sm"
                  px={3}
                  py={1}
                  borderRadius="full"
                  boxShadow="0 2px 5px rgba(0,0,0,0.1)"
                >
                  Advanced
                </Badge>
              </Box>

              <Flex justify="center" align="center" direction="column" p={card_padding} pt={12}>
                <MotionBox
                  animate={{
                    y: [0, -8, 0],
                  }}
                  transition={
                    {
                      duration: 3,
                      ease: 'easeInOut',
                      repeat: Infinity,
                    } as any
                  }
                  mb={6}
                >
                  <Flex
                    justify="center"
                    align="center"
                    boxSize={{ base: '100px', md: '120px' }}
                    bg="purple.50"
                    borderRadius="full"
                    boxShadow="0 4px 12px rgba(0,0,0,0.05)"
                  >
                    <Icon as={FileCode} boxSize={{ base: 10, md: 12 }} color="purple.400" />
                  </Flex>
                </MotionBox>

                <VStack spacing={4} alignItems="center" textAlign="center">
                  <Heading size="lg" color="purple.500">
                    Import YAML File
                  </Heading>

                  <Text fontSize="md" color="gray.600" maxW="sm">
                    Already have a scenario configuration? Import a YAML file to quickly set up your
                    financial plan without manual setup.
                  </Text>

                  <VStack mt={6} spacing={3} width="100%">
                    <Flex align="center" width="100%">
                      <Icon as={Zap} color="purple.400" mr={3} />
                      <Text fontWeight="medium">Rapid scenario creation</Text>
                    </Flex>
                    <Flex align="center" width="100%">
                      <Icon as={Zap} color="purple.400" mr={3} />
                      <Text fontWeight="medium">Perfect for existing plans</Text>
                    </Flex>
                    <Flex align="center" width="100%">
                      <Icon as={Zap} color="purple.400" mr={3} />
                      <Text fontWeight="medium">Full control over configuration</Text>
                    </Flex>
                  </VStack>

                  <MotionFlex
                    mt={6}
                    align="center"
                    bg="purple.50"
                    color="purple.600"
                    fontWeight="semibold"
                    px={4}
                    py={2}
                    borderRadius="full"
                    whileHover={{ scale: 1.05 } as any}
                    width="fit-content"
                  >
                    Import File <Icon as={ArrowRight} ml={2} />
                  </MotionFlex>
                </VStack>
              </Flex>
            </MotionBox>
          </SimpleGrid>
        </VStack>
      </Container>
    </MotionBox>
  );
};

export default ScenarioTypeSelector;

import React from "react";
import {
    Box,
    Heading,
    Text,
    SimpleGrid,
    Button,
    Flex,
    HStack,
    VStack,
    FormControl,
    FormLabel,
    Radio,
    RadioGroup,
    NumberInput,
    NumberInputField,
    NumberInputStepper,
    NumberIncrementStepper,
    NumberDecrementStepper,
    Stack,
    Divider,
    Icon,
    Card,
    CardHeader,
    CardBody,
    CardFooter,
    InputGroup,
    InputLeftElement,
    useColorModeValue,
    FormHelperText,
  } from "@chakra-ui/react";

import {
    FiRefreshCcw,
    FiActivity,
    FiCalendar,
    FiChevronLeft,
    FiChevronRight,
} from "react-icons/fi";

import { useImmer } from "use-immer";

export type RothConversionOptimizer = {
    roth_conversion_start: number,
    roth_conversion_end: number,
    roth_conversion_strategy: Array<String>
};

interface RothConversionOptimizerFormProps {
  onBack: () => void;
  onContinue: () => void;
}
export const RothConversionOptimizerForm: React.FC<RothConversionOptimizerFormProps> = ({
  onBack,
  onContinue,
}) => {


    const cardBg = useColorModeValue("white", "gray.800");
    const headerBg = useColorModeValue("blue.50", "blue.900");
    const borderColor = useColorModeValue("gray.200", "gray.700");
    const userBg = useColorModeValue("blue.50", "blue.900");

    const current_year = new Date().getFullYear();

    const [roth, update_roth] = useImmer({
      opt: "opt-out",
      start_year: current_year,
      end_year: current_year,
      strategy: [],
    });

    function handle_opt_change(value) {
      update_roth(draft => {
        draft.opt = value;
      });
    }

    function handle_start_year_change(value) {
      update_roth(draft => {
        draft.start_year = value;
      });
    }

    function handle_end_year_change(value) {
      update_roth(draft => {
          draft.end_year = value;
      })
    }

    return (
    <Box minH="100vh" bg="gray.50" py={8}>
        <Box maxW="4xl" mx="auto" px={4}>
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
              <Heading
                size="lg"
                color="gray.800"
                display="flex"
                alignItems="center"
              >
                <Icon as={FiRefreshCcw} mr={2} />
                Roth Conversion Optimizer
              </Heading>
              <HStack spacing={2}>
                <Button
                  variant="ghost"
                  colorScheme="blue"
                  onClick={onBack}
                  leftIcon={<Icon as={FiChevronLeft} />}
                >
                  Back
                </Button>
              </HStack>
            </Flex>
          </CardHeader>


          
          <CardBody p={6}>
            <Text color="gray.600" mb={6} fontSize="md">
            {/* generate by gpt */}
            Configure Roth conversion settings for your financial planning scenario. 
            These settings will help optimize your tax strategy and simulate the long-term impact on your retirement savings more accurately.
            </Text>

            <VStack spacing={8} align="stretch">
              {/* roth start year */}
              <Box
                p={5}
                borderRadius="md"
                shadow="sm"
              >
                <Heading
                  size="md"
                  color="gray.700"
                  mb={4}
                  display="flex"
                  alignItems="center"
                >
                 Roth Conversion Optimizer 
                </Heading>
                  <FormControl isRequired>
                    <FormLabel mb={2} htmlFor="opt-group" as='legend'>Roth Conversion Opt</FormLabel>
                    <RadioGroup 
                      onChange ={handle_opt_change} 
                      id="opt-group" 
                      value={roth.opt} 
                    >
                      <HStack spacing='24px'>
                          <Radio 
                            id="opt-in" 
                            value="opt-in"
                          >
                            Opt in
                          </Radio>
                          <Radio 
                            id="opt-out" 
                            value="opt-out"
                          >
                            Opt out
                          </Radio>
                      </HStack>
                    </RadioGroup>
                    <FormHelperText mb={5}>Select if you want to opt in!</FormHelperText>

                    {(roth.opt == "opt-in") && (

                      <>

                      <FormLabel mb={2} htmlFor="roth-start-year" fontWeight="medium">Roth conversion start year</FormLabel>
                      <InputGroup id="roth-start-year-group" mb={5}>
                        <InputLeftElement pointerEvents="none">
                          <Icon as={FiCalendar} color="blue.500" />
                        </InputLeftElement>
                        <NumberInput
                        min={current_year}
                        max={current_year + 120}
                        value={roth.start_year}
                        w="100%"
                        onChange={handle_start_year_change}
                        >
                          <NumberInputField
                            pl={10}
                            id="roth-start-year"
                            borderRadius="md"
                            borderColor="blue.400"
                          />
                          <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                          </NumberInputStepper>
                        </NumberInput>
                      </InputGroup>


                      <FormLabel htmlFor="roth-end-year" mb={2} fontWeight="medium">Roth conversion end year</FormLabel>
                      <InputGroup id="roth-end-year-group" mb={5}>
                        <InputLeftElement pointerEvents="none">
                          <Icon as={FiCalendar} color="blue.500" />
                        </InputLeftElement>
                        <NumberInput
                        id="roth-end-year"
                        min={current_year}
                        max={current_year + 120}
                        value={roth.end_year}
                        onChange={handle_end_year_change}
                        w="100%"
                        >
                          <NumberInputField
                            pl={10}
                            borderRadius="md"
                            borderColor="blue.400"
                          />
                          <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                          </NumberInputStepper>
                        </NumberInput>
                      </InputGroup>
                      </>
                    )} 
                  </FormControl>
              </Box>
            </VStack>
            </CardBody>
        </Card>
        </Box>
    </Box>
    )
};

export default RothConversionOptimizerForm;

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
  } from "@chakra-ui/react";
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
            TODO!
        </Card>
        </Box>
    </Box>
    )
};

export default RothConversionOptimizerForm;

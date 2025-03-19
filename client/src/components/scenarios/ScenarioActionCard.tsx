import React from "react";
import { Box, Button, Text, useColorModeValue } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import Card from "../common/Card";

interface ScenarioActionCardProps {
  title: string;
  description: string;
  buttonText: string;
  linkTo: string;
  colorScheme: string;
}

const ScenarioActionCard: React.FC<ScenarioActionCardProps> = ({
  title,
  description,
  buttonText,
  linkTo,
  colorScheme,
}) => {
  // Generate dynamic colors based on the provided colorScheme
  const bgColor = useColorModeValue(`${colorScheme}.500`, `${colorScheme}.400`);
  const textColor = useColorModeValue("white", "white");
  const buttonBgColor = useColorModeValue("white", "gray.700");
  const buttonTextColor = useColorModeValue(
    `${colorScheme}.600`,
    `${colorScheme}.300`
  );

  return (
    <Card
      title={title}
      description={description}
      minHeight="180px"
      bg={bgColor}
      color={textColor}
      borderStyle="solid"
      borderColor={bgColor}
    >
      <Box mt={4}>
        <Button
          as={RouterLink}
          to={linkTo}
          size="sm"
          bg={buttonBgColor}
          color={buttonTextColor}
          _hover={{ bg: useColorModeValue("gray.100", "gray.600") }}
          width="auto"
        >
          {buttonText}
        </Button>
      </Box>
    </Card>
  );
};

export default ScenarioActionCard;

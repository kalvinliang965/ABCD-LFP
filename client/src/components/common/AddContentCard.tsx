import React, { ReactNode } from "react";
import { Card, Icon, Text, useColorModeValue, Flex } from "@chakra-ui/react";
import { FaPlus } from "react-icons/fa";

export interface AddContentCardProps {
  text?: string;
  onClick: () => void;
  icon?: React.ElementType;
  minHeight?: string;
  iconSize?: number;
  iconColor?: string;
  textColor?: string;
}

const AddContentCard: React.FC<AddContentCardProps> = ({
  text = "Add New Item",
  onClick,
  icon = FaPlus,
  minHeight = "220px",
  iconSize = 10,
  iconColor,
  textColor,
}) => {
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const hoverBg = useColorModeValue("gray.50", "gray.700");
  const defaultIconColor = useColorModeValue("gray.400", "gray.500");
  const defaultTextColor = useColorModeValue("gray.500", "gray.400");

  return (
    <Card
      bg={cardBg}
      boxShadow="md"
      borderRadius="md"
      borderWidth="1px"
      borderColor={borderColor}
      borderStyle="dashed"
      overflow="hidden"
      transition="all 0.3s"
      _hover={{ bg: hoverBg, transform: "translateY(-5px)", boxShadow: "lg" }}
      cursor="pointer"
      height="100%"
      minHeight={minHeight}
      display="flex"
      flexDirection="column"
      onClick={onClick}
    >
      <Flex
        direction="column"
        align="center"
        justify="center"
        height="100%"
        width="100%"
        p={4}
      >
        <Icon
          as={icon}
          boxSize={iconSize}
          color={iconColor || defaultIconColor}
        />
        <Text
          color={textColor || defaultTextColor}
          fontWeight="medium"
          mt={3}
          textAlign="center"
        >
          {text}
        </Text>
      </Flex>
    </Card>
  );
};

export default AddContentCard;

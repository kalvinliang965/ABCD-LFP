import React, { useEffect, useState } from "react";
import {
  Box,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  Flex,
  Avatar,
  Badge,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Card,
  CardHeader,
  CardBody,
  SimpleGrid,
  useColorModeValue,
  Icon,
  Tooltip,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  IconButton,
} from "@chakra-ui/react";
import axios from "axios";
import { FaUser, FaFileUpload, FaShareAlt, FaEdit, FaTrash, FaFileAlt } from "react-icons/fa";

// Interface for user data
interface UserData {
  name: string;
  email: string;
  googleId: string;
  scenarios: Scenario[];
  yamlFiles: YamlFile[];
}

// Interface for scenario data
interface Scenario {
  _id: string;
  name: string;
  data: any;
  sharedWith: { _id: string; name: string; email: string }[];
  permissions: string;
}

// Interface for YAML file data
interface YamlFile {
  _id: string;
  filename: string;
  content: string;
}

const UserProfile: React.FC = () => {
  // State to store user data
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modal states
  const { isOpen: isEditProfileOpen, onOpen: onEditProfileOpen, onClose: onEditProfileClose } = useDisclosure();
  const { isOpen: isUploadYamlOpen, onOpen: onUploadYamlOpen, onClose: onUploadYamlClose } = useDisclosure();
  const { isOpen: isShareScenarioOpen, onOpen: onShareScenarioOpen, onClose: onShareScenarioClose } = useDisclosure();
  
  // Form states
  const [editName, setEditName] = useState<string>("");
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [shareEmail, setShareEmail] = useState<string>("");
  const [sharePermission, setSharePermission] = useState<string>("read");
  const [yamlFileName, setYamlFileName] = useState<string>("");
  const [yamlContent, setYamlContent] = useState<string>("");

  // Colors
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const textColor = useColorModeValue("gray.600", "gray.400");

  useEffect(() => {
    // Fetch user data from the backend when component mounts
    setIsLoading(true);
    axios.get("/api/current_user")
      .then(response => {
        setUser(response.data);
        setEditName(response.data.name);
      })
      .catch(error => {
        console.error("Error fetching user data:", error);
        setError("Failed to load user profile. Please try again later.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  // Handle profile update
  const handleUpdateProfile = () => {
    if (!user) return;
    
    axios.post("/api/user/update", { userId: user.googleId, name: editName })
      .then(response => {
        setUser(prev => prev ? { ...prev, name: editName } : null);
        onEditProfileClose();
      })
      .catch(error => {
        console.error("Error updating profile:", error);
      });
  };

  // Handle YAML file upload
  const handleUploadYaml = () => {
    if (!user) return;
    
    axios.post("/api/yaml", { 
      userId: user.googleId, 
      filename: yamlFileName, 
      content: yamlContent 
    })
      .then(response => {
        // Add the new YAML file to the user's list
        const newYamlFile = {
          _id: new Date().toISOString(), // Temporary ID until we get the real one from the server
          filename: yamlFileName,
          content: yamlContent
        };
        setUser(prev => prev ? { 
          ...prev, 
          yamlFiles: [...prev.yamlFiles, newYamlFile] 
        } : null);
        
        // Reset form
        setYamlFileName("");
        setYamlContent("");
        onUploadYamlClose();
      })
      .catch(error => {
        console.error("Error uploading YAML file:", error);
      });
  };

  // Handle scenario sharing
  const handleShareScenario = () => {
    if (!user || !selectedScenario) return;
    
    axios.post("/api/scenarios/share", {
      userId: user.googleId,
      scenarioId: selectedScenario._id,
      shareWithEmail: shareEmail,
      permission: sharePermission
    })
      .then(response => {
        // Update the scenario's shared list (this is simplified, you'd need to get the actual user ID)
        onShareScenarioClose();
      })
      .catch(error => {
        console.error("Error sharing scenario:", error);
      });
  };

  // Open share scenario modal
  const openShareModal = (scenario: Scenario) => {
    setSelectedScenario(scenario);
    setShareEmail("");
    setSharePermission("read");
    onShareScenarioOpen();
  };

  // Show loading state while fetching user data
  if (isLoading) {
    return (
      <Flex justify="center" align="center" height="100vh">
        <Heading size="lg">Loading profile data...</Heading>
      </Flex>
    );
  }

  // Show error state if there was a problem
  if (error) {
    return (
      <Flex justify="center" align="center" height="100vh" direction="column">
        <Heading size="lg" color="red.500" mb={4}>Error</Heading>
        <Text>{error}</Text>
        <Button mt={4} colorScheme="blue" onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </Flex>
    );
  }

  // Show message if no user data is available
  if (!user) {
    return (
      <Flex justify="center" align="center" height="100vh" direction="column">
        <Heading size="lg" mb={4}>No Profile Data</Heading>
        <Text>Please log in to view your profile.</Text>
        <Button mt={4} colorScheme="blue" as="a" href="/login">
          Go to Login
        </Button>
      </Flex>
    );
  }

  // Render user profile information
  return (
    <Box p={5} maxWidth="1200px" mx="auto" mt={5}>
      {/* Profile Header */}
      <Card mb={6} bg={cardBg} boxShadow="md" borderRadius="lg">
        <CardBody>
          <Flex direction={{ base: "column", md: "row" }} align="center">
            <Avatar 
              size="xl" 
              name={user.name} 
              src="" 
              bg="blue.500" 
              color="white"
              icon={<FaUser fontSize="2rem" />}
              mr={{ base: 0, md: 6 }}
              mb={{ base: 4, md: 0 }}
            />
            <VStack align={{ base: "center", md: "start" }} spacing={2} flex={1}>
              <Heading as="h2" size="lg">{user.name}</Heading>
              <Text color={textColor}>{user.email}</Text>
              <HStack spacing={4} mt={2}>
                <Button 
                  leftIcon={<FaEdit />} 
                  colorScheme="blue" 
                  size="sm"
                  onClick={onEditProfileOpen}
                >
                  Edit Profile
                </Button>
                <Button 
                  leftIcon={<FaFileUpload />} 
                  colorScheme="green" 
                  size="sm"
                  onClick={onUploadYamlOpen}
                >
                  Upload YAML
                </Button>
              </HStack>
            </VStack>
          </Flex>
        </CardBody>
      </Card>

      {/* Tabs for different sections */}
      <Tabs colorScheme="blue" variant="enclosed" isLazy>
        <TabList>
          <Tab>My Scenarios</Tab>
          <Tab>YAML Files</Tab>
          <Tab>Shared With Me</Tab>
        </TabList>

        <TabPanels>
          {/* My Scenarios Tab */}
          <TabPanel>
            <Heading size="md" mb={4}>My Financial Scenarios</Heading>
            {user.scenarios && user.scenarios.length > 0 ? (
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                {user.scenarios.map(scenario => (
                  <Card key={scenario._id} bg={cardBg} boxShadow="sm" borderRadius="md" overflow="hidden">
                    <CardHeader bg={useColorModeValue("gray.50", "gray.700")} py={3} px={4}>
                      <Flex justify="space-between" align="center">
                        <Heading size="sm">{scenario.name}</Heading>
                        <HStack>
                          <Tooltip label="Share Scenario">
                            <IconButton
                              aria-label="Share scenario"
                              icon={<FaShareAlt />}
                              size="sm"
                              variant="ghost"
                              onClick={() => openShareModal(scenario)}
                            />
                          </Tooltip>
                          <Tooltip label="Edit Scenario">
                            <IconButton
                              aria-label="Edit scenario"
                              icon={<FaEdit />}
                              size="sm"
                              variant="ghost"
                            />
                          </Tooltip>
                        </HStack>
                      </Flex>
                    </CardHeader>
                    <CardBody py={3} px={4}>
                      <Text fontSize="sm" noOfLines={2}>
                        {scenario.data?.description || "No description available."}
                      </Text>
                      {scenario.sharedWith && scenario.sharedWith.length > 0 && (
                        <Box mt={2}>
                          <Text fontSize="xs" fontWeight="bold" mb={1}>Shared with:</Text>
                          <HStack flexWrap="wrap">
                            {scenario.sharedWith.map(user => (
                              <Badge key={user._id} colorScheme="blue" fontSize="xs">
                                {user.name}
                              </Badge>
                            ))}
                          </HStack>
                        </Box>
                      )}
                    </CardBody>
                  </Card>
                ))}
              </SimpleGrid>
            ) : (
              <Box textAlign="center" py={10}>
                <Text mb={4}>You haven't created any scenarios yet.</Text>
                <Button colorScheme="blue" as="a" href="/scenarios/new">
                  Create Your First Scenario
                </Button>
              </Box>
            )}
          </TabPanel>

          {/* YAML Files Tab */}
          <TabPanel>
            <Heading size="md" mb={4}>My YAML Files</Heading>
            {user.yamlFiles && user.yamlFiles.length > 0 ? (
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                {user.yamlFiles.map(file => (
                  <Card key={file._id} bg={cardBg} boxShadow="sm" borderRadius="md">
                    <CardHeader bg={useColorModeValue("gray.50", "gray.700")} py={3} px={4}>
                      <Flex justify="space-between" align="center">
                        <HStack>
                          <Icon as={FaFileAlt} color="blue.500" />
                          <Heading size="sm">{file.filename}</Heading>
                        </HStack>
                        <Tooltip label="Delete File">
                          <IconButton
                            aria-label="Delete file"
                            icon={<FaTrash />}
                            size="sm"
                            variant="ghost"
                            colorScheme="red"
                          />
                        </Tooltip>
                      </Flex>
                    </CardHeader>
                    <CardBody py={3} px={4}>
                      <Text fontSize="sm" noOfLines={3} fontFamily="monospace" bg={useColorModeValue("gray.50", "gray.700")} p={2} borderRadius="md">
                        {file.content.substring(0, 100)}...
                      </Text>
                      <Button size="sm" variant="link" colorScheme="blue" mt={2}>
                        View Full Content
                      </Button>
                    </CardBody>
                  </Card>
                ))}
              </SimpleGrid>
            ) : (
              <Box textAlign="center" py={10}>
                <Text mb={4}>You haven't uploaded any YAML files yet.</Text>
                <Button colorScheme="green" onClick={onUploadYamlOpen}>
                  Upload YAML File
                </Button>
              </Box>
            )}
          </TabPanel>

          {/* Shared With Me Tab */}
          <TabPanel>
            <Heading size="md" mb={4}>Scenarios Shared With Me</Heading>
            <Text>This section will display scenarios that other users have shared with you.</Text>
          </TabPanel>
        </TabPanels>
      </Tabs>

      {/* Edit Profile Modal */}
      <Modal isOpen={isEditProfileOpen} onClose={onEditProfileClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Profile</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mb={4}>
              <FormLabel>Name</FormLabel>
              <Input 
                value={editName} 
                onChange={(e) => setEditName(e.target.value)} 
                placeholder="Your name"
              />
            </FormControl>
            <FormControl isReadOnly>
              <FormLabel>Email</FormLabel>
              <Input value={user.email} readOnly />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onEditProfileClose}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={handleUpdateProfile}>
              Save Changes
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Upload YAML Modal */}
      <Modal isOpen={isUploadYamlOpen} onClose={onUploadYamlClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Upload YAML File</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mb={4}>
              <FormLabel>File Name</FormLabel>
              <Input 
                value={yamlFileName} 
                onChange={(e) => setYamlFileName(e.target.value)} 
                placeholder="e.g., california_tax_rates.yaml"
              />
            </FormControl>
            <FormControl>
              <FormLabel>YAML Content</FormLabel>
              <Input
                as="textarea"
                height="200px"
                value={yamlContent}
                onChange={(e) => setYamlContent(e.target.value)}
                placeholder="Paste your YAML content here..."
                p={2}
                fontFamily="monospace"
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onUploadYamlClose}>
              Cancel
            </Button>
            <Button colorScheme="green" onClick={handleUploadYaml}>
              Upload
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Share Scenario Modal */}
      <Modal isOpen={isShareScenarioOpen} onClose={onShareScenarioClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Share Scenario</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedScenario && (
              <>
                <Text mb={4}>
                  Share "{selectedScenario.name}" with another user:
                </Text>
                <FormControl mb={4}>
                  <FormLabel>User Email</FormLabel>
                  <Input 
                    value={shareEmail} 
                    onChange={(e) => setShareEmail(e.target.value)} 
                    placeholder="Enter email address"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Permission</FormLabel>
                  <HStack spacing={4}>
                    <Button
                      variant={sharePermission === "read" ? "solid" : "outline"}
                      colorScheme="blue"
                      onClick={() => setSharePermission("read")}
                      size="sm"
                    >
                      Read Only
                    </Button>
                    <Button
                      variant={sharePermission === "write" ? "solid" : "outline"}
                      colorScheme="green"
                      onClick={() => setSharePermission("write")}
                      size="sm"
                    >
                      Read & Write
                    </Button>
                  </HStack>
                </FormControl>
              </>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onShareScenarioClose}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={handleShareScenario}>
              Share
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default UserProfile;
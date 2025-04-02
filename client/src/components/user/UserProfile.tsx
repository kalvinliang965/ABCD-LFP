import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
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
  useToast,
} from "@chakra-ui/react";
import { FaUser, FaFileUpload, FaShareAlt, FaEdit, FaTrash, FaFileAlt, FaArrowLeft } from "react-icons/fa";
import { useAuth } from "../../contexts/AuthContext";
import { userService } from '../../services/userService';

// Interface for user data
interface UserData {
  _id?: string;
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
  description?: string;
  createdAt: Date;
  sharedWith: Array<any>;
  data?: any;
  permissions?: string;
}

// Interface for YAML file data
interface YamlFile {
  _id: string;
  name: string;
  content: string;
  createdAt: Date;
}

// API base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const UserProfile: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Replace mock data with state that will be populated from backend
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    profilePicture: '',
    yamlFiles: [] as YamlFile[],
    scenarios: [] as Scenario[]
  });
  
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

  // Add these state variables back
  const [selectedScenarioId, setSelectedScenarioId] = useState<string | null>(null);
  const { isOpen: isEditModalOpen, onOpen: onEditModalOpen, onClose: onEditModalClose } = useDisclosure();
  const [editScenarioName, setEditScenarioName] = useState("");

  // Colors
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const textColor = useColorModeValue("gray.600", "gray.400");

  // Define fetchUserProfile outside useEffect so it can be called elsewhere
  const fetchUserProfile = async () => {
    try {
      setIsLoading(true);
      const profileData = await userService.getProfile();
      
      setUserData({
        name: profileData.name || '',
        email: profileData.email || '',
        profilePicture: profileData.profilePicture || '',
        yamlFiles: profileData.yamlFiles || [],
        scenarios: profileData.scenarios || []
      });
      console.log(profileData);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to load user profile',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Then in your useEffect
  useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
  }, [user, toast]);

  // Handle return to dashboard
  const handleReturnToDashboard = () => {
    navigate('/dashboard');
  };

  // Update your handleSubmit function to save to backend
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      const updatedProfile = await userService.updateProfile({
        name: userData.name,
        email: userData.email,
        profilePicture: userData.profilePicture
      });
      
      // Update local state with response data
      setUserData({
        name: updatedProfile.name,
        email: updatedProfile.email,
        profilePicture: updatedProfile.profilePicture,
        yamlFiles: updatedProfile.yamlFiles,
        scenarios: updatedProfile.scenarios
      });
      
      // Update auth context if needed
      if (updateUser) {
        updateUser(updatedProfile);
      }
      
      setIsEditing(false);
      toast({
        title: 'Profile updated',
        description: 'Your profile has been successfully updated',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to update profile',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle upload YAML
  const handleUploadYaml = async () => {
    if (user && yamlFileName && yamlContent) {
      try {
        const response = await axios.post(`${API_BASE_URL}/api/yaml`, {
          userId: user.googleId,
          filename: yamlFileName,
          content: yamlContent
        }, { withCredentials: true });
        
        // Update the user state with the new YAML files list
        if (response.data.yamlFiles) {
          setUserData({
            ...userData,
            yamlFiles: response.data.yamlFiles
          });
        } else {
          // If the response doesn't include the updated list, fetch user data again
          fetchUserProfile();
        }
        
        setYamlFileName("");
        setYamlContent("");
        onUploadYamlClose();
        
        toast({
          title: "YAML file uploaded",
          description: "Your YAML file has been successfully uploaded.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } catch (err: any) {
        console.error("Error uploading YAML:", err);
        toast({
          title: "Upload failed",
          description: err.response?.data?.message || "Failed to upload YAML file",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    }
  };

  // Handle delete YAML
  const handleDeleteYaml = async (fileId: string) => {
    if (user) {
      try {
        await axios.delete(`${API_BASE_URL}/api/yaml/${fileId}`, {
          data: { userId: user.googleId },
          withCredentials: true
        });
        
        // Update the local state
        setUserData({
          ...userData,
          yamlFiles: userData.yamlFiles.filter(file => file._id !== fileId)
        });
        
        toast({
          title: "YAML file deleted",
          description: "Your YAML file has been successfully deleted.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } catch (err: any) {
        console.error("Error deleting YAML:", err);
        toast({
          title: "Delete failed",
          description: err.response?.data?.message || "Failed to delete YAML file",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    }
  };

  // Handle share scenario
  const handleShareScenario = async () => {
    if (user && selectedScenario && shareEmail) {
      try {
        await axios.post(`${API_BASE_URL}/api/scenarios/share`, {
          userId: user.googleId,
          scenarioId: selectedScenario._id,
          shareWithEmail: shareEmail,
          permission: sharePermission
        }, { withCredentials: true });
        
        // Fetch updated user data to get the latest scenario sharing info
        fetchUserProfile();
        
        setShareEmail("");
        setSharePermission("read");
        onShareScenarioClose();
        
        toast({
          title: "Scenario shared",
          description: `Scenario "${selectedScenario.name}" has been shared with ${shareEmail}.`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } catch (err: any) {
        console.error("Error sharing scenario:", err);
        toast({
          title: "Share failed",
          description: err.response?.data?.message || "Failed to share scenario",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    }
  };

  // Open share scenario modal
  const openShareModal = (scenario: Scenario) => {
    setSelectedScenario(scenario);
    onShareScenarioOpen();
  };

  // Add this function to handle edit button clicks
  const handleEditScenario = (id: string) => {
    // Find the scenario to edit
    const scenarioToEdit = user?.scenarios.find(s => s._id === id);
    if (scenarioToEdit) {
      setSelectedScenarioId(id);
      setEditScenarioName(scenarioToEdit.name);
      onEditModalOpen();
    }
  };

  // Show loading state while fetching user data
  if (isLoading) {
    return (
      <Box p={5} textAlign="center">
        <Text fontSize="xl">Loading profile data...</Text>
      </Box>
    );
  }

  // Show error if there was a problem fetching data
  if (!user) {
    return (
      <Box p={5} textAlign="center">
        <Text fontSize="xl">No profile data available.</Text>
        <Button mt={4} colorScheme="blue" onClick={() => navigate('/login')}>
          Login
        </Button>
      </Box>
    );
  }

  // Render user profile information
  return (
    <Box p={5}>
      {/* Return to Dashboard Button */}
      <Button 
        leftIcon={<FaArrowLeft />} 
        colorScheme="gray" 
        variant="outline" 
        size="sm" 
        mb={4}
        onClick={handleReturnToDashboard}
      >
        Return to Dashboard
      </Button>
      
      {/* Profile Header */}
      <Flex 
        direction={{ base: "column", md: "row" }} 
        align={{ base: "center", md: "flex-start" }}
        justify="space-between"
        mb={8}
        pb={5}
        borderBottom="1px"
        borderColor={borderColor}
      >
        <Flex align="center" mb={{ base: 4, md: 0 }}>
          <Avatar 
            size="xl" 
            name={user.name} 
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`} 
            mr={4} 
          />
          <VStack align="flex-start" spacing={1}>
            <Heading size="lg">{user.name}</Heading>
            <Text color={textColor}>{user.email}</Text>
          </VStack>
        </Flex>
        <HStack spacing={4} mt={{ base: 4, md: 0 }}>
          <Button 
            leftIcon={<FaEdit />} 
            colorScheme="blue" 
            variant="outline"
            onClick={() => {
              setEditName(user.name);
              onEditProfileOpen();
            }}
          >
            Edit Profile
          </Button>
          <Button 
            leftIcon={<FaFileUpload />} 
            colorScheme="green" 
            onClick={onUploadYamlOpen}
          >
            Upload YAML
          </Button>
        </HStack>
      </Flex>

      {/* Tabs for different sections */}
      <Tabs colorScheme="blue" variant="enclosed">
        <TabList>
          <Tab fontSize="lg" fontWeight="medium">My Scenarios</Tab>
          <Tab fontSize="lg" fontWeight="medium">YAML Files</Tab>
          <Tab fontSize="lg" fontWeight="medium">Shared With Me</Tab>
        </TabList>

        <TabPanels>
          {/* My Scenarios Tab */}
          <TabPanel>
            <Heading size="md" mb={4}>My Financial Scenarios</Heading>
            {!user.scenarios || user.scenarios.length === 0 ? (
              <Text>You haven't created any scenarios yet.</Text>
            ) : (
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={5}>
                {user.scenarios.map(scenario => (
                  <Card key={scenario._id} bg={cardBg} shadow="md" borderWidth="1px" borderColor={borderColor}>
                    <CardHeader>
                      <Flex justify="space-between" align="center">
                        <Heading size="sm">{scenario.name}</Heading>
                        <HStack>
                          <IconButton
                            aria-label="Share scenario"
                            icon={<FaShareAlt />}
                            size="sm"
                            colorScheme="blue"
                            variant="ghost"
                            onClick={() => openShareModal(scenario as Scenario)}
                          />
                          <IconButton
                            aria-label="Edit scenario"
                            icon={<FaEdit />}
                            size="sm"
                            colorScheme="green"
                            variant="ghost"
                            onClick={() => handleEditScenario(scenario._id)}
                          />
                        </HStack>
                      </Flex>
                    </CardHeader>
                    <CardBody pt={0}>
                      <Text fontSize="sm" color={textColor} mb={3}>
                        {scenario.description || "No description available"}
                      </Text>
                      
                      {scenario.sharedWith && scenario.sharedWith.length > 0 && (
                        <Box mt={2}>
                          <Text fontSize="xs" fontWeight="bold" mb={1}>
                            Shared with:
                          </Text>
                          {scenario.sharedWith.map(user => (
                            <Badge key={user._id} mr={1} mb={1} colorScheme="purple" fontSize="xs">
                              {user.name || user.email}
                            </Badge>
                          ))}
                        </Box>
                      )}
                    </CardBody>
                  </Card>
                ))}
              </SimpleGrid>
            )}
          </TabPanel>

          {/* YAML Files Tab */}
          <TabPanel>
            <Heading size="md" mb={4}>YAML Files</Heading>
            {!user.yamlFiles || user.yamlFiles.length === 0 ? (
              <Text>You haven't uploaded any YAML files yet.</Text>
            ) : (
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={5}>
                {user.yamlFiles.map(file => (
                  <Card key={file._id} bg={cardBg} shadow="md" borderWidth="1px" borderColor={borderColor}>
                    <CardHeader>
                      <Flex justify="space-between" align="center">
                        <Heading size="sm">{file.name}</Heading>
                        <HStack>
                          <Tooltip label="View Content">
                            <IconButton
                              aria-label="View file"
                              icon={<FaFileAlt />}
                              size="sm"
                              colorScheme="blue"
                              variant="ghost"
                            />
                          </Tooltip>
                          <Tooltip label="Delete File">
                            <IconButton
                              aria-label="Delete file"
                              icon={<FaTrash />}
                              size="sm"
                              colorScheme="red"
                              variant="ghost"
                              onClick={() => handleDeleteYaml(file._id)}
                            />
                          </Tooltip>
                        </HStack>
                      </Flex>
                    </CardHeader>
                    <CardBody pt={0}>
                      <Text fontSize="sm" color={textColor} mb={2}>
                        {file.content.length > 100 
                          ? `${file.content.substring(0, 100)}...` 
                          : file.content}
                      </Text>
                      <Text fontSize="xs" color={textColor} mt={2}>
                        Size: {file.content.length} characters
                      </Text>
                    </CardBody>
                  </Card>
                ))}
              </SimpleGrid>
            )}
          </TabPanel>

          {/* Shared With Me Tab */}
          <TabPanel>
            <Heading size="md" mb={4}>Scenarios Shared With Me</Heading>
            <Text>No scenarios have been shared with you yet.</Text>
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
            <FormControl>
              <FormLabel>Name</FormLabel>
              <Input 
                value={editName} 
                onChange={(e) => setEditName(e.target.value)} 
                placeholder="Enter your name"
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onEditProfileClose}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={handleSubmit}>
              Save
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

      {/* Edit Scenario Modal */}
      <Modal isOpen={isEditModalOpen} onClose={onEditModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Scenario</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text mb={4}>
              The following is the scenario will be implementation:
            </Text>
            <VStack align="start" spacing={2} pl={4}>
              <Text>• Change the scenario name</Text>
              <Text>• Modify financial parameters</Text>
              <Text>• Update investment allocations</Text>
              <Text>• Adjust retirement goals</Text>
            </VStack>
            <FormControl mt={4}>
              <FormLabel>Scenario Name</FormLabel>
              <Input 
                value={editScenarioName}
                onChange={(e) => setEditScenarioName(e.target.value)}
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onEditModalClose}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={onEditModalClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default UserProfile;
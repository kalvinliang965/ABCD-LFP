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
} from '@chakra-ui/react';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { FaArrowLeft, FaEdit, FaShareAlt, FaTimes, FaUser } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../../contexts/AuthContext';
import { API_URL } from '../../services/api';
import { scenario_service } from '../../services/scenarioService';
import { userService } from '../../services/userService';

// Interface for user data
interface UserData {
  _id?: string;
  name: string;
  email: string;
  googleId: string;
  scenarios: Scenario[];
}

// Interface for scenario data
interface Scenario {
  _id: string;
  name: string;
  description?: string;
  createdAt: Date;
  sharedWith: Array<{
    _id: string;
    name?: string;
    email: string;
    permission: 'read' | 'write';
  }>;
  data?: any;
  permissions?: string;
  maritalStatus?: string;
  residenceState?: string;
  ownerId?: string;
  ownerName?: string;
}


// Type declaration for the scenario service with sharing methods
type ScenarioServiceWithSharing = typeof scenario_service & {
  get_shared_with_me_scenarios: () => Promise<any>;
  get_shared_by_me_scenarios: () => Promise<any>;
  share_scenario: (scenarioId: string, shareWithEmail: string, permission: 'read' | 'write') => Promise<any>;
  revoke_access: (scenarioId: string, userId: string) => Promise<any>;
};

// API base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3346';

const UserProfile: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { user, updateUser, isGuestUser } = useAuth();
  
  // Ensure TypeScript recognizes the sharing methods
  const scenarioServiceWithSharing = scenario_service as ScenarioServiceWithSharing;
  
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [scenariosLoading, setScenariosLoading] = useState(false);
  const [userScenarios, setUserScenarios] = useState<Scenario[]>([]);
  const [sharedWithMeScenarios, setSharedWithMeScenarios] = useState<Array<{
    _id: string;
    name: string;
    maritalStatus?: string;
    residenceState?: string;
    createdAt: Date;
    ownerName: string;
    ownerId: string;
    permission: 'read' | 'write';
  }>>([]);

  const [userData, setUserData] = useState({
    name: '',
    email: '',
    profilePicture: '',
    scenarios: [] as Scenario[],
  });

  // Modal states
  const {
    isOpen: isEditProfileOpen,
    onOpen: onEditProfileOpen,
    onClose: onEditProfileClose,
  } = useDisclosure();
  const {
    isOpen: isShareScenarioOpen,
    onOpen: onShareScenarioOpen,
    onClose: onShareScenarioClose,
  } = useDisclosure();

  // Form states
  const [editName, setEditName] = useState<string>('');
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [shareEmail, setShareEmail] = useState<string>('');
  const [sharePermission, setSharePermission] = useState<string>('read');

  // Data for scenarios shared by the user
  const [sharedByMeData, setSharedByMeData] = useState<Record<string, Array<{
    userId: string;
    userName: string;
    email: string;
    permission: 'read' | 'write';
  }>>>({});

  // Colors
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.400');

  // Handle return to dashboard
  const handleReturnToDashboard = () => {
    navigate('/scenarios');
    //http://localhost:5173/scenarios
  };

  // Fetch user scenarios
  const fetchUserScenarios = async () => {
    try {
      setScenariosLoading(true);
      const scenarios = await scenario_service.get_all_scenarios();
      setUserScenarios(scenarios.data);
    } catch (error) {
      console.log('Error fetching user scenarios:', error);
      // toast({
      //   title: 'Error',
      //   description: 'Failed to fetch scenarios',
      //   status: 'error',
      //   duration: 3000,
      //   isClosable: true,
      // });
    } finally {
      setScenariosLoading(false);
    }
  };

  // Fetch scenarios shared with the user
  const fetchSharedWithMeScenarios = async () => {
    try {
      setScenariosLoading(true);
      const response = await scenarioServiceWithSharing.get_shared_with_me_scenarios();
      
      if (response && response.data) {
        // Make sure we have valid data
        const validScenarios = Array.isArray(response.data) ? response.data : [];
        
        // Transform the data if needed to ensure consistent format
        const formattedScenarios = validScenarios.map((scenario: any) => ({
          _id: scenario._id,
          name: scenario.name || 'Unnamed Scenario',
          maritalStatus: scenario.maritalStatus || 'Not specified',
          residenceState: scenario.residenceState || 'Not specified',
          createdAt: scenario.createdAt || new Date(),
          ownerName: scenario.ownerName || 'Unknown',
          ownerId: scenario.ownerId || '',
          // Handle different possible property names for permissions
          permission: scenario.permission || scenario.permissions || 'read'
        }));
        
        setSharedWithMeScenarios(formattedScenarios);
      } else {
        setSharedWithMeScenarios([]);
      }
    } catch (error) {
      console.log('Error fetching shared scenarios:', error);
      // toast({
      //   title: 'Error',
      //   description: 'Failed to fetch scenarios shared with you',
      //   status: 'error',
      //   duration: 3000,
      //   isClosable: true,
      // });
      setSharedWithMeScenarios([]);
    } finally {
      setScenariosLoading(false);
    }
  };
  
  // Revoke access to a scenario
  const handleRevokeAccess = async (scenarioId: string, userId: string) => {
    try {
      await scenarioServiceWithSharing.revoke_access(scenarioId, userId);
      
      // Refresh the scenario lists
      fetchUserScenarios();
      //fetchSharedByMeScenarios();
      
      toast({
        title: 'Access revoked',
        description: 'User access has been removed',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.log('Error revoking access:', error);
      toast({
        // title: 'Error',
        // description: 'Failed to revoke access',
        // status: 'error',
        // duration: 3000,
        // isClosable: true,
      });
    }
  };
  
  // Navigate to a scenario with appropriate permissions
  const navigateToScenario = (scenarioId: string, canEdit: boolean) => {
    if (canEdit) {
      navigate(`/scenarios/edit/${scenarioId}`);
    } else {
      navigate(`/scenarios/${scenarioId}`, { 
        state: { 
          mode: 'view' 
        }
      });
    }
  };

  // Fetch user profile data
  const fetchUserProfile = async () => {
    try {
      setIsLoading(true);

      // For guest users, just use guest name and email
      // if (isGuestUser) {
      //   setUserData({
      //     name: 'Guest',
      //     email: '',
      //     profilePicture: '',
      //     scenarios: user?.scenarios || [],
      //   });
      //   setIsLoading(false);
      //   return;
      // }

      // Try to get user data from the API directly
      const token = localStorage.getItem('token');
      let profileData;

      if (token) {
        // If we have a token, use it to fetch user data
        const response = await axios.get(`${API_URL}/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        profileData = response.data;
      } else {
        // Otherwise try to use the userService (which might use cookies)
        profileData = await userService.getProfile();
      }

      if (profileData) {
        // If the user is a guest, override the display name and email
        if (profileData.isGuest) {
          setUserData({
            name: 'Guest',
            email: '',
            profilePicture: profileData.profilePicture || '',
            scenarios: profileData.scenarios || [],
          });
        } else {
          setUserData({
            name: profileData.name || '',
            email: profileData.email || '',
            profilePicture: profileData.profilePicture || '',
            scenarios: profileData.scenarios || [],
          });
        }

        // Update the auth context if needed
        if (updateUser && !user) {
          updateUser(profileData);
        }
      }
    } catch (error) {
      console.log('Error fetching user profile:', error);
      // toast({
      //   title: 'Error',
      //   description: 'Failed to load user profile',
      //   status: 'error',
      //   duration: 5000,
      //   isClosable: true,
      // });
    } finally {
      setIsLoading(false);
    }
  };


  // Helper function to determine if a user has write permission
  const hasWritePermission = (permission: string | undefined): boolean => {
    if (!permission) return false;
    
    // Normalize the permission string to handle different formats
    const normalizedPermission = permission.toLowerCase();
    
    // Check for various ways "write" permission might be represented
    return normalizedPermission === 'write' || 
           normalizedPermission === 'edit' ||
           normalizedPermission === 'readwrite' ||
           normalizedPermission === 'read & write' ||
           normalizedPermission === 'read-write';
  };

  // Handle profile update form submission
  const handleSubmit = async () => {
    try {
      setIsLoading(true);

      // Use the editName value from the modal
      const updatedProfile = await userService.updateProfile({
        name: editName,
        email: userData.email,
        profilePicture: userData.profilePicture,
      });

      // Update local state with response data
      setUserData({
        name: updatedProfile.name,
        email: updatedProfile.email,
        profilePicture: updatedProfile.profilePicture,
        scenarios: updatedProfile.scenarios,
      });

      // Update auth context if needed
      if (updateUser) {
        updateUser(updatedProfile);
      }

      // Close the modal
      onEditProfileClose();

      toast({
        title: 'Profile updated',
        description: 'Your profile has been successfully updated',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      navigate('/scenarios');
    } catch (error) {
      console.log('Error updating profile:', error);
      // toast({
      //   title: 'Error',
      //   description: 'Failed to update profile',
      //   status: 'error',
      //   duration: 5000,
      //   isClosable: true,
      // });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle sharing a scenario with another user
  const handleShareScenario = async () => {
    if (selectedScenario && shareEmail) {
      try {
        await scenarioServiceWithSharing.share_scenario(
          selectedScenario._id,
          shareEmail,
          sharePermission as 'read' | 'write'
        );

        // Fetch updated scenarios to get the latest sharing info
        fetchUserScenarios();
        //fetchSharedByMeScenarios();

        setShareEmail('');
        setSharePermission('read');
        onShareScenarioClose();

        toast({
          title: 'Scenario shared',
          description: `Scenario "${selectedScenario.name}" has been shared with ${shareEmail}.`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } catch (err: any) {
        console.log('Error sharing scenario:', err);
        // toast({
        //   title: 'Share failed',
        //   description: err.response?.data?.message || 'Failed to share scenario',
        //   status: 'error',
        //   duration: 3000,
        //   isClosable: true,
        // });
      }
    }
  };

  // Open share scenario modal
  const openShareModal = (scenario: Scenario) => {
    setSelectedScenario(scenario);
    onShareScenarioOpen();
  };

  // Handle editing a scenario
  const handleEditScenario = (id: string) => {
    navigate(`/scenarios/edit/${id}`);
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchUserProfile();
    fetchUserScenarios();
    fetchSharedWithMeScenarios();
    //fetchSharedByMeScenarios();
  }, [toast]);

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
        onClick={() => navigate('/scenarios')}
      >
        Return to Dashboard
      </Button>

      {/* Profile Header */}
      <Flex
        direction={{ base: 'column', md: 'row' }}
        align={{ base: 'center', md: 'flex-start' }}
        justify="space-between"
        mb={8}
        pb={5}
        borderBottom="1px"
        borderColor={borderColor}
      >
        <Flex align="center" mb={{ base: 4, md: 0 }}>
          <Avatar
            size="xl"
            name={userData.name}
            src={userData.profilePicture}
            mr={4}
            icon={<FaUser fontSize="2rem" />}
          />
          <VStack align="flex-start" spacing={1}>
            <Heading size="xl">{userData.name}</Heading>
            <Text fontSize="lg" color={textColor}>
              {userData.email}
            </Text>
            {user?.isGuest && (
              <Badge colorScheme="orange">Guest User</Badge>
            )}
          </VStack>
        </Flex>
        <HStack spacing={4} mt={{ base: 4, md: 0 }}>
          <Button
            leftIcon={<FaEdit />}
            colorScheme="blue"
            variant="outline"
            size="lg"
            onClick={() => {
              setEditName(userData.name);
              onEditProfileOpen();
            }}
          >
            Edit Profile
          </Button>
        </HStack>
      </Flex>

      {/* Tabs for different sections */}
      <Tabs colorScheme="blue" variant="enclosed">
        <TabList>
          <Tab fontSize="xl" fontWeight="semibold" py={4} px={6}>
            My Scenarios
          </Tab>
          <Tab fontSize="xl" fontWeight="semibold" py={4} px={6}>
            Shared With Me
          </Tab>
        </TabList>

        <TabPanels>
          {/* My Scenarios Tab */}
          <TabPanel>
            <Heading size="lg" mb={5}>
              My Financial Scenarios
            </Heading>
            {scenariosLoading ? (
              <Text>Loading scenarios...</Text>
            ) : !userScenarios || userScenarios.length === 0 ? (
              <Text>You haven't created any scenarios yet.</Text>
            ) : (
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={5}>
                {userScenarios.map(scenario => (
                  <Card
                    key={scenario._id}
                    bg={cardBg}
                    shadow="md"
                    borderWidth="1px"
                    borderColor={borderColor}
                  >
                    <CardHeader>
                      <Flex justify="space-between" align="center">
                        <Heading size="md">{scenario.name}</Heading>
                        <HStack>
                          <IconButton
                            aria-label="Edit scenario"
                            icon={<FaEdit />}
                            size="sm"
                            colorScheme="green"
                            variant="ghost"
                            onClick={() => handleEditScenario(scenario._id)}
                          />
                          <IconButton
                            aria-label="Share scenario"
                            icon={<FaShareAlt />}
                            size="sm"
                            colorScheme="blue"
                            variant="ghost"
                            onClick={() => openShareModal(scenario as Scenario)}
                          />
                        </HStack>
                      </Flex>
                    </CardHeader>
                    <CardBody pt={0}>
                      <Text fontSize="md" color={textColor} mb={3}>
                        Marital Status: {scenario.maritalStatus || scenario.data?.maritalStatus || scenario.data?.personal?.maritalStatus || 'Not specified'}
                      </Text>
                      <Text fontSize="md" color={textColor} mb={3}>
                        State: {scenario.residenceState || scenario.data?.residenceState || scenario.data?.personal?.residenceState || 'Not specified'}
                      </Text>

                      <Text fontSize="sm" color={textColor} mb={2}>
                        Created: {new Date(scenario.createdAt).toLocaleDateString()}
                      </Text>

                      {/* Show shared users from our sharedByMeData */}
                      {sharedByMeData[scenario._id] && sharedByMeData[scenario._id].length > 0 && (
                        <Box mt={2}>
                          <Text fontSize="xs" fontWeight="bold" mb={1}>
                            Shared with:
                          </Text>
                          {sharedByMeData[scenario._id].map(user => (
                            <Badge 
                              key={user.userId} 
                              mr={1} mb={1} 
                              colorScheme={hasWritePermission(user.permission) ? 'green' : 'purple'} 
                              fontSize="sm"
                            >
                              {user.userName} ({hasWritePermission(user.permission) ? 'Edit' : 'View'})
                              <IconButton
                                aria-label="Remove sharing"
                                icon={<FaTimes />}
                                size="xs"
                                ml={1}
                                onClick={() => handleRevokeAccess(scenario._id, user.userId)}
                              />
                            </Badge>
                          ))}
                        </Box>
                      )}

                      <Button 
                        size="sm" 
                        colorScheme="blue" 
                        mt={3}
                        onClick={() => handleEditScenario(scenario._id)}
                      >
                        Edit Scenario
                      </Button>
                    </CardBody>
                  </Card>
                ))}
              </SimpleGrid>
            )}
          </TabPanel>

          {/* Shared With Me Tab */}
          <TabPanel>
            <Flex justify="space-between" align="center" mb={5}>
              <Heading size="lg">
                Scenarios Shared With Me
              </Heading>
            </Flex>
            
            {scenariosLoading ? (
              <Text>Loading shared scenarios...</Text>
            ) : !sharedWithMeScenarios || sharedWithMeScenarios.length === 0 ? (
              <Text>No scenarios have been shared with you yet.</Text>
            ) : (
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={5}>
                {sharedWithMeScenarios.map(scenario => (
                  <Card
                    key={scenario._id}
                    bg={cardBg}
                    shadow="md"
                    borderWidth="1px"
                    borderColor={borderColor}
                  >
                    <CardHeader>
                      <Flex justify="space-between" align="center">
                        <Heading size="md">{scenario.name || 'Unnamed Scenario'}</Heading>
                        <Badge colorScheme={hasWritePermission(scenario.permission) ? 'green' : 'purple'}>
                          {hasWritePermission(scenario.permission) ? 'Can Edit' : 'View Only'}
                        </Badge>
                      </Flex>
                    </CardHeader>
                    <CardBody pt={0}>
                      <Text fontSize="md" color={textColor} mb={3}>
                        <strong>Shared by:</strong> {scenario.ownerName || 'Unknown'}
                      </Text>
                      <Text fontSize="md" color={textColor} mb={3}>
                        Marital Status: {scenario.maritalStatus || 'Not specified'}
                      </Text>
                      <Text fontSize="md" color={textColor} mb={3}>
                        State: {scenario.residenceState || 'Not specified'}
                      </Text>
                      <Text fontSize="sm" color={textColor} mb={2}>
                        Created: {new Date(scenario.createdAt || new Date()).toLocaleDateString()}
                      </Text>
                      <Button 
                        size="sm" 
                        colorScheme={hasWritePermission(scenario.permission) ? "green" : "blue"}
                        mt={3}
                        onClick={() => navigateToScenario(scenario._id, hasWritePermission(scenario.permission))}
                      >
                        {hasWritePermission(scenario.permission) ? "Edit Scenario" : "View Scenario"}
                      </Button>
                    </CardBody>
                  </Card>
                ))}
              </SimpleGrid>
            )}
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
                onChange={e => setEditName(e.target.value)}
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

      {/* Share Scenario Modal */}
      <Modal isOpen={isShareScenarioOpen} onClose={onShareScenarioClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Share Scenario</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedScenario && (
              <>
                <Text mb={4}>Share "{selectedScenario.name}" with another user:</Text>
                <FormControl mb={4}>
                  <FormLabel>User Email</FormLabel>
                  <Input
                    value={shareEmail}
                    onChange={e => setShareEmail(e.target.value)}
                    placeholder="Enter email address"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Permission</FormLabel>
                  <HStack spacing={4}>
                    <Button
                      variant={sharePermission === 'read' ? 'solid' : 'outline'}
                      colorScheme="blue"
                      onClick={() => setSharePermission('read')}
                      size="sm"
                    >
                      Read Only
                    </Button>
                    <Button
                      variant={sharePermission === 'write' ? 'solid' : 'outline'}
                      colorScheme="green"
                      onClick={() => setSharePermission('write')}
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
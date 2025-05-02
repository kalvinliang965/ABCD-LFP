// AI-generated code
// Create a detailed page for viewing scenario details with edit and delete functionality

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Heading,
  Flex,
  Spinner,
  useToast,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
} from '@chakra-ui/react';

import scenario_service from '../../services/scenarioService';
import { ScenarioRaw } from '../../types/Scenarios';
import ScenarioDetailCard from '../../components/scenarios/ScenarioDetailCard';
import { Layout } from '../../layouts';

const ScenarioDetailPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [scenario, set_scenario] = useState<ScenarioRaw | null>(null);
  const [loading, set_loading] = useState<boolean>(true);
  const [error, set_error] = useState<string | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    const fetch_scenario = async () => {
      set_loading(true);
      try {
        if (!id) {
          throw new Error('Scenario ID is missing');
        }

        const response = await scenario_service.get_scenario_by_id(id);

        if (!response || !response.data) {
          throw new Error('Failed to fetch scenario');
        }

        set_scenario(response.data);
        set_error(null);
      } catch (err) {
        console.error('Error fetching scenario:', err);
        set_error(err instanceof Error ? err.message : 'Failed to load scenario');
      } finally {
        set_loading(false);
      }
    };

    fetch_scenario();
  }, [id]);

  const handle_edit = () => {
    if (scenario) {
      // Navigate to edit page with the scenario ID
      const scenario_id = (scenario as any)._id || id;
      navigate(`/scenarios/${scenario_id}/edit`);
    }
  };

  const handle_delete = () => {
    // Open confirmation modal
    onOpen();
  };

  const confirm_delete = async () => {
    try {
      if (!id) return;

      await scenario_service.delete_scenario(id);

      toast({
        title: 'Scenario deleted',
        description: 'The scenario has been successfully deleted',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      onClose();
      // Navigate back to scenarios list
      navigate('/scenarios');
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to delete scenario',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Layout title="Scenario Details">
      <Container maxW="container.xl" py={8}>
        <Flex direction="column" gap={6}>
          {loading ? (
            <Flex justify="center" align="center" h="200px">
              <Spinner size="xl" color="blue.500" />
            </Flex>
          ) : error ? (
            <Alert status="error" borderRadius="md">
              <AlertIcon />
              <AlertTitle mr={2}>Error!</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : scenario ? (
            <ScenarioDetailCard
              scenario={scenario}
              onEdit={handle_edit}
              onDelete={handle_delete}
              hideFooter={false}
            />
          ) : (
            <Alert status="warning" borderRadius="md">
              <AlertIcon />
              <AlertTitle mr={2}>No Data</AlertTitle>
              <AlertDescription>Scenario not found</AlertDescription>
            </Alert>
          )}
        </Flex>
      </Container>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Confirm Deletion</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            Are you sure you want to delete this scenario? This action cannot be undone.
          </ModalBody>
          <ModalFooter>
            <Button mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="red" onClick={confirm_delete}>
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Layout>
  );
};

export default ScenarioDetailPage;

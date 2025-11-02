import { Box, VStack, Text, Button, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton, FormControl, FormLabel, Input, useToast, Flex, Icon, Badge, Tooltip, Avatar } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { FiLogOut, FiPlus, FiUsers } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Sidebar = ({ socket, setSelectedGroup, fetchGroup, fetchGroupById, groups, userGroups }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDescription, setNewGroupDescription] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  const userInfo = JSON.parse(localStorage.getItem("userInfo") || {});

  // check if the user is admin
  const checkAdminStatus = () => {
    setIsAdmin(userInfo?.isAdmin || false);
  };

  // create group
  const handleCreateGroup = async () => {
    try {
      const token = userInfo?.token || "";

      await axios.post(
        import.meta.env.VITE_DOMAIN + "/api/groups/",
        {
          name: newGroupName,
          description: newGroupDescription,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast({
        title: "Group created",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });

      onClose();
      fetchGroup();
      setNewGroupName("");
      setNewGroupDescription("");
    } catch (error) {
      console.log(error);

      toast({
        title: "Error creating group",
        description: error?.response?.data?.message || "An error occurred",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
    }
  };

  // join group
  const handleJoinGroup = async (groupId, groupName, adminId) => {
    try {
      const token = userInfo?.token || "";

      await axios.post(
        import.meta.env.VITE_DOMAIN + `/api/groups/${groupId}/join`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      await fetchGroup();

      socket.emit("request send", { adminId, groupName });

      toast({
        title: "Request send successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
    } catch (error) {
      console.log(error);

      toast({
        title: "Error joining group",
        description: error?.response?.data?.message || "An error occurred",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
    }
  };

  // leave group
  const handleLeaveGroup = async (groupId) => {
    try {
      const token = userInfo?.token || "";

      await axios.post(
        import.meta.env.VITE_DOMAIN + `/api/groups/${groupId}/leave`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      await fetchGroup();
      setSelectedGroup(null);

      toast({
        title: "Joined left successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
    } catch (error) {
      console.log(error);

      toast({
        title: "Error leaving group",
        description: error?.response?.data?.message || "An error occurred",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
    }
  };

  // logout
  const handleLogout = () => {
    localStorage.removeItem("userInfo");
    navigate("/login");
  };

  useEffect(() => {
    checkAdminStatus();
    fetchGroup();
  }, []);

  return (
    <Box h="100%" bg="white" borderRight="1px" borderColor="gray.200" width="300px" display="flex" flexDirection="column">
      <Flex p={4} gap={4} align="center">
        <Avatar size="xs" name={userInfo?.username} />
        <Text fontSize="l" fontWeight="bold" color="gray.800">
          {userInfo?.username}
        </Text>
      </Flex>
      <Flex p={4} borderBottom="1px solid" borderColor="gray.200" bg="white" position="sticky" top={0} zIndex={1} backdropFilter="blur(8px)" align="center" justify="space-between">
        <Flex align="center">
          <Icon as={FiUsers} fontSize="24px" color="blue.500" mr={2} />
          <Text fontSize="xl" fontWeight="bold" color="gray.800">
            Groups
          </Text>
        </Flex>
        {isAdmin && (
          <Tooltip label="Create New Group" placement="right">
            <Button size="sm" colorScheme="blue" variant="ghost" onClick={onOpen} borderRadius="full">
              <Icon as={FiPlus} fontSize="20px" />
            </Button>
          </Tooltip>
        )}
      </Flex>

      <Box flex="1" overflowY="auto" p={4} mb={16}>
        <VStack spacing={3} align="stretch">
          {groups.map((group) => (
            <Box
              key={group._id}
              p={4}
              cursor="pointer"
              borderRadius="lg"
              bg={userGroups?.includes(group?._id) ? "blue.50" : "gray.50"}
              borderWidth="1px"
              borderColor={userGroups?.includes(group?._id) ? "blue.200" : "gray.200"}
              transition="all 0.2s"
              _hover={{
                transform: "translateY(-2px)",
                shadow: "md",
                borderColor: "blue.300",
              }}
            >
              <Flex justify="space-between" align="center">
                <Box onClick={() => fetchGroupById(group?._id)} flex="1">
                  <Flex align="center" mb={2}>
                    <Text fontWeight="bold" color="gray.800">
                      {group.name}
                    </Text>
                    {userGroups?.includes(group?._id) && (
                      <Badge ml={2} colorScheme="blue" variant="subtle">
                        Joined
                      </Badge>
                    )}
                  </Flex>
                  <Text fontSize="sm" color="gray.600" noOfLines={2}>
                    {group.description}
                  </Text>
                </Box>
                {group?.newMembers?.some((member) => member._id === userInfo?.id) ? (
                  <Button
                    size="sm"
                    colorScheme={userGroups?.includes(group?._id) ? "red" : "blue"}
                    variant={userGroups?.includes(group?._id) ? "ghost" : "solid"}
                    ml={3}
                    _hover={{
                      transform: userGroups?.includes(group?._id) ? "scale(1.05)" : "none",
                      bg: userGroups?.includes(group?._id) ? "red.50" : "blue.600",
                    }}
                    transition="all 0.2s"
                  >
                    Requested
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    colorScheme={userGroups?.includes(group?._id) ? "red" : "blue"}
                    variant={userGroups?.includes(group?._id) ? "ghost" : "solid"}
                    ml={3}
                    _hover={{
                      transform: userGroups?.includes(group?._id) ? "scale(1.05)" : "none",
                      bg: userGroups?.includes(group?._id) ? "red.50" : "blue.600",
                    }}
                    transition="all 0.2s"
                    onClick={() => {
                      userGroups?.includes(group?._id) ? handleLeaveGroup(group?._id) : handleJoinGroup(group?._id, group.name, group?.admin?._id);
                    }}
                  >
                    {userGroups?.includes(group?._id) ? (
                      <Text fontSize="sm" fontWeight="medium">
                        Leave
                      </Text>
                    ) : (
                      "Join"
                    )}
                  </Button>
                )}
              </Flex>
            </Box>
          ))}
        </VStack>
      </Box>

      <Box p={4} borderTop="1px solid" borderColor="gray.200" bg="gray.50" position="absolute" bottom={0} left={0} right={0} width="100%">
        <Button
          variant="ghost"
          colorScheme="red"
          leftIcon={<Icon as={FiLogOut} />}
          _hover={{
            bg: "red.50",
            transform: "translateY(-2px)",
            shadow: "md",
          }}
          transition="all 0.2s"
          onClick={handleLogout}
        >
          Logout
        </Button>
      </Box>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent>
          <ModalHeader>Create New Group</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl>
              <FormLabel>Group Name</FormLabel>
              <Input value={newGroupName} onChange={(e) => setNewGroupName(e.target.value)} placeholder="Enter group name" focusBorderColor="blue.400" />
            </FormControl>

            <FormControl mt={4}>
              <FormLabel>Description</FormLabel>
              <Input value={newGroupDescription} onChange={(e) => setNewGroupDescription(e.target.value)} placeholder="Enter group description" focusBorderColor="blue.400" />
            </FormControl>

            <Button colorScheme="blue" mr={3} mt={4} width="full" onClick={handleCreateGroup}>
              Create Group
            </Button>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Sidebar;

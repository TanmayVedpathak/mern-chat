import { Box, VStack, Text, Badge, Flex, Icon, Tooltip, Avatar, IconButton } from "@chakra-ui/react";
import { FiUsers, FiCircle, FiCheck, FiX } from "react-icons/fi";

const UsersList = ({ users, selectedGroup, handleAccept, handleReject }) => {
  const currentUser = JSON.parse(localStorage.getItem("userInfo") || {});

  return (
    <Box h="100%" w="100%" borderLeft="1px solid" borderColor="gray.200" bg="white" position="relative" overflow="hidden">
      {/* Header */}
      <Flex p={5} borderBottom="1px solid" borderColor="gray.200" bg="white" align="center" position="sticky" top={0} zIndex={1} boxShadow="sm">
        <Icon as={FiUsers} fontSize="20px" color="blue.500" mr={2} />
        <Text fontSize="lg" fontWeight="bold" color="gray.700">
          Members
        </Text>
        <Badge ml={2} colorScheme="blue" borderRadius="full" px={2} py={0.5} fontSize="xs">
          {users.length}
        </Badge>
      </Flex>

      {/* Users List */}
      <Box flex="1" overflowY="auto" p={4}>
        <VStack align="stretch" spacing={3}>
          {users.map((user) => (
            <Box key={user.id}>
              <Tooltip label={`${user.username} is online`} placement="left">
                <Flex p={3} bg="white" borderRadius="lg" shadow="sm" align="center" borderWidth="1px" borderColor="gray.100">
                  <Avatar size="sm" name={user.username} bg="blue.500" color="white" mr={3} />
                  <Box flex="1">
                    <Text fontSize="sm" fontWeight="medium" color="gray.700" noOfLines={1}>
                      {user.username}
                    </Text>
                  </Box>
                  <Flex align="center" bg="green.50" px={2} py={1} borderRadius="full">
                    <Icon as={FiCircle} color="green.400" fontSize="8px" mr={1} />
                    <Text fontSize="xs" color="green.600" fontWeight="medium">
                      online
                    </Text>
                  </Flex>
                </Flex>
              </Tooltip>
            </Box>
          ))}

          {selectedGroup?.admin?._id.toString() === currentUser?.id.toString() && selectedGroup?.newMembers?.length && (
            <>
              <Text fontSize="lg" fontWeight="medium">
                Requested Members List
              </Text>

              {selectedGroup?.newMembers?.map((user) => (
                <Box key={user._id}>
                  <Tooltip label={user.username} placement="left">
                    <Flex p={3} bg="white" borderRadius="lg" shadow="sm" align="center" borderWidth="1px" borderColor="gray.100">
                      <Avatar size="sm" name={user.username} bg="blue.500" color="white" mr={3} />

                      <Box flex="1">
                        <Text fontSize="sm" fontWeight="medium" color="gray.700" noOfLines={1}>
                          {user.username}
                        </Text>
                      </Box>

                      <Flex gap={1}>
                        <IconButton icon={<FiCheck />} colorScheme="green" variant="ghost" size="sm" aria-label="Accept Request" onClick={() => handleAccept(user._id)} />
                        <IconButton icon={<FiX />} colorScheme="red" variant="ghost" size="sm" aria-label="Reject Request" onClick={() => handleReject(user._id)} />
                      </Flex>
                    </Flex>
                  </Tooltip>
                </Box>
              ))}
            </>
          )}
        </VStack>
      </Box>
    </Box>
  );
};

export default UsersList;

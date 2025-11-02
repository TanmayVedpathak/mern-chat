import { Box, VStack, Text, Input, Button, Flex, Icon, Avatar, InputGroup, InputRightElement, useToast } from "@chakra-ui/react";
import { FiSend, FiInfo, FiMessageCircle } from "react-icons/fi";
import { MdDelete } from "react-icons/md";
import UsersList from "./UsersList";
import React, { useEffect, useRef, useState } from "react";
import axios from "axios";

const ChatArea = ({ socket, selectedGroup, setSelectedGroup, fetchGroup }) => {
  let lastDate = null;

  const [newMessages, setNewMessages] = useState("");
  const [messages, setMessages] = useState([]);
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const messagesEndRef = useRef(null);
  const typingTimeOutRef = useRef(null);
  const toast = useToast();
  const currentUser = JSON.parse(localStorage.getItem("userInfo") || {});

  // fetch messages
  const fetchMessages = async () => {
    try {
      const token = currentUser?.token;

      const { data } = await axios.get(import.meta.env.VITE_DOMAIN + `/api/messages/${selectedGroup?._id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setMessages(data?.messages);
    } catch (error) {
      console.log(error);
    }
  };

  // send message
  const sendMessages = async () => {
    try {
      if (!newMessages.trim()) {
        return;
      }
      const token = currentUser?.token;

      const { data } = await axios.post(
        import.meta.env.VITE_DOMAIN + "/api/messages/",
        {
          content: newMessages,
          groupId: selectedGroup?._id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      socket.emit("new message", { ...data?.populatedMessage, groupId: selectedGroup?._id });

      setMessages([...messages, data?.populatedMessage]);
      setNewMessages("");
    } catch (error) {
      console.log(error);
      toast({
        title: "Error sending message",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
    }
  };

  // handle typing
  const handleTyping = (e) => {
    setNewMessages(e.target.value);

    if (!isTyping && selectedGroup) {
      setIsTyping(true);
      socket.emit("typing", { groupId: selectedGroup?._id, username: currentUser?.username });
    }

    if (typingTimeOutRef.current) {
      clearTimeout(typingTimeOutRef.current);
    }

    typingTimeOutRef.current = setTimeout(() => {
      if (selectedGroup) {
        socket.emit("stop typing", { groupId: selectedGroup?._id });
      }
      setIsTyping(true);
    }, 2000);
  };

  const handleAccept = async (userId) => {
    try {
      const token = currentUser?.token;

      const { data } = await axios.post(
        import.meta.env.VITE_DOMAIN + `/api/groups/${selectedGroup?._id}/accept`,
        { userId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast({
        title: "Request accept successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });

      socket.emit("request accept", {
        recipientId: userId,
        group: selectedGroup,
      });

      setSelectedGroup(data?.group);
    } catch (error) {
      console.log(error);
      toast({
        title: "Error sending message",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
    }
  };

  const handleReject = async (userId) => {
    try {
      const token = currentUser?.token;

      const { data } = await axios.post(
        import.meta.env.VITE_DOMAIN + `/api/groups/${selectedGroup?._id}/reject`,
        { userId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast({
        title: "Request reject successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });

      socket.emit("request reject", {
        recipientId: userId,
        group: selectedGroup,
      });

      setSelectedGroup(data?.group);
    } catch (error) {
      console.log(error);
      toast({
        title: "Error sending message",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
    }
  };

  const handleGroupDelete = async () => {
    try {
      const token = currentUser?.token;

      await axios.post(
        import.meta.env.VITE_DOMAIN + `/api/groups/${selectedGroup?._id}/delete`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      socket.emit("delete group", {
        groupId: selectedGroup?._id,
        deletedBy: currentUser,
      });

      toast({
        title: "Group Deleted",
        description: "Group deleted successfully.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      setSelectedGroup(null);
      fetchGroup();
    } catch (error) {
      console.log(error);
      toast({
        title: "Error deleting group",
        description: error.response.data.message || "An error occur",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
    }
  };

  // format time
  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === yesterday.toDateString()) return "Yesterday";

    return date.toDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
    });
  };

  // render typing indicator
  const renderTypingIndicator = () => {
    if (typingUsers.size === 0) return null;
    const typingUsersArray = Array.from(typingUsers);

    return typingUsersArray?.map((username) => (
      <Box key={username} alignSelf={username === currentUser?.username ? "flex-start" : "flex-end"} maxW="70%">
        <Flex align="center" bg={username === currentUser?.username ? "blue.50" : "gray.50"} p={2} borderRadius="lg" gap={2}>
          {username === currentUser?.username ? (
            <>
              <Avatar size="xs" name={username} />
              <Flex align="center" gap={1}>
                <Text fontSize="sm" color="gray.500" fontStyle="italic">
                  You are typing
                </Text>
                <Flex gap={1}>
                  {[1, 2, 3].map((dot) => (
                    <Box key={dot} w="3px" h="3px" borderRadius="full" bg="gray.500" />
                  ))}
                </Flex>
              </Flex>
            </>
          ) : (
            <>
              <Flex align="center" gap={1}>
                <Text fontSize="sm" color="gray.500" fontStyle="italic">
                  {username} is typing
                </Text>
                <Flex gap={1}>
                  {[1, 2, 3].map((dot) => (
                    <Box key={dot} w="3px" h="3px" borderRadius="full" bg="gray.500" />
                  ))}
                </Flex>
              </Flex>
              <Avatar size="xs" name={username} />
            </>
          )}
        </Flex>
      </Box>
    ));
  };

  useEffect(() => {
    if (selectedGroup && socket) {
      fetchMessages();
      socket.emit("join room", selectedGroup?._id);

      socket.on("message received", (newMessage) => {
        setMessages((prev) => [...prev, newMessage]);
      });

      socket.on("users in room", (users) => {
        setConnectedUsers(users);
      });

      socket.on("user joined", (user) => {
        setConnectedUsers((prev) => [...prev, user]);
      });

      socket.on("user left", (userId) => {
        setConnectedUsers((prev) => prev.filter((user) => user?._id !== userId));
      });

      socket.on("notification", (notification) => {
        toast({
          title: notification?.type === "USER_JOINED" ? "New User" : "Notification",
          description: notification.message,
          status: "info",
          duration: 3000,
          isClosable: true,
          position: "top-right",
        });
      });

      socket.on("user typing", ({ username }) => {
        setTypingUsers((prev) => new Set(prev).add(username));
      });

      socket.on("user stop typing", ({ username }) => {
        setTypingUsers((prev) => {
          const newSet = new Set(prev);
          newSet.delete(username);
          return newSet;
        });
      });

      socket.on("group deleted", (data) => {
        console.log(data);
        toast({
          title: "Group Deleted",
          description: data.message,
          status: "warning",
          duration: 4000,
          isClosable: true,
          position: "top-right",
        });

        if (selectedGroup?._id === data.groupId) {
          setSelectedGroup(null);
          setMessages([]);
        }

        fetchGroup();
      });
      //clean up
      return () => {
        socket.emit("leave room", selectedGroup?._id);
        socket.off("message received");
        socket.off("users in room");
        socket.off("user joined");
        socket.off("user left");
        socket.off("notification");
        socket.off("user typing");
        socket.off("user stop typing");
        socket.off("group deleted");
      };
    }

    if (socket) {
      socket.on("request sended", (data) => {
        toast({
          title: "Request received",
          description: data.message,
          status: "info",
          duration: 3000,
          isClosable: true,
          position: "top-right",
        });

        fetchGroup();
      });

      socket.on("request accepted", (data) => {
        toast({
          title: "Request Accepted",
          description: data.message,
          status: "success",
          duration: 3000,
          isClosable: true,
          position: "top-right",
        });

        fetchGroup();
      });

      socket.on("request rejected", (data) => {
        toast({
          title: "Request Rejected",
          description: data.message,
          status: "success",
          duration: 3000,
          isClosable: true,
          position: "top-right",
        });

        fetchGroup();
      });

      socket.on("notification", (notification) => {
        if (notification.type === "GROUP_DELETED") {
          fetchGroup();
        }
      });

      //clean up
      return () => {
        socket.off("request accepted");
        socket.off("request rejected");
      };
    }
  }, [selectedGroup, socket]);

  return (
    <Flex h="100%" position="relative">
      <Box flex="1" display="flex" flexDirection="column" bg="gray.50" maxW={`calc(100% - 260px)`}>
        {selectedGroup ? (
          <>
            {/* Chat Header */}
            <Flex px={6} py={4} bg="white" borderBottom="1px solid" borderColor="gray.200" align="center" boxShadow="sm">
              <Button display={{ base: "inline-flex", md: "none" }} variant="ghost" mr={2} onClick={() => setSelectedGroup(null)}>
                ←
              </Button>
              <Icon as={FiMessageCircle} fontSize="24px" color="blue.500" mr={3} />
              <Box flex="1">
                <Text fontSize="lg" fontWeight="bold" color="gray.800">
                  {selectedGroup?.name}
                </Text>
                <Text fontSize="sm" color="gray.500">
                  {selectedGroup?.description}
                </Text>
              </Box>
              <Icon as={MdDelete} fontSize="20px" color="red.400" cursor="pointer" _hover={{ color: "red.500" }} onClick={handleGroupDelete} />
            </Flex>

            {/* Messages Area */}
            <VStack
              flex="1"
              overflowY="auto"
              spacing={4}
              align="stretch"
              px={6}
              py={4}
              position="relative"
              sx={{
                "&::-webkit-scrollbar": {
                  width: "8px",
                },
                "&::-webkit-scrollbar-track": {
                  width: "10px",
                },
                "&::-webkit-scrollbar-thumb": {
                  background: "gray.200",
                  borderRadius: "24px",
                },
              }}
            >
              {messages?.map((message) => {
                const dateLabel = formatDate(message?.createdAt);
                const showDate = lastDate !== dateLabel;
                lastDate = dateLabel;

                return (
                  <React.Fragment key={message._id}>
                    {showDate && (
                      <Flex justify="center" my={3}>
                        <Text fontSize="sm" color="gray.500">
                          {dateLabel}
                        </Text>
                      </Flex>
                    )}

                    <Box alignSelf={message?.sender?._id === currentUser?._id ? "flex-end" : "flex-start"} maxW="70%" mb={2}>
                      <Flex direction="column" gap={1}>
                        <Flex align="center" mb={1} justifyContent={message?.sender?._id === currentUser?._id ? "flex-end" : "flex-start"} gap={2}>
                          {message?.sender?._id === currentUser?._id ? (
                            <>
                              <Text fontSize="xs" color="gray.500">
                                You • {formatTime(message.createdAt)}
                              </Text>
                              <Avatar size="xs" name={message.sender.username} />
                            </>
                          ) : (
                            <>
                              <Avatar size="xs" name={message.sender.username} />
                              <Text fontSize="xs" color="gray.500">
                                {message.sender.username} • {formatTime(message.createdAt)}
                              </Text>
                            </>
                          )}
                        </Flex>

                        <Box bg={message?.sender?._id === currentUser?._id ? "blue.500" : "white"} color={message?.sender?._id === currentUser?._id ? "white" : "gray.800"} p={3} borderRadius="lg" boxShadow="sm">
                          <Text>{message.content}</Text>
                        </Box>
                      </Flex>
                    </Box>
                  </React.Fragment>
                );
              })}
              {renderTypingIndicator()}
              <div ref={messagesEndRef} />
            </VStack>

            {/* Message Input */}
            <Box p={4} bg="white" borderTop="1px solid" borderColor="gray.200" position="relative" zIndex="1">
              <InputGroup size="lg">
                <Input
                  value={newMessages}
                  onChange={handleTyping}
                  placeholder="Type your message..."
                  pr="4.5rem"
                  bg="gray.50"
                  border="none"
                  _focus={{
                    boxShadow: "none",
                    bg: "gray.100",
                  }}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      sendMessages();
                    }
                  }}
                />
                <InputRightElement width="4.5rem">
                  <Button
                    h="1.75rem"
                    size="sm"
                    colorScheme="blue"
                    borderRadius="full"
                    _hover={{
                      transform: "translateY(-1px)",
                    }}
                    transition="all 0.2s"
                    onClick={sendMessages}
                  >
                    <Icon as={FiSend} />
                  </Button>
                </InputRightElement>
              </InputGroup>
            </Box>
          </>
        ) : (
          <>
            <Flex h="100%" direction="column" align="center" justify="center" p={8} textAlign="center">
              <Icon as={FiMessageCircle} fontSize="64px" color="gray.300" mb={4} />
              <Text fontSize="xl" fontWeight="medium" color="gray.500" mb={2}>
                Welcome to the Chat
              </Text>
              <Text color="gray.500" mb={2}>
                Select a group from the sidebar to start chatting
              </Text>
            </Flex>
          </>
        )}
      </Box>

      <Box width="260px" position="sticky" right={0} top={0} height="100%" flexShrink={0}>
        {selectedGroup && <UsersList users={connectedUsers} selectedGroup={selectedGroup} handleAccept={handleAccept} handleReject={handleReject} />}
      </Box>
    </Flex>
  );
};

export default ChatArea;

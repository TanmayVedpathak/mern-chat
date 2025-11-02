import { Box, Flex } from "@chakra-ui/react";
import Sidebar from "../components/Sidebar";
import ChatArea from "../components/ChatArea";
import io from "socket.io-client";
import { useEffect, useState } from "react";
import axios from "axios";

const ENDPOINT = import.meta.env.VITE_DOMAIN;

const Chat = () => {
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [socket, setSocket] = useState(null);
  const [groups, setGroups] = useState([]);
  const [userGroups, setUserGroups] = useState([]);

  const userInfo = JSON.parse(localStorage.getItem("userInfo") || {});

  // fetch group by id
  const fetchGroupById = async (groupId) => {
    try {
      const token = userInfo?.token || "";

      const { data } = await axios.get(ENDPOINT + `/api/groups/${groupId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setSelectedGroup(data?.group[0] || []);
    } catch (error) {
      console.log(error);
    }
  };

  // fetch all group
  const fetchGroup = async () => {
    try {
      const token = userInfo?.token || "";

      const { data } = await axios.get(ENDPOINT + "/api/groups/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setGroups(data?.groups || []);

      // get user group id
      const userGroupIds = data?.groups
        ?.filter((group) => {
          return group?.members?.some((member) => member?._id === userInfo?.id);
        })
        .map((group) => group?._id);

      setUserGroups(userGroupIds);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo") || {});
    const newSocket = io(ENDPOINT, {
      auth: { user: userInfo },
    });

    setSocket(newSocket);

    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, []);

  return (
    <Flex h="100vh" direction={{ base: "column", md: "row" }}>
      <Box w={{ base: "100%", md: "300px" }} h={{ base: "auto", md: "100vh" }} borderRight="1px solid" borderColor="gray.200" display={{ base: selectedGroup ? "none" : "block", md: "block" }}>
        <Sidebar socket={socket} setSelectedGroup={setSelectedGroup} fetchGroup={fetchGroup} fetchGroupById={fetchGroupById} groups={groups} userGroups={userGroups} />
      </Box>
      <Box flex="1" display={{ base: selectedGroup ? "block" : "none", md: "block" }}>
        {socket && <ChatArea selectedGroup={selectedGroup} socket={socket} setSelectedGroup={setSelectedGroup} fetchGroup={fetchGroup} />}
      </Box>
    </Flex>
  );
};

export default Chat;

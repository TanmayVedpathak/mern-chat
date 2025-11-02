const socketIo = (io) => {
  //Store connected users with their room information using socket.id as their key
  const connectedUsers = new Map();
  const userSocketMap = new Map();

  //Handle new socket connections
  io.on("connection", (socket) => {
    //Get user from authentication
    const user = socket.handshake.auth.user;
    console.log("User connected", user?.username);

    // store mapping
    if (user?.id) {
      userSocketMap.set(user?.id, socket.id);
    }

    //!START: Join room Handler
    socket.on("join room", (groupId) => {
      //Add socket to the specified room
      socket.join(groupId);

      //Store user and room info in connectedUsers map
      connectedUsers.set(socket.id, { user, room: groupId });

      //Get list of all users currently in the room
      const usersInRoom = Array.from(connectedUsers.values())
        .filter((u) => u.room === groupId)
        .map((u) => u.user);

      // Emit updated users list to all clients in the room
      io.in(groupId).emit("users in room", usersInRoom);

      // Broadcast join notification to all other users in the room
      socket.to(groupId).emit("notification", {
        type: "USER_JOINED",
        message: `${user?.username} has joined`,
        user: user,
      });
    });
    //!END:Join room Handler

    //!START: Leave room Handler
    //Triggered when user manually leaves a room
    socket.on("leave room", (groupId) => {
      console.log(`${user?.username} leaving room:`, groupId);

      //Remove socket from the room
      socket.leave(groupId);

      if (connectedUsers.has(socket.id)) {
        //Remove user from connected users and notify others
        connectedUsers.delete(socket.id);
        socket.to(groupId).emit("user left", user?.id);
      }

      if (user?.id) {
        userSocketMap.delete(user?.id);
      }
    });
    //!END:Leave room Handler

    //!START: New Message Handler
    //Triggered when user sends a new message
    socket.on("new message", (message) => {
      // Broadcast message to all other users in the room
      socket.to(message.groupId).emit("message received", message);
    });
    //!END:New Message Handler

    //!START: Disconnect Handler
    //Triggered when user closes the connection
    socket.on("disconnect", () => {
      console.log(`${user?.username} disconnected`);

      if (connectedUsers.has(socket.id)) {
        // Get user's room info before removing
        const userData = connectedUsers.get(socket.id);

        //Notify others in the room about user's departure
        socket.to(userData.room).emit("user left", user?.id);

        //Remove user from connected users
        connectedUsers.delete(socket.id);
      }

      if (user?.id) {
        userSocketMap.delete(user?.id);
      }
    });
    //!END:Disconnect Handler

    //!START: Typing Indicator
    //Triggered when user starts typing
    socket.on("typing", ({ groupId, username }) => {
      //Broadcast typing status to other users in the room
      socket.to(groupId).emit("user typing", { username });
    });

    socket.on("stop typing", ({ groupId }) => {
      //Broadcast stop typing status to other users in the room
      socket.to(groupId).emit("user stop typing", { username: user?.username });
    });
    //!END:Typing Indicator

    //! 🆕 START: Request Send Event
    socket.on("request send", ({ adminId, groupName }) => {
      const recipientSocketId = userSocketMap.get(String(adminId));

      if (recipientSocketId) {
        io.to(recipientSocketId).emit("request sended", {
          message: `${user?.username} sended you request for group: ${groupName}`,
        });
      }
    });

    //! 🆕 END:  Request Send Event

    //! 🆕 START: Request Accept Event
    socket.on("request accept", ({ recipientId, group }) => {
      const recipientSocketId = userSocketMap.get(String(recipientId));

      if (recipientSocketId) {
        io.to(recipientSocketId).emit("request accepted", {
          group,
          message: `${user?.username} accepted your request`,
        });
      }
    });

    //! 🆕 END:  Request Accept Event

    //! 🆕 START: Request Reject Event
    socket.on("request reject", ({ recipientId, group }) => {
      const recipientSocketId = userSocketMap.get(String(recipientId));

      if (recipientSocketId) {
        io.to(recipientSocketId).emit("request rejected", {
          group,
          message: `${user?.username} rejected your request`,
        });
      }
    });

    //! 🆕 END:  Request Reject Event

    //! 🆕 START: Delete Group Event
    socket.on("delete group", ({ groupId, deletedBy }) => {
      // Notify everyone currently in that room
      io.to(groupId).emit("group deleted", {
        groupId,
        message: `${deletedBy?.username || "An admin"} deleted this group.`,
      });

      // Force all sockets to leave the room
      const clients = io.sockets.adapter.rooms.get(groupId);
      if (clients) {
        for (const clientId of clients) {
          const clientSocket = io.sockets.sockets.get(clientId);
          if (clientSocket) clientSocket.leave(groupId);
        }
      }

      socket.broadcast.emit("notification", {
        type: "GROUP_DELETED",
        title: "Server Notice",
        message: "A global update has been made.",
      });
    });
    //! 🆕 END: Delete Group Event
  });
};

module.exports = socketIo;

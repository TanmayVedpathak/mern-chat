# 💬 MERN Chat App

A real-time chat application built using the **MERN stack (MongoDB, Express, React, Node.js)** and **Socket.io** for instant communication.  
This app allows users to join chat groups, communicate in real time, and see who’s online — all in a clean, modern interface.

---

## 🚀 Features

1. 🔐 **User Authentication**

   - Users must **register** and **log in** to access the chat app.
   - JWT-based authentication ensures security.

2. 👑 **Admin Privileges**

   - Only **admins** can **create** or **delete** groups.

3. 💬 **Group Management**

   - All created groups are visible to every user.
   - Users can **send join requests** to group admins.
   - Admins can **accept** or **reject** join requests.

4. 🧑‍🤝‍🧑 **Group Chat**

   - Once accepted, users can chat with other members in real-time.
   - Messages are persisted in MongoDB.

5. ✍️ **Real-Time Typing Indicator**

   - Shows when a user is typing in the group.

6. 🟢 **Online Users**

   - Displays online members of the current group dynamically.

7. 🧪 **Postman Collection Included**
   - All API routes for `User`, `Group`, and `Message` are provided in the included Postman collection file.
   - File: [`mern-chat.postman_collection.json`](./mern-chat.postman_collection.json)

---

## 🧩 Tech Stack

| Layer          | Technology              |
| :------------- | :---------------------- |
| Frontend       | React, Axios, Chakra UI |
| Backend        | Node.js, Express.js     |
| Database       | MongoDB with Mongoose   |
| Realtime       | Socket.io               |
| Authentication | JWT (JSON Web Token)    |

---

## ⚙️ Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/TanmayVedpathak/mern-chat.git
cd mern-chat
```

### 2. Install Dependencies

You can install dependencies for **both frontend and backend** at once:

```bash
npm run install-all
```

Or install separately if needed:

```bash
# Backend
cd backend
npm install

# Frontend
cd frontend
npm install
```

### 3. Environment Variables

In the `backend` folder, create a `.env` file:

```
MONGO_URI=your_mongo_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000
```

In the `frontend` folder, create a `.env` file:

```
VITE_DOMAIN=backend_endpoint
```

### 4. Run the Application

Run both frontend and backend from the **root directory**:

```bash
npm start
```

> 🟢 This runs your backend in development mode (`npm run dev --prefix backend`).

Or run them individually:

```bash
# Run backend only
npm run server

# Run frontend only
npm run client
```

### 5. Access the App

- Frontend → [http://localhost:5173](http://localhost:5173)
- Backend API → [http://localhost:8080/api](http://localhost:8080/api)

---

## 🧠 API Overview

### 👤 User Routes

| Endpoint              | Method   | Description                       |
| :-------------------- | :------- | :-------------------------------- |
| `/api/users/register` | **POST** | Register a new user               |
| `/api/users/login`    | **POST** | Log in a user and receive a token |

### 👥 Group Routes

| Endpoint                 | Method   | Description                             |
| :----------------------- | :------- | :-------------------------------------- |
| `/api/groups/`           | **POST** | Create a new group _(Admin only)_       |
| `/api/groups/`           | **GET**  | Get all groups                          |
| `/api/groups/:id`        | **GET**  | Get a group by ID                       |
| `/api/groups/:id/join`   | **POST** | Send join request to admin              |
| `/api/groups/:id/accept` | **POST** | Accept user join request _(Admin only)_ |
| `/api/groups/:id/reject` | **POST** | Reject user join request _(Admin only)_ |
| `/api/groups/:id/delete` | **POST** | Delete group _(Admin only)_             |
| `/api/groups/:id/leave`  | **POST** | Leave a group                           |

### 💬 Message Routes

| Endpoint                 | Method   | Description                  |
| :----------------------- | :------- | :--------------------------- |
| `/api/messages/`         | **POST** | Send a message in a group    |
| `/api/messages/:groupId` | **GET**  | Get all messages for a group |

---

## ⚡ Real-Time Events (Socket.io)

| Event                    | Description                                  |
| :----------------------- | :------------------------------------------- |
| `join room`              | User joins a specific group room             |
| `message received`       | Broadcasts new messages to all members       |
| `typing` / `stop typing` | Displays typing indicator                    |
| `group deleted`          | Notifies all members when a group is deleted |
| `online users`           | Updates list of active users in the group    |

---

## 🔌 Socket.io Integration

The app uses **Socket.io** for bi-directional real-time communication between the server and clients.  
Sockets are authenticated during connection and mapped to users, allowing targeted and group-level events.

---

### 🧠 Backend Socket Logic (Server-Side)

Located in:

```
backend/socket.js
```

**Key Responsibilities:**

- Tracks connected users via `connectedUsers` and `userSocketMap`
- Handles joining/leaving rooms
- Broadcasts real-time messages
- Notifies users about group, message, and request changes

**Main Events**

| Event                    | Direction            | Description                                            | Payload                        |
| :----------------------- | :------------------- | :----------------------------------------------------- | :----------------------------- |
| `join room`              | Client → Server      | User joins a specific group chat room                  | `{ groupId }`                  |
| `leave room`             | Client → Server      | User manually leaves a group                           | `{ groupId }`                  |
| `new message`            | Client → Server      | Sends new chat message to the group                    | `{ content, groupId, sender }` |
| `message received`       | Server → Client      | Broadcasts new messages to all members                 | `{ message }`                  |
| `users in room`          | Server → Client      | Sends the updated list of online users in that group   | `[ { _id, username, email } ]` |
| `notification`           | Server → Client      | General broadcast for join/leave/group deletion alerts | `{ type, message, user }`      |
| `typing` / `stop typing` | Bi-Directional       | Indicates when a user starts/stops typing              | `{ groupId, username }`        |
| `request send`           | Client → Server      | Sends join request notification to group admin         | `{ adminId, groupName }`       |
| `request sended`         | Server → Admin       | Notifies admin about a new join request                | `{ message }`                  |
| `request accept`         | Client → Server      | Admin accepts a join request                           | `{ recipientId, group }`       |
| `request accepted`       | Server → Client      | Notifies user that request was accepted                | `{ group, message }`           |
| `request reject`         | Client → Server      | Admin rejects a join request                           | `{ recipientId, group }`       |
| `request rejected`       | Server → Client      | Notifies user that request was rejected                | `{ group, message }`           |
| `delete group`           | Client → Server      | Admin deletes a group                                  | `{ groupId, deletedBy }`       |
| `group deleted`          | Server → All Clients | Informs all connected clients that a group was deleted | `{ groupId, message }`         |

---

### 💻 Frontend Socket Usage (Client-Side)

Located in:

```
frontend/src/components/ChatArea.jsx
```

**Frontend Responsibilities:**

- Joins the room when a group is selected
- Listens for message and user updates
- Shows typing indicators
- Displays toast notifications for join/leave/request/group events
- Automatically cleans up socket listeners on unmount

**Core Listeners in React**

```js
socket.on("message received", handleNewMessage);
socket.on("users in room", updateConnectedUsers);
socket.on("user joined", handleUserJoined);
socket.on("user left", handleUserLeft);
socket.on("user typing", handleTyping);
socket.on("user stop typing", handleStopTyping);
socket.on("request sended", handleRequestSent);
socket.on("request accepted", handleRequestAccepted);
socket.on("request rejected", handleRequestRejected);
socket.on("group deleted", handleGroupDeleted);
socket.on("notification", handleGeneralNotification);
```

**Cleanup**
All socket listeners are removed when the user leaves a group or component unmounts:

```js
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
```

---

### ⚙️ Socket Mapping and User Tracking

- `connectedUsers`: Maps `socket.id → { user, room }`
- `userSocketMap`: Maps `user.id → socket.id`
- Ensures that targeted events (like request acceptance) are sent only to the intended recipient

---

### 🧩 Example Flow

**1. User joins a group**

- Client → emits `join room`
- Server → stores connection, broadcasts `users in room` + `notification`

**2. User sends a message**

- Client → emits `new message`
- Server → broadcasts `message received` to everyone in the room

**3. Admin deletes a group**

- Client (Admin) → emits `delete group`
- Server → emits `group deleted` to all members and removes sockets from the room

---

## 📦 Folder Structure

```
mern-chat/
│
├── backend/
│   ├── models/
│   ├── routes/
│   ├── controllers/
│   ├── socket/
│   ├── server.js
│   └── .env
│
├── frontend/
│   ├── src/
│   ├── components/
│   ├── pages/
│   └── App.jsx
│
├── mern-chat.postman_collection.json
└── package.json
```

---

## 🧑‍💻 Author

**Tanmay Vedpathak**  
📧 [tanmayvedpathak19@gmail.com]  
🌐 [https://github.com/TanmayVedpathak]

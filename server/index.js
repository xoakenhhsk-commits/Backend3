const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json()); // Allow JSON body

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// --- In-Memory Database (MVP) ---
// Note: Data is lost on server restart. For production, use MongoDB/Postgres.
const users = {}; // Key: phoneNumber, Value: { phone, name, dob, avatar, friends: [], requests: [] }
const posts = []; // { id, authorPhone, content, image, timestamp, likes: [] }
const userSockets = {}; // Key: phoneNumber, Value: socketId

io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id} (v2.0 Social)`);
  let currentUser = null;

  // --- Auth ---
  socket.on("register_login", (data) => {
    // data: { phone, name, dob }
    const { phone, name, dob } = data;
    if (!users[phone]) {
      // Register
      users[phone] = {
        phone,
        name,
        dob,
        avatar: `https://ui-avatars.com/api/?name=${name}&background=random`,
        friends: [],
        requests: []
      };
    }
    // Login
    currentUser = users[phone];
    userSockets[phone] = socket.id;
    socket.emit("login_success", currentUser);

    // Send initial data
    socket.emit("friend_update", currentUser.friends);
    socket.emit("request_update", currentUser.requests);
    socket.emit("feed_update", getVisiblePosts(phone));
  });

  // --- Friend System ---
  socket.on("send_friend_request", (targetPhone) => {
    if (currentUser && users[targetPhone]) {
      if (!users[targetPhone].requests.includes(currentUser.phone) &&
        !users[targetPhone].friends.includes(currentUser.phone)) {

        users[targetPhone].requests.push(currentUser.phone);

        // Notify target if online
        const targetSocket = userSockets[targetPhone];
        if (targetSocket) {
          io.to(targetSocket).emit("request_update", users[targetPhone].requests);
        }
      }
    }
  });

  socket.on("accept_friend", (requesterPhone) => {
    if (currentUser && users[requesterPhone]) {
      // Add to both friend lists
      currentUser.friends.push(requesterPhone);
      users[requesterPhone].friends.push(currentUser.phone);

      // Remove from requests
      currentUser.requests = currentUser.requests.filter(p => p !== requesterPhone);

      // Notify both
      socket.emit("friend_update", currentUser.friends);
      socket.emit("request_update", currentUser.requests);

      const targetSocket = userSockets[requesterPhone];
      if (targetSocket) {
        io.to(targetSocket).emit("friend_update", users[requesterPhone].friends);
      }
    }
  });

  // --- Chat ---
  socket.on("join_room", (room) => {
    socket.join(room);
  });

  socket.on("send_message", (data) => {
    // data: { room, message, type, ... }
    socket.to(data.room).emit("receive_message", data);
  });

  // --- Social Feed ---
  socket.on("create_post", (data) => {
    if (!currentUser) return;
    const newPost = {
      id: Date.now(),
      author: currentUser,
      content: data.content,
      image: data.image,
      timestamp: new Date().toISOString(),
      likes: []
    };
    posts.unshift(newPost); // Add to top

    // Broadcast to author and all friends
    const audience = [currentUser.phone, ...currentUser.friends];
    audience.forEach(phone => {
      const socketId = userSockets[phone];
      if (socketId) {
        io.to(socketId).emit("feed_update", getVisiblePosts(phone));
      }
    });
  });

  socket.on("disconnect", () => {
    if (currentUser) {
      delete userSockets[currentUser.phone];
    }
    console.log("User Disconnected", socket.id);
  });
});

// Helper to get posts visible to a user (own posts + friends' posts)
function getVisiblePosts(phone) {
  const user = users[phone];
  if (!user) return [];

  // Filter posts specific to friends logic if needed, 
  // for now we just show posts from friends or self
  return posts.filter(post =>
    post.author.phone === phone || user.friends.includes(post.author.phone)
  );
}

app.get("/", (req, res) => {
  res.send("Social Backend Running...");
});

// Expose users for debug (optional)
app.get("/users", (req, res) => {
  res.json(users);
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`SERVER RUNNING ON PORT ${PORT}`);
});

const express = require("express");
const dotenv = require("dotenv");
const path = require("path");
const cors = require("cors");
const cookieParser  = require("cookie-parser");
const http = require("http");
const { Server } = require("socket.io");

const routesApi = require("./api/routes/index.route");

dotenv.config();

const app = express();
const server = http.createServer(app);

// Setup Socket.IO với CORS
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST"]
  }
});

app.use(cors({
  origin: "http://localhost:3000", // URL của frontend
  credentials: true, // Cho phép gửi cookie
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"], // Các phương thức được phép
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cấu hình lấy được cookie
app.use(cookieParser());

// Lưu io instance vào app để controllers có thể sử dụng
app.set('io', io);

const port = process.env.PORT || 5000;

app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));

// API Routes
routesApi(app);

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // User join room (để nhận tin nhắn cho conversations của họ)
  socket.on('join', (userId) => {
    socket.join(`user_${userId}`);
    console.log(`User ${userId} joined room user_${userId}`);
  });

  // Join conversation room (để nhận tin nhắn real-time cho conversation cụ thể)
  socket.on('join_conversation', (conversationId) => {
    socket.join(`conversation_${conversationId}`);
    console.log(`Socket ${socket.id} joined conversation_${conversationId}`);
  });

  // Leave conversation room
  socket.on('leave_conversation', (conversationId) => {
    socket.leave(`conversation_${conversationId}`);
    console.log(`Socket ${socket.id} left conversation_${conversationId}`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

server.listen(port, () => {
  console.log(`Server đang chạy tại http://localhost:${port}`);
});

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");

const serviceRoutes = require("./routes/serviceRoutes");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const projectRoutes = require("./routes/projectRoutes");
const serviceRequestRoutes = require("./routes/serviceRequestRoutes");
const portfolioRoutes = require("./routes/portfolioRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(",").map((item) => item.trim()) : true, methods: ["GET", "POST"] },
});
app.set("io", io);
const adminRoutes = require("./routes/adminRoutes");
const meetingRoutes = require("./routes/meetingRoutes");
const chatRoutes = require("./routes/chatRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const { safepayWebhook } = require("./controllers/paymentController");
const { authorizeSocketRequest } = require("./controllers/chatController");

// Middleware
app.use(cors());
app.post("/api/payments/webhook", express.raw({ type: "application/json" }), safepayWebhook);
app.use(express.json());

// API Routes
app.use("/api/services", serviceRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/projects", projectRoutes);
app.use(
  "/api/service-requests",
  serviceRequestRoutes
);
app.use("/api/portfolios", portfolioRoutes);

app.use(
  "/api/reviews",
  reviewRoutes
);
app.use("/api/notifications", notificationRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/meetings", meetingRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/payments", paymentRoutes);

// Connect MongoDB
connectDB();

io.use((socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("Authentication required"));
    socket.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    next(new Error("Invalid or expired token"));
  }
});

io.on("connection", (socket) => {
  socket.on("chat:join", async (requestId, acknowledge) => {
    try {
      const result = await authorizeSocketRequest(requestId, socket.user);
      if (result.error) {
        if (typeof acknowledge === "function") acknowledge({ ok: false, message: result.error.message });
        return;
      }
      socket.join(`request:${requestId}`);
      if (typeof acknowledge === "function") acknowledge({ ok: true });
    } catch {
      if (typeof acknowledge === "function") acknowledge({ ok: false, message: "Unable to join this conversation." });
    }
  });
});

// Test Route
app.get("/", (req, res) => {
  res.json({
    message: "ArchLink Pakistan API is running",
  });
});

// Server
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

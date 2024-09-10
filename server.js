require("dotenv").config();
require("./middlewares/deleteOldPhotos");
const express = require("express");
const cors = require("cors");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const scheduleRoutes = require("./routes/scheduleRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes"); // Import appointment routes
const blogRoutes = require("./routes/blogRoutes");
const chatRoute = require("./routes/chatRoutes");
const messageRoute = require("./routes/messageRoutes");
const feedbackRoute = require("./routes/FeedbackRoutes");
const socketServer = require("./socket/socket");

const app = express();

// CORS configuration
const allowedOrigins = [
  "http://localhost:3000",
  "https://backend-production-c8da.up.railway.app",
  "https://frontend-loigens-projects.vercel.app",
  "https://frontend-eight-alpha-64.vercel.app/",
];

const corsOptions = {
  origin: allowedOrigins,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Origin",
    "X-Requested-With",
    "Content-Type",
    "Accept",
    "Authorization",
  ],
};

app.use(cors(corsOptions));

// Middleware to parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Logging middleware for debugging
app.use((req, res, next) => {
  console.log("Request Method:", req.method);
  console.log("Request URL:", req.originalUrl);
  console.log("Request Headers:", req.headers);
  next();
});

// Connect to the database
connectDB();

// Session store setup
const sessionStore = MongoStore.create({
  mongoUrl: process.env.DB_URI,
  collectionName: "sessions",
  ttl: 7 * 24 * 60 * 60, // 1 week
});

// Session configuration
app.use(
  session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
      secure: process.env.NODE_ENV === "production", // Enforce HTTPS
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    },
  })
);

// Route handlers
app.use("/auth", authRoutes);
app.use("/user", userRoutes);
app.use("/schedules", scheduleRoutes);
app.use("/Appointments/api", appointmentRoutes);
app.use("/blog", blogRoutes);
app.use("/api/chats", chatRoute);
app.use("/api/messages", messageRoute);
app.use("/Feedback", feedbackRoute);

// Set view engine
app.set("view engine", "ejs");

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err.stack);
  res.status(500).send("Something broke!");
});

// Start the server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Initialize socket server
socketServer(server);

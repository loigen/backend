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
const appointmentRoutes = require("./routes/appointmentRoutes");
const blogRoutes = require("./routes/blogRoutes");
const chatRoute = require("./routes/chatRoutes");
const messageRoute = require("./routes/messageRoutes");
const feedbackRoute = require("./routes/FeedbackRoutes");
const socketServer = require("./socket/socket");

const app = express();

const allowedOrigins = [
  "http://localhost:3000",
  "https://backend-production-c8da.up.railway.app",
  "https://frontend-loigens-projects.vercel.app",
  "https://frontend-eight-alpha-64.vercel.app/",
];

const corsOptions = {
  origin: allowedOrigins,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: [
    "Origin",
    "X-Requested-With",
    "Content-Type",
    "Accept",
    "Authorization",
  ],
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  console.log("Request Method:", req.method);
  console.log("Request URL:", req.originalUrl);
  console.log("Request Headers:", req.headers);
  next();
});

connectDB();

const sessionStore = MongoStore.create({
  mongoUrl: process.env.DB_URI,
  collectionName: "sessions",
  ttl: 7 * 24 * 60 * 60,
});

app.use(
  session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    },
  })
);

app.use("/auth", authRoutes);
app.use("/user", userRoutes);
app.use("/schedules", scheduleRoutes);
app.use("/Appointments/api", appointmentRoutes);
app.use("/blog", blogRoutes);
app.use("/api/chats", chatRoute);
app.use("/api/messages", messageRoute);
app.use("/Feedback", feedbackRoute);

app.set("view engine", "ejs");

app.use((err, req, res, next) => {
  console.error("Error:", err.stack);
  res.status(500).send("Something broke!");
});

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

socketServer(server);

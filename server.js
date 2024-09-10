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
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const allowedOrigins = [
  "http://localhost:3000",
  "https://safeplacev2.vercel.app",
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: "GET,HEAD,OPTIONS,POST,PUT,DELETE,PATCH",
    allowedHeaders:
      "Origin, X-Requested-With, Content-Type, Accept, Authorization, Access-Control-Allow-Origin",
  })
);

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,HEAD,OPTIONS,POST,PUT,DELETE,PATCH"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );

  if (req.method === "OPTIONS") {
    res.sendStatus(200);
  } else {
    next();
  }
});

const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET;

connectDB();

const sessionStore = MongoStore.create({
  mongoUrl: process.env.DB_URI,
  collectionName: "sessions",
  ttl: 7 * 24 * 60 * 60,
});

app.use(
  session({
    secret: JWT_SECRET,
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

const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

socketServer(server);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

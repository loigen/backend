const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

const authenticateToken = (req, res, next) => {
  const token = req.session.token;
  console.log("Session token:", token);

  if (!token) {
    return res.sendStatus(401);
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      if (err.name === "TokenExpiredError") {
        console.log("Token expired:", err);
        return res
          .status(401)
          .json({ message: "Session expired, please login again." });
      }
      console.log("Token verification failed:", err);
      return res.sendStatus(403);
    }
    console.log("User authenticated:", user);
    req.user = user;
    next();
  });
};

module.exports = authenticateToken;

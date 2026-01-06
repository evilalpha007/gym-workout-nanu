const jwt = require("jsonwebtoken");

const generateTokenAndSetCookie = (userId, res) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }

  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });

  res.cookie("jwt", token, {
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    httpOnly: true, // prevent XSS attacks
    sameSite: process.env.NODE_ENV === "development" ? "lax" : "none", // support cross-site cookies in prod
    secure: process.env.NODE_ENV === "development" ? false : true, // required for sameSite: "none"
  });
};

module.exports = generateTokenAndSetCookie;

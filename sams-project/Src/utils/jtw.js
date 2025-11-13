import jwt from "jsonwebtoken";

const SECRET_KEY = "your_super_secret_key"; // keep it safe in env variable

export const generateToken = (user) => {
  // user is an object like { id, username, role }
  return jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    SECRET_KEY,
    { expiresIn: "1h" } // token valid for 1 hour
  );
};

export const verifyToken = (token) => {
  return jwt.verify(token, SECRET_KEY);
};

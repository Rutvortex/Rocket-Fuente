import jwt from 'jsonwebtoken';

export const generateToken = (payload, expiresIn = process.env.JWT_EXPIRES_IN) => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
};

export const generateRefreshToken = (payload, expiresIn = process.env.JWT_REFRESH_EXPIRES_IN) => {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn });
};

export const verifyToken = (token, secret = process.env.JWT_SECRET) => {
  return jwt.verify(token, secret);
};
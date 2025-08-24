import dotenv from "dotenv";
dotenv.config();

export const appConfig = {
  port: process.env.PORT || 3000,
  dbUrl: process.env.DB_URL,
  jwtSecret: process.env.JWT_SECRET,
  accessTokenExpiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN,
  refreshTokenExpiredDays: process.env.REFRESH_TOKEN_EXPIRES_DAYS,
};

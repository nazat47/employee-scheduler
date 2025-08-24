import jwt from "jsonwebtoken";
import { appConfig } from "../config";
import { Response } from "express";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { RefreshToken, RefreshTokenDoc } from "../models/refresh-token";
import { UserPayload } from "../types/user-payload";
import { Employee, EmployeeDoc } from "../models/employee";

export class AuthUtils {
  static async hashPassword(password: string) {
    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(password, salt);
    return hashedPass;
  }

  static async comparePassword({
    password,
    candidatePassword,
  }: {
    password: string;
    candidatePassword: string;
  }) {
    return await bcrypt.compare(candidatePassword, password);
  }

  static createTokenPayload(user: EmployeeDoc): UserPayload {
    return { id: user?._id as string, role: user.role };
  }

  static createAccessToken(user: UserPayload) {
    return jwt.sign(user, appConfig.jwtSecret!, {
      expiresIn: Number(appConfig.accessTokenExpiresIn),
    });
  }

  static generateRefreshToken() {
    return crypto.randomBytes(64).toString("hex");
  }

  static async createOrUpdateRefreshToken({ userId }: { userId: string }) {
    const refreshToken = this.generateRefreshToken();
    const expiresAt = new Date();
    expiresAt.setDate(
      expiresAt.getDate() + Number(appConfig.refreshTokenExpiredDays)
    );

    let savedToken: RefreshTokenDoc | null;

    const refreshTokenExists = await RefreshToken.findOne({ userId });
    if (refreshTokenExists) {
      savedToken = await RefreshToken.findOneAndUpdate(
        { userId },
        {
          refreshToken,
          expiresAt,
        },
        { new: true }
      );
    } else {
      savedToken = await RefreshToken.create({
        refreshToken,
        userId,
        expiresAt,
      });
    }

    return savedToken!.refreshToken;
  }

  static validateAccessToken(token: string) {
    return jwt.verify(token, appConfig.jwtSecret!);
  }

  static async validateRefreshToken(token: string) {
    const refreshToken = await RefreshToken.findOne({ refreshToken: token });
    if (!refreshToken) {
      return { isValid: false };
    }

    const userExists = await Employee.findById(refreshToken.userId);

    if (!userExists) {
      await RefreshToken.findOneAndDelete({ refreshToken });
      return { isValid: false };
    }

    return { isValid: true, refreshToken, employee: userExists };
  }

  static attachCookies({
    res,
    refreshToken,
  }: {
    res: Response;
    refreshToken: string;
  }) {
    res.cookie("refresh_token", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 60 * 60 * 24 * 30 * 1000,
    });
  }

  static clearCookie(res: Response) {
    res.clearCookie("refresh_token", {
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });
  }
}

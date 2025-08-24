import { Request, Response } from "express";
import {
  regenerateTokenService,
  signInService,
  signUpService,
} from "../services/auth-service";
import { AuthUtils } from "../utils/auth-utils";
import { RefreshToken } from "../models/refresh-token";

export const signUp = async (req: Request, res: Response) => {
  const data = req.body;

  const { employee } = await signUpService(data);

  return res.status(201).json({ employee });
};

export const signIn = async (req: Request, res: Response) => {
  const data = req.body;
  const { employee, accessToken, refreshToken } = await signInService(data);

  AuthUtils.attachCookies({ res, refreshToken });

  return res.status(201).json({ employee, accessToken });
};

export const logout = async (req: Request, res: Response) => {
  const refreshToken = req.cookies.__$$amradvct_refreshtoken$$__;

  if (refreshToken) {
    await RefreshToken.findOneAndDelete({ refreshToken });
  }

  AuthUtils.clearCookie(res);

  return res.status(204).json({});
};

export const regenerateToken = async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refresh_token;
  const {
    employee,
    accessToken,
    refreshToken: newRefreshToken,
  } = await regenerateTokenService(refreshToken, res);

  AuthUtils.attachCookies({ res, refreshToken: newRefreshToken });

  return res.status(200).json({ employee, accessToken });
};

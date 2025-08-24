import { NextFunction, Request, Response } from "express";
import { ForbiddenError, UnauthorizedError } from "../errors";
import { AuthUtils } from "../utils/auth-utils";
import { ExtendedRequest } from "../types/extended-request";
import { Role } from "../models/employee";

export const authenticate = (
  req: ExtendedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    let token: string | null = null;
    const header = req.headers.authorization;

    if (!header || !header.startsWith("Bearer ")) {
      throw new ForbiddenError(
        "You are not authorized to access the route. Missing credentials."
      );
    }

    token = header.split(" ")[1];

    const decodedData = AuthUtils.validateAccessToken(token);
    req.user = decodedData as { id: string; role: Role };
    next();
  } catch (error: any) {
    if (error?.name === "TokenExpiredError") {
      throw new UnauthorizedError("Access token expired. Please login again.");
    }
    if (error?.name === "JsonWebTokenError") {
      throw new UnauthorizedError("Access denied. Invalid token");
    }
    throw error;
  }
};

export const authorizePermissions = (roles: Role[]) => {
  return (req: ExtendedRequest, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user!.role)) {
      throw new UnauthorizedError(
        "You are not authorized to access the route."
      );
    }

    next();
  };
};

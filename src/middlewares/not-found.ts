import { NextFunction, Request, Response } from "express";

export const routeNotFound = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  res.status(404).send("Route not found");
};

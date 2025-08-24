import { Request, Response } from "express";
import { approveTimeOffService } from "../services/timeoff-service";

export const createTimeOffRequest = async (req: Request, res: Response) => {};

export const approveTimeoffRequest = async (req: Request, res: Response) => {
  const { id } = req.params;
  const timeOff = await approveTimeOffService({ id });
  return res.status(200).json(timeOff);
};

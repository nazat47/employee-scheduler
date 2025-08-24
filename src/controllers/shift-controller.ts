import { Request, Response } from "express";
import { assignEmployeesService } from "../services/shift-service";

export const createShift = async (req: Request, res: Response) => {};

export const assignEmployees = async (req: Request, res: Response) => {
  const { id, employeeId } = req.params;
  const shift = await assignEmployeesService({
    shiftId: id,
    empId: employeeId,
  });
  return res.status(201).json(shift);
};

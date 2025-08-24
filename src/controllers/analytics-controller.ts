import { Request, Response } from "express";
import {
  getAnalysisService,
  getCoverageService,
  getEmployeeWorkloadService,
} from "../services/analytics-service";

export const getEmployeeWorkload = async (req: Request, res: Response) => {
  const { employeeId } = req.params;
  const { startDate, endDate } = req.query;
  const employeeWorkload = await getEmployeeWorkloadService({
    employeeId: employeeId as string,
    startDate: startDate as string,
    endDate: endDate as string,
  });

  return res.status(200).json(employeeWorkload);
};

export const getCoverage = async (req: Request, res: Response) => {
  const { id, date, location, team, page, limit } = req.query;
  const { shifts, pagination } = await getCoverageService({
    id: id as string,
    date: date as string,
    location: location as string,
    team: team as string,
    page: Number(page ?? 1),
    limit: Number(limit ?? 10),
  });
  return res.status(200).json({ shifts, pagination });
};

export const getAnalysis = async (req: Request, res: Response) => {
  const { date, location } = req.query;
  const analysis = await getAnalysisService({
    date: date as string,
    location: location as string,
  });
  return res.status(200).json(analysis);
};
